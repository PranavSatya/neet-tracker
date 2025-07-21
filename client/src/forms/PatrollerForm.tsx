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
import { UserRound } from "lucide-react";
import { Link } from "wouter";

const patrollerSchema = z.object({
  patrollerName: z.string().min(1, "Patroller Name is required"),
  route: z.string().min(1, "Route / GP Covered is required"),
  patrolDate: z.string().min(1, "Patrol Date is required"),
  startTime: z.string().min(1, "Start Time is required"),
  endTime: z.string().min(1, "End Time is required"),
  observations: z.string().min(10, "Observations must be at least 10 characters"),
  issuesFound: z.string().min(1, "Issues Found selection is required"),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

type PatrollerFormData = z.infer<typeof patrollerSchema>;

export default function PatrollerForm() {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<PatrollerFormData>({
    resolver: zodResolver(patrollerSchema),
    defaultValues: {
      patrollerName: "",
      route: "",
      patrolDate: "",
      startTime: "",
      endTime: "",
      observations: "",
      issuesFound: "",
    },
  });

  const onSubmit = async (data: PatrollerFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "patroller"), {
        ...data,
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date(),
        activityType: "Patroller"
      });

      setShowSuccess(true);
      toast({
        title: "Success!",
        description: "Patroller record submitted successfully",
      });

      setTimeout(() => {
        setShowSuccess(false);
        form.reset();
      }, 2000);
    } catch (error) {
      console.error("Error submitting Patroller record:", error);
      toast({
        title: "Error",
        description: "Failed to submit Patroller record",
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
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mr-4">
                  <UserRound className="text-yellow-600 h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Patroller Form</h2>
                  <p className="text-slate-600">Regular inspection rounds and safety checks</p>
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="patrollerName">Patroller Name</Label>
                    <Input
                      id="patrollerName"
                      placeholder="Security Officer Name"
                      {...form.register("patrollerName")}
                      className="mt-2"
                    />
                    {form.formState.errors.patrollerName && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.patrollerName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="route">Route / GP Covered</Label>
                    <Input
                      id="route"
                      placeholder="Route A / GP Station 1-5"
                      {...form.register("route")}
                      className="mt-2"
                    />
                    {form.formState.errors.route && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.route.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="patrolDate">Patrol Date</Label>
                    <Input
                      id="patrolDate"
                      type="date"
                      {...form.register("patrolDate")}
                      className="mt-2"
                    />
                    {form.formState.errors.patrolDate && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.patrolDate.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      {...form.register("startTime")}
                      className="mt-2"
                    />
                    {form.formState.errors.startTime && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.startTime.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      {...form.register("endTime")}
                      className="mt-2"
                    />
                    {form.formState.errors.endTime && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.endTime.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="observations">Observations</Label>
                  <Textarea
                    id="observations"
                    placeholder="Detailed observations during patrol..."
                    rows={4}
                    {...form.register("observations")}
                    className="mt-2"
                  />
                  {form.formState.errors.observations && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.observations.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="issuesFound">Any Issues Found?</Label>
                  <Select onValueChange={(value) => form.setValue("issuesFound", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select if issues were found" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="minor">Minor Issues</SelectItem>
                      <SelectItem value="major">Major Issues</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.issuesFound && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.issuesFound.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="photo">Upload Route Photo</Label>
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
                    className={`bg-yellow-600 hover:bg-yellow-700 ${showSuccess ? 'bg-yellow-600 hover:bg-yellow-700' : ''} transition-all duration-300`}
                  >
                    {loading ? "Submitting..." : showSuccess ? "✓ Submitted!" : "Submit Patrol"}
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