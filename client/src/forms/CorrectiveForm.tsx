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
  equipmentId: z.string().min(1, "Equipment ID is required"),
  issueType: z.string().min(1, "Issue type is required"),
  incidentDate: z.string().min(1, "Incident date is required"),
  urgency: z.string().min(1, "Urgency level is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
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
      equipmentId: "",
      issueType: "",
      incidentDate: "",
      urgency: "",
      description: "",
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
                    <Label htmlFor="equipmentId">Equipment ID</Label>
                    <Input
                      id="equipmentId"
                      placeholder="EQ-2024-002"
                      {...form.register("equipmentId")}
                      className="mt-2"
                    />
                    {form.formState.errors.equipmentId && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.equipmentId.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="issueType">Issue Type</Label>
                    <Select onValueChange={(value) => form.setValue("issueType", value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select issue type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mechanical-failure">Mechanical Failure</SelectItem>
                        <SelectItem value="electrical-issue">Electrical Issue</SelectItem>
                        <SelectItem value="software-problem">Software Problem</SelectItem>
                        <SelectItem value="performance-degradation">Performance Degradation</SelectItem>
                        <SelectItem value="safety-concern">Safety Concern</SelectItem>
                        <SelectItem value="structural-damage">Structural Damage</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.issueType && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.issueType.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="incidentDate">Incident Date</Label>
                    <Input
                      id="incidentDate"
                      type="date"
                      {...form.register("incidentDate")}
                      className="mt-2"
                    />
                    {form.formState.errors.incidentDate && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.incidentDate.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="urgency">Urgency</Label>
                    <Select onValueChange={(value) => form.setValue("urgency", value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.urgency && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.urgency.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Problem Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the issue and symptoms..."
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
