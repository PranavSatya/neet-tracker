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
import { RefreshCw } from "lucide-react";
import { Link } from "wouter";

const changeRequestSchema = z.object({
  system: z.string().min(1, "System/Equipment is required"),
  changeType: z.string().min(1, "Change type is required"),
  requestedDate: z.string().min(1, "Requested date is required"),
  businessImpact: z.string().min(1, "Business impact is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  justification: z.string().min(10, "Business justification must be at least 10 characters"),
});

type ChangeRequestFormData = z.infer<typeof changeRequestSchema>;

export default function ChangeRequestForm() {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<ChangeRequestFormData>({
    resolver: zodResolver(changeRequestSchema),
    defaultValues: {
      system: "",
      changeType: "",
      requestedDate: "",
      businessImpact: "",
      description: "",
      justification: "",
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
        description: "Change request submitted successfully.",
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
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <RefreshCw className="text-green-600 h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Change Request Form</h2>
                  <p className="text-slate-600">Submit requests for system modifications</p>
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="system">System/Equipment</Label>
                    <Input
                      id="system"
                      placeholder="Production Line A"
                      {...form.register("system")}
                      className="mt-2"
                    />
                    {form.formState.errors.system && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.system.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="changeType">Change Type</Label>
                    <Select onValueChange={(value) => form.setValue("changeType", value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select change type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="software-update">Software Update</SelectItem>
                        <SelectItem value="hardware-upgrade">Hardware Upgrade</SelectItem>
                        <SelectItem value="configuration-change">Configuration Change</SelectItem>
                        <SelectItem value="process-improvement">Process Improvement</SelectItem>
                        <SelectItem value="security-enhancement">Security Enhancement</SelectItem>
                        <SelectItem value="feature-addition">Feature Addition</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.changeType && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.changeType.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="requestedDate">Requested Date</Label>
                    <Input
                      id="requestedDate"
                      type="date"
                      {...form.register("requestedDate")}
                      className="mt-2"
                    />
                    {form.formState.errors.requestedDate && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.requestedDate.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="businessImpact">Business Impact</Label>
                    <Select onValueChange={(value) => form.setValue("businessImpact", value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select business impact" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.businessImpact && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.businessImpact.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Change Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of requested changes..."
                    rows={4}
                    {...form.register("description")}
                    className="mt-2"
                  />
                  {form.formState.errors.description && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="justification">Business Justification</Label>
                  <Textarea
                    id="justification"
                    placeholder="Explain the business need and expected benefits..."
                    rows={3}
                    {...form.register("justification")}
                    className="mt-2"
                  />
                  {form.formState.errors.justification && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.justification.message}</p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className={`bg-green-600 hover:bg-green-700 ${showSuccess ? 'bg-green-600 hover:bg-green-700' : ''} transition-all duration-300`}
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
