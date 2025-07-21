import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Package } from "lucide-react";
import { Link } from "wouter";

const changeRequestSchema = z.object({
  mandalName: z.string().min(1, "Mandal Name is required"),
  ringName: z.string().min(1, "Ring Name is required"),
  gpSpanName: z.string().min(1, "GP Span Name is required"),
  changeRequestNo: z.string().min(1, "Change Request Number is required"),
  reasonForActivity: z.string().min(1, "Reason for Activity is required"),
  
  // Material Consumed
  materialConsumedOFC: z.number().min(0).optional(),
  materialConsumedPoles: z.number().int().min(0).optional(),
});

type ChangeRequestFormData = z.infer<typeof changeRequestSchema>;

export default function ChangeRequestMaintenanceForm() {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<ChangeRequestFormData>({
    resolver: zodResolver(changeRequestSchema),
    defaultValues: {
      mandalName: "",
      ringName: "",
      gpSpanName: "",
      changeRequestNo: "",
      reasonForActivity: "",
      materialConsumedOFC: 0,
      materialConsumedPoles: 0,
    },
  });

  const onSubmit = async (data: ChangeRequestFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "change_requests"), {
        ...data,
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date(),
        submittedAt: new Date().toISOString(),
        activityType: "Change Request",
      });

      setShowSuccess(true);
      toast({
        title: "Success!",
        description: "Change Request record submitted successfully",
      });

      setTimeout(() => {
        setShowSuccess(false);
        form.reset();
      }, 2000);
    } catch (error) {
      console.error("Error submitting Change Request:", error);
      toast({
        title: "Error",
        description: "Failed to submit Change Request record",
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
            <CardHeader className="pb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <RefreshCw className="text-green-600 h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-800">Change Request</CardTitle>
                  <p className="text-slate-600 mt-1">Material consumption tracking and activity changes</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Basic Change Request Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Change Request Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="mandalName">Mandal Name *</Label>
                      <Input
                        id="mandalName"
                        placeholder="Area of change"
                        {...form.register("mandalName")}
                        className="mt-2"
                      />
                      {form.formState.errors.mandalName && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.mandalName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="ringName">Ring Name *</Label>
                      <Input
                        id="ringName"
                        placeholder="Fiber ring name"
                        {...form.register("ringName")}
                        className="mt-2"
                      />
                      {form.formState.errors.ringName && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.ringName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="gpSpanName">GP Span Name *</Label>
                      <Input
                        id="gpSpanName"
                        placeholder="Group of sites"
                        {...form.register("gpSpanName")}
                        className="mt-2"
                      />
                      {form.formState.errors.gpSpanName && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.gpSpanName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="changeRequestNo">Change Request Number *</Label>
                      <Input
                        id="changeRequestNo"
                        placeholder="Unique ID for this change request"
                        {...form.register("changeRequestNo")}
                        className="mt-2"
                      />
                      {form.formState.errors.changeRequestNo && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.changeRequestNo.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reason for Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Activity Details</h3>
                  <div>
                    <Label htmlFor="reasonForActivity">Reason for Activity *</Label>
                    <Textarea
                      id="reasonForActivity"
                      placeholder="Explain why this change is needed, what improvements or modifications are being made..."
                      rows={4}
                      {...form.register("reasonForActivity")}
                      className="mt-2"
                    />
                    {form.formState.errors.reasonForActivity && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.reasonForActivity.message}</p>
                    )}
                  </div>
                </div>

                {/* Material Consumed */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Material Consumed
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="materialConsumedOFC">OFC Used (meters)</Label>
                      <Input
                        id="materialConsumedOFC"
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                        {...form.register("materialConsumedOFC", { valueAsNumber: true })}
                        className="mt-2"
                      />
                      <p className="text-sm text-slate-600 mt-1">Optical Fiber Cable used in meters</p>
                    </div>

                    <div>
                      <Label htmlFor="materialConsumedPoles">Poles Used (count)</Label>
                      <Input
                        id="materialConsumedPoles"
                        type="number"
                        min="0"
                        placeholder="0"
                        {...form.register("materialConsumedPoles", { valueAsNumber: true })}
                        className="mt-2"
                      />
                      <p className="text-sm text-slate-600 mt-1">Number of poles installed or replaced</p>
                    </div>
                  </div>
                </div>

                {/* Summary Section */}
                <div className="bg-slate-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Change Request Summary</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Location:</strong> {form.watch("mandalName")} - {form.watch("gpSpanName")}</p>
                    <p><strong>Ring:</strong> {form.watch("ringName")}</p>
                    <p><strong>Request ID:</strong> {form.watch("changeRequestNo")}</p>
                    <p><strong>Material Usage:</strong> 
                      {(form.watch("materialConsumedOFC") || 0) > 0 && ` OFC: ${form.watch("materialConsumedOFC")}m`}
                      {(form.watch("materialConsumedPoles") || 0) > 0 && ` Poles: ${form.watch("materialConsumedPoles")}`}
                      {!(form.watch("materialConsumedOFC") || 0) && !(form.watch("materialConsumedPoles") || 0) && " No materials consumed"}
                    </p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-4 pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={loading}
                    className={`bg-green-600 hover:bg-green-700 ${showSuccess ? 'bg-green-600 hover:bg-green-700' : ''} transition-all duration-300`}
                  >
                    {loading ? "Submitting..." : showSuccess ? "✓ Submitted Successfully!" : "Submit Change Request"}
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