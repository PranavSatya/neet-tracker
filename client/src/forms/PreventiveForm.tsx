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
import { Settings } from "lucide-react";
import { Link } from "wouter";

const preventiveSchema = z.object({
  equipmentId: z.string().min(1, "Equipment ID is required"),
  maintenanceType: z.string().min(1, "Maintenance type is required"),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  priority: z.string().min(1, "Priority level is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type PreventiveFormData = z.infer<typeof preventiveSchema>;

export default function PreventiveForm() {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<PreventiveFormData>({
    resolver: zodResolver(preventiveSchema),
    defaultValues: {
      equipmentId: "",
      maintenanceType: "",
      scheduledDate: "",
      priority: "",
      description: "",
    },
  });

  const onSubmit = async (data: PreventiveFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "preventive_maintenance"), {
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
        description: "Preventive maintenance request submitted successfully.",
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
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <Settings className="text-blue-600 h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Preventive Maintenance Form</h2>
                  <p className="text-slate-600">Schedule and track preventive maintenance activities</p>
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="equipmentId">Equipment ID</Label>
                    <Input
                      id="equipmentId"
                      placeholder="EQ-2024-001"
                      {...form.register("equipmentId")}
                      className="mt-2"
                    />
                    {form.formState.errors.equipmentId && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.equipmentId.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="maintenanceType">Maintenance Type</Label>
                    <Select onValueChange={(value) => form.setValue("maintenanceType", value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select maintenance type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine-inspection">Routine Inspection</SelectItem>
                        <SelectItem value="lubrication">Lubrication</SelectItem>
                        <SelectItem value="calibration">Calibration</SelectItem>
                        <SelectItem value="filter-replacement">Filter Replacement</SelectItem>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                        <SelectItem value="testing">Testing</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.maintenanceType && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.maintenanceType.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="scheduledDate">Scheduled Date</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      {...form.register("scheduledDate")}
                      className="mt-2"
                    />
                    {form.formState.errors.scheduledDate && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.scheduledDate.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority Level</Label>
                    <Select onValueChange={(value) => form.setValue("priority", value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.priority && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.priority.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of maintenance activities..."
                    rows={4}
                    {...form.register("description")}
                    className="mt-2"
                  />
                  {form.formState.errors.description && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className={`${showSuccess ? 'bg-green-600 hover:bg-green-700' : ''} transition-all duration-300`}
                  >
                    {loading ? "Submitting..." : showSuccess ? "✓ Submitted!" : "Submit Request"}
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
