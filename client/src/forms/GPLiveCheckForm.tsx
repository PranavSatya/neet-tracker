import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Radio } from "lucide-react";
import { Link } from "wouter";

const gpLiveCheckSchema = z.object({
  gpName: z.string().min(1, "GP Name is required"),
  mandal: z.string().min(1, "Mandal is required"),
  ttNumber: z.string().min(1, "TT Number is required"),
  checkDate: z.string().min(1, "Date of Check is required"),
  status: z.string().min(1, "Status is required"),
  remarks: z.string().min(5, "Remarks must be at least 5 characters"),
  signalStrength: z.string().min(1, "Signal Strength is required"),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

type GPLiveCheckFormData = z.infer<typeof gpLiveCheckSchema>;

export default function GPLiveCheckForm() {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<GPLiveCheckFormData>({
    resolver: zodResolver(gpLiveCheckSchema),
    defaultValues: {
      gpName: "",
      mandal: "",
      ttNumber: "",
      checkDate: "",
      status: "",
      remarks: "",
      signalStrength: "",
    },
  });

  const onSubmit = async (data: GPLiveCheckFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "gp_live_check"), {
        ...data,
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date(),
        activityType: "GP Live Check"
      });

      setShowSuccess(true);
      toast({
        title: "Success!",
        description: "GP Live Check record submitted successfully",
      });

      setTimeout(() => {
        setShowSuccess(false);
        form.reset();
      }, 2000);
    } catch (error) {
      console.error("Error submitting GP Live Check:", error);
      toast({
        title: "Error",
        description: "Failed to submit GP Live Check record",
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
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <Radio className="text-purple-600 h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">GP Live Check Form</h2>
                  <p className="text-slate-600">Real-time monitoring and verification of systems</p>
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="gpName">GP Name</Label>
                    <Input
                      id="gpName"
                      placeholder="GP Station Name"
                      {...form.register("gpName")}
                      className="mt-2"
                    />
                    {form.formState.errors.gpName && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.gpName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="mandal">Mandal</Label>
                    <Input
                      id="mandal"
                      placeholder="Mandal Name"
                      {...form.register("mandal")}
                      className="mt-2"
                    />
                    {form.formState.errors.mandal && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.mandal.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="ttNumber">TT Number</Label>
                    <Input
                      id="ttNumber"
                      placeholder="TT-001"
                      {...form.register("ttNumber")}
                      className="mt-2"
                    />
                    {form.formState.errors.ttNumber && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.ttNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="checkDate">Date of Check</Label>
                    <Input
                      id="checkDate"
                      type="date"
                      {...form.register("checkDate")}
                      className="mt-2"
                    />
                    {form.formState.errors.checkDate && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.checkDate.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="status">Status (Live / Not Live)</Label>
                    <Select onValueChange={(value) => form.setValue("status", value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="live">Live</SelectItem>
                        <SelectItem value="not-live">Not Live</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.status && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.status.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="signalStrength">Signal Strength</Label>
                    <Input
                      id="signalStrength"
                      placeholder="Strong / Medium / Weak"
                      {...form.register("signalStrength")}
                      className="mt-2"
                    />
                    {form.formState.errors.signalStrength && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.signalStrength.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    placeholder="Additional observations and remarks..."
                    rows={4}
                    {...form.register("remarks")}
                    className="mt-2"
                  />
                  {form.formState.errors.remarks && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.remarks.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="photo">Upload Network Screen Photo</Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="mt-2"
                    />
                  </div>

                  <div className="flex flex-col">
                    <Label>GPS Location</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="mt-2 w-fit"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition((position) => {
                            form.setValue("lat" as any, position.coords.latitude);
                            form.setValue("lng" as any, position.coords.longitude);
                            toast({
                              title: "GPS Location Captured",
                              description: `Lat: ${position.coords.latitude.toFixed(6)}, Lng: ${position.coords.longitude.toFixed(6)}`,
                            });
                          });
                        }
                      }}
                    >
                      Get GPS Location
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className={`bg-purple-600 hover:bg-purple-700 ${showSuccess ? 'bg-purple-600 hover:bg-purple-700' : ''} transition-all duration-300`}
                  >
                    {loading ? "Submitting..." : showSuccess ? "✓ Submitted!" : "Submit Check"}
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