import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Wrench } from "lucide-react";
import { Link } from "wouter";

const correctiveSchema = z.object({
  faultID: z.string().min(1, "Fault ID is required"),
  faultDescription: z.string().min(10, "Fault Description must be at least 10 characters"),
  siteName: z.string().min(1, "Site Name is required"),
  reportDate: z.string().min(1, "Date of Report is required"),
  actionTaken: z.string().min(10, "Corrective Action Taken must be at least 10 characters"),
  technicianName: z.string().min(1, "Technician Name is required"),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

type CorrectiveFormData = z.infer<typeof correctiveSchema>;

export default function CorrectiveForm() {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<CorrectiveFormData>({
    resolver: zodResolver(correctiveSchema),
    defaultValues: {
      faultID: "",
      faultDescription: "",
      siteName: "",
      reportDate: "",
      actionTaken: "",
      technicianName: "",
    },
  });

  const onSubmit = async (data: CorrectiveFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "corrective_maintenance"), {
        ...data,
        userId: user.uid,
        userEmail: user.email,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setShowSuccess(true);
      form.reset();
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

      toast({
        title: "Success!",
        description: "Corrective maintenance issue reported successfully.",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to submit the form. Please try again.",
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
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                  <Wrench className="text-red-600 h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Corrective Maintenance Form</h2>
                  <p className="text-slate-600">Report and track corrective maintenance issues</p>
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="faultID">Fault ID</Label>
                    <Input
                      id="faultID"
                      placeholder="FLT-2024-001"
                      {...form.register("faultID")}
                      className="mt-2"
                    />
                    {form.formState.errors.faultID && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.faultID.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      placeholder="Production Site A"
                      {...form.register("siteName")}
                      className="mt-2"
                    />
                    {form.formState.errors.siteName && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.siteName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="reportDate">Date of Report</Label>
                    <Input
                      id="reportDate"
                      type="date"
                      {...form.register("reportDate")}
                      className="mt-2"
                    />
                    {form.formState.errors.reportDate && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.reportDate.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="technicianName">Technician Name</Label>
                    <Input
                      id="technicianName"
                      placeholder="Jane Doe"
                      {...form.register("technicianName")}
                      className="mt-2"
                    />
                    {form.formState.errors.technicianName && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.technicianName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="faultDescription">Fault Description</Label>
                  <Textarea
                    id="faultDescription"
                    placeholder="Describe the fault and symptoms..."
                    rows={4}
                    {...form.register("faultDescription")}
                    className="mt-2"
                  />
                  {form.formState.errors.faultDescription && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.faultDescription.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="actionTaken">Corrective Action Taken</Label>
                  <Textarea
                    id="actionTaken"
                    placeholder="Describe the corrective actions taken..."
                    rows={4}
                    {...form.register("actionTaken")}
                    className="mt-2"
                  />
                  {form.formState.errors.actionTaken && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.actionTaken.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="beforePhoto">Upload Before Photo</Label>
                    <Input
                      id="beforePhoto"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="afterPhoto">Upload After Photo</Label>
                    <Input
                      id="afterPhoto"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="mt-2"
                    />
                  </div>
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

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className={`bg-red-600 hover:bg-red-700 ${showSuccess ? 'bg-green-600 hover:bg-green-700' : ''} transition-all duration-300`}
                  >
                    {loading ? "Reporting..." : showSuccess ? "✓ Reported!" : "Report Issue"}
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
