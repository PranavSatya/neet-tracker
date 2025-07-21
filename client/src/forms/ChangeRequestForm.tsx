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
  requestID: z.string().min(1, "Request ID is required"),
  siteName: z.string().min(1, "Site Name is required"),
  changeDescription: z.string().min(10, "Description of Change must be at least 10 characters"),
  priority: z.string().min(1, "Priority Level is required"),
  requestedBy: z.string().min(1, "Requested By is required"),
  requestDate: z.string().min(1, "Date of Request is required"),
  lat: z.number().optional(),
  lng: z.number().optional(),
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
      requestID: "",
      siteName: "",
      changeDescription: "",
      priority: "",
      requestedBy: "",
      requestDate: "",
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
                    <Label htmlFor="requestID">Request ID</Label>
                    <Input
                      id="requestID"
                      placeholder="CR-2024-001"
                      {...form.register("requestID")}
                      className="mt-2"
                    />
                    {form.formState.errors.requestID && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.requestID.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      placeholder="Main Office Site"
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
                    <Label htmlFor="requestedBy">Requested By</Label>
                    <Input
                      id="requestedBy"
                      placeholder="John Manager"
                      {...form.register("requestedBy")}
                      className="mt-2"
                    />
                    {form.formState.errors.requestedBy && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.requestedBy.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="requestDate">Date of Request</Label>
                    <Input
                      id="requestDate"
                      type="date"
                      {...form.register("requestDate")}
                      className="mt-2"
                    />
                    {form.formState.errors.requestDate && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.requestDate.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select onValueChange={(value) => form.setValue("priority", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select priority level" />
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

                <div>
                  <Label htmlFor="changeDescription">Description of Change</Label>
                  <Textarea
                    id="changeDescription"
                    placeholder="Describe the requested changes..."
                    rows={4}
                    {...form.register("changeDescription")}
                    className="mt-2"
                  />
                  {form.formState.errors.changeDescription && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.changeDescription.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="document">Upload Supporting Document</Label>
                    <Input
                      id="document"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
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
