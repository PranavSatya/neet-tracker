import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Camera, MapPin, Clock } from "lucide-react";
import { Link } from "wouter";
import LiveCameraCapture from "@/components/LiveCameraCapture";

const punchInSchema = z.object({
  photoData: z.object({
    photoId: z.string(),
    timestamp: z.string(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    base64Image: z.string(),
  }).nullable().refine((data) => data !== null, "Photo with GEO tag is required"),
  district: z.string().min(1, "District is required"),
  clusterBaseLocation: z.string().min(1, "Cluster/Base Location is required"),
  date: z.string().min(1, "Date is required"),
  engineerName: z.string().min(1, "Engineer Name/FRT Team is required"),
  startReading: z.number().min(0, "Start reading must be positive"),
  typeOfActivity: z.enum(["PM", "CM", "GP Survey", "CR", "Patrolling"]),
  endReading: z.number().optional(),
  totalKM: z.number().optional(),
});

type PunchInFormData = z.infer<typeof punchInSchema>;

export default function PunchInForm() {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<PunchInFormData>({
    resolver: zodResolver(punchInSchema),
    defaultValues: {
      photoData: null,
      district: "",
      clusterBaseLocation: "",
      date: new Date().toISOString().split('T')[0],
      engineerName: user?.displayName || user?.email?.split('@')[0] || "",
      startReading: 0,
      typeOfActivity: "PM",
    },
  });

  const handlePhotoCapture = (photoData: any) => {
    form.setValue("photoData", photoData);
  };

  const onSubmit = async (data: PunchInFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "punch_in"), {
        ...data,
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date(),
        submittedAt: new Date().toISOString(),
      });

      setShowSuccess(true);
      toast({
        title: "Success!",
        description: "Punch-in record submitted successfully",
      });

      setTimeout(() => {
        setShowSuccess(false);
        form.reset();
      }, 2000);
    } catch (error) {
      console.error("Error submitting punch-in:", error);
      toast({
        title: "Error",
        description: "Failed to submit punch-in record",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/activity-selector">
            <Button variant="outline" className="mb-4">
              ← Back to Activities
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <Clock className="text-blue-600 h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Daily Punch-In</h2>
                  <p className="text-slate-600">Start your daily field activities</p>
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Photo with GEO Tag - Mandatory */}
                <div>
                  <LiveCameraCapture
                    label="Punch-In Photo with GEO Tag"
                    onCapture={handlePhotoCapture}
                    required
                  />
                  {form.formState.errors.photoData && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.photoData.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="district">District *</Label>
                    <Input
                      id="district"
                      placeholder="Enter district"
                      {...form.register("district")}
                      className="mt-2"
                    />
                    {form.formState.errors.district && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.district.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="clusterBaseLocation">Cluster / Base Location *</Label>
                    <Input
                      id="clusterBaseLocation"
                      placeholder="Enter cluster/base location"
                      {...form.register("clusterBaseLocation")}
                      className="mt-2"
                    />
                    {form.formState.errors.clusterBaseLocation && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.clusterBaseLocation.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      {...form.register("date")}
                      className="mt-2"
                    />
                    {form.formState.errors.date && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.date.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="engineerName">Engineer Name / FRT Team *</Label>
                    <Input
                      id="engineerName"
                      placeholder="Engineer/Team name"
                      {...form.register("engineerName")}
                      className="mt-2"
                    />
                    {form.formState.errors.engineerName && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.engineerName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="startReading">FRT Team Start Reading (km) *</Label>
                    <Input
                      id="startReading"
                      type="number"
                      placeholder="0"
                      {...form.register("startReading", { valueAsNumber: true })}
                      className="mt-2"
                    />
                    {form.formState.errors.startReading && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.startReading.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="typeOfActivity">Type of Activity *</Label>
                    <Select onValueChange={(value) => form.setValue("typeOfActivity", value as any)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select activity type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PM">PM - Preventive Maintenance</SelectItem>
                        <SelectItem value="CM">CM - Corrective Maintenance</SelectItem>
                        <SelectItem value="GP Survey">GP Survey - GP Live Check</SelectItem>
                        <SelectItem value="CR">CR - Change Request</SelectItem>
                        <SelectItem value="Patrolling">Patrolling - Patrol Activity</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.typeOfActivity && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.typeOfActivity.message}</p>
                    )}
                  </div>
                </div>

                {/* End of Day Fields */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">End of Day (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="endReading">End Reading at Base (km)</Label>
                      <Input
                        id="endReading"
                        type="number"
                        placeholder="End odometer reading"
                        {...form.register("endReading", { valueAsNumber: true })}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="totalKM">Total KM Travelled</Label>
                      <Input
                        id="totalKM"
                        type="number"
                        placeholder="Calculated automatically"
                        {...form.register("totalKM", { valueAsNumber: true })}
                        className="mt-2"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={loading || !form.watch("photoData")}
                    className={`bg-blue-600 hover:bg-blue-700 ${showSuccess ? 'bg-green-600 hover:bg-green-700' : ''} transition-all duration-300`}
                  >
                    {loading ? "Submitting..." : showSuccess ? "✓ Punched In!" : "Punch In"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => form.reset()}>
                    Reset Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}