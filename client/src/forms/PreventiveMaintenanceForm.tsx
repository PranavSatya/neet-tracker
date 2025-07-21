import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Settings, Plus, Trash2, TestTube } from "lucide-react";
import { Link } from "wouter";

const preventiveMaintenanceSchema = z.object({
  mandalName: z.string().min(1, "Mandal Name is required"),
  location: z.string().min(1, "Location is required"),
  ringName: z.string().min(1, "Ring Name is required"),
  noOfGPs: z.number().int().min(0, "Number of GPs must be positive"),
  otdrTestingFromLocation: z.string().min(1, "OTDR Testing From Location is required"),
  otdrTestingToLocation: z.string().min(1, "OTDR Testing To Location is required"),
  fiberTests: z.array(z.object({
    fiberNo: z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"]),
    distance: z.number().min(0, "Distance must be positive"),
    cumulativeLoss: z.number().min(0, "Cumulative Loss must be positive"),
  })).min(1, "At least one fiber test is required"),
  gpSpanName: z.string().optional(),
});

type PreventiveMaintenanceFormData = z.infer<typeof preventiveMaintenanceSchema>;

export default function PreventiveMaintenanceForm() {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<PreventiveMaintenanceFormData>({
    resolver: zodResolver(preventiveMaintenanceSchema),
    defaultValues: {
      mandalName: "",
      location: "",
      ringName: "",
      noOfGPs: 0,
      otdrTestingFromLocation: "",
      otdrTestingToLocation: "",
      fiberTests: [{ fiberNo: "1", distance: 0, cumulativeLoss: 0 }],
      gpSpanName: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fiberTests",
  });

  const onSubmit = async (data: PreventiveMaintenanceFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "preventive_maintenance"), {
        ...data,
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date(),
        submittedAt: new Date().toISOString(),
        activityType: "FRT Daily Activity - Preventive Maintenance",
      });

      setShowSuccess(true);
      toast({
        title: "Success!",
        description: "Preventive maintenance record submitted successfully",
      });

      setTimeout(() => {
        setShowSuccess(false);
        form.reset();
      }, 2000);
    } catch (error) {
      console.error("Error submitting preventive maintenance:", error);
      toast({
        title: "Error",
        description: "Failed to submit preventive maintenance record",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addFiberTest = () => {
    append({ fiberNo: "1", distance: 0, cumulativeLoss: 0 });
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
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <Settings className="text-blue-600 h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-800">FRT Daily Activity - Preventive Maintenance</CardTitle>
                  <p className="text-slate-600 mt-1">OTDR testing, fiber monitoring, and GP span management</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <TestTube className="mr-2 h-5 w-5" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="mandalName">Mandal Name *</Label>
                      <Input
                        id="mandalName"
                        placeholder="Enter mandal name"
                        {...form.register("mandalName")}
                        className="mt-2"
                      />
                      {form.formState.errors.mandalName && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.mandalName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        placeholder="Enter location/site"
                        {...form.register("location")}
                        className="mt-2"
                      />
                      {form.formState.errors.location && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.location.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="ringName">Ring Name *</Label>
                      <Input
                        id="ringName"
                        placeholder="Enter fiber ring name"
                        {...form.register("ringName")}
                        className="mt-2"
                      />
                      {form.formState.errors.ringName && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.ringName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="noOfGPs">Number of GPs *</Label>
                      <Input
                        id="noOfGPs"
                        type="number"
                        placeholder="0"
                        {...form.register("noOfGPs", { valueAsNumber: true })}
                        className="mt-2"
                      />
                      {form.formState.errors.noOfGPs && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.noOfGPs.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* OTDR Testing Configuration */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <TestTube className="mr-2 h-5 w-5" />
                    OTDR Testing Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="otdrTestingFromLocation">OTDR Testing From Location *</Label>
                      <Input
                        id="otdrTestingFromLocation"
                        placeholder="Starting node/location"
                        {...form.register("otdrTestingFromLocation")}
                        className="mt-2"
                      />
                      {form.formState.errors.otdrTestingFromLocation && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.otdrTestingFromLocation.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="otdrTestingToLocation">OTDR Testing To Location *</Label>
                      <Input
                        id="otdrTestingToLocation"
                        placeholder="End node/location"
                        {...form.register("otdrTestingToLocation")}
                        className="mt-2"
                      />
                      {form.formState.errors.otdrTestingToLocation && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.otdrTestingToLocation.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fiber Testing Details */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                      <TestTube className="mr-2 h-5 w-5" />
                      Fiber Testing Details
                    </h3>
                    <Button
                      type="button"
                      onClick={addFiberTest}
                      className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Fiber Test
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="p-4 border-l-4 border-l-blue-500">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-slate-700">Fiber Test #{index + 1}</h4>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Fiber Number (1-24) *</Label>
                            <Select onValueChange={(value) => form.setValue(`fiberTests.${index}.fiberNo` as any, value)}>
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select fiber" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }, (_, i) => (
                                  <SelectItem key={i + 1} value={String(i + 1)}>
                                    Fiber {i + 1}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Distance (km)</Label>
                            <Input
                              type="number"
                              step="0.001"
                              placeholder="0.000"
                              {...form.register(`fiberTests.${index}.distance` as const, { valueAsNumber: true })}
                              className="mt-2"
                            />
                          </div>

                          <div>
                            <Label>Cumulative Loss (dB)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...form.register(`fiberTests.${index}.cumulativeLoss` as const, { valueAsNumber: true })}
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {form.formState.errors.fiberTests && (
                    <p className="text-red-500 text-sm mt-2">{form.formState.errors.fiberTests.message}</p>
                  )}
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Additional Information</h3>
                  <div>
                    <Label htmlFor="gpSpanName">GP Span Name</Label>
                    <Input
                      id="gpSpanName"
                      placeholder="Group of sites name (optional)"
                      {...form.register("gpSpanName")}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-4 pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={loading}
                    className={`bg-blue-600 hover:bg-blue-700 ${showSuccess ? 'bg-green-600 hover:bg-green-700' : ''} transition-all duration-300`}
                  >
                    {loading ? "Submitting..." : showSuccess ? "✓ Submitted Successfully!" : "Submit Preventive Maintenance"}
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