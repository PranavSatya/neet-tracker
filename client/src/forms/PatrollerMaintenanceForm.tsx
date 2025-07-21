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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { UserRound, Camera, AlertTriangle, TreePine, Wrench } from "lucide-react";
import { Link } from "wouter";
import LiveCameraCapture from "@/components/LiveCameraCapture";

const photoSchema = z.object({
  photoId: z.string(),
  timestamp: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  base64Image: z.string(),
});

const patrollerSchema = z.object({
  mandalName: z.string().min(1, "Mandal Name is required"),
  location: z.string().min(1, "Location is required"),
  ringName: z.string().min(1, "Ring Name is required"),
  noOfGPs: z.number().int().min(0, "Number of GPs must be positive"),
  gpSpanName: z.string().min(1, "GP Span Name is required"),
  
  // SAG Location
  sagLocationIdentified: z.boolean(),
  sagLocationPhotos: z.array(photoSchema),
  
  // Clamp Damage
  clampDamaged: z.boolean(),
  clampDamagePhotos: z.array(photoSchema),
  tensionClampCount: z.number().int().min(0).optional(),
  suspensionClampCount: z.number().int().min(0).optional(),
  
  // New Pole/Bend
  newPoleBendIdentified: z.boolean(),
  poleDamage: z.boolean(),
  poleDamagePhotos: z.array(photoSchema),
  poleBendNewPoles: z.boolean(),
  poleBendPhotos: z.array(photoSchema),
  
  // Loop Stand Issues
  loopStandIssues: z.boolean(),
  loopStandPhotos: z.array(photoSchema),
  
  // Tree Cutting Activity
  treeCuttingActivity: z.boolean(),
  treeCuttingPhotos: z.array(photoSchema),
  
  // Joint Enclosure Status
  jointEnclosureProblems: z.boolean(),
  jointEnclosurePhotos: z.array(photoSchema),
  
  // Cut Location
  cutLocationIdentified: z.boolean(),
  cutLocationPhotos: z.array(photoSchema),
  
  // Other Activities
  otherActivitiesDescription: z.string().optional(),
  otherActivitiesPhotos: z.array(photoSchema),
});

type PatrollerFormData = z.infer<typeof patrollerSchema>;

export default function PatrollerMaintenanceForm() {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<PatrollerFormData>({
    resolver: zodResolver(patrollerSchema),
    defaultValues: {
      mandalName: "",
      location: "",
      ringName: "",
      noOfGPs: 0,
      gpSpanName: "",
      sagLocationIdentified: false,
      sagLocationPhotos: [],
      clampDamaged: false,
      clampDamagePhotos: [],
      tensionClampCount: 0,
      suspensionClampCount: 0,
      newPoleBendIdentified: false,
      poleDamage: false,
      poleDamagePhotos: [],
      poleBendNewPoles: false,
      poleBendPhotos: [],
      loopStandIssues: false,
      loopStandPhotos: [],
      treeCuttingActivity: false,
      treeCuttingPhotos: [],
      jointEnclosureProblems: false,
      jointEnclosurePhotos: [],
      cutLocationIdentified: false,
      cutLocationPhotos: [],
      otherActivitiesDescription: "",
      otherActivitiesPhotos: [],
    },
  });

  const onSubmit = async (data: PatrollerFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "patroller_activities"), {
        ...data,
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date(),
        submittedAt: new Date().toISOString(),
        activityType: "Patroller Task & Observations",
      });

      setShowSuccess(true);
      toast({
        title: "Success!",
        description: "Patroller activity record submitted successfully",
      });

      setTimeout(() => {
        setShowSuccess(false);
        form.reset();
      }, 2000);
    } catch (error) {
      console.error("Error submitting patroller activity:", error);
      toast({
        title: "Error",
        description: "Failed to submit patroller activity record",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPhotoToField = (fieldName: string, photoData: any) => {
    const currentPhotos = form.getValues(fieldName as any) || [];
    form.setValue(fieldName as any, [...currentPhotos, photoData]);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
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
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mr-4">
                  <UserRound className="text-yellow-600 h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-800">Patroller Task & Observations</CardTitle>
                  <p className="text-slate-600 mt-1">Field patrol activities, damage identification, and reporting</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Basic Patrol Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="mandalName">Mandal Name *</Label>
                      <Input
                        id="mandalName"
                        placeholder="Region where patrol is conducted"
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
                        placeholder="Specific location or site name"
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
                        placeholder="Fiber ring or network segment"
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
                        placeholder="Sites covered in patrol"
                        {...form.register("noOfGPs", { valueAsNumber: true })}
                        className="mt-2"
                      />
                      {form.formState.errors.noOfGPs && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.noOfGPs.message}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="gpSpanName">GP Span Name *</Label>
                      <Input
                        id="gpSpanName"
                        placeholder="GP span or distribution section being inspected"
                        {...form.register("gpSpanName")}
                        className="mt-2"
                      />
                      {form.formState.errors.gpSpanName && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.gpSpanName.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* SAG Location Identification */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    SAG Location Identification
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Label>SAG Location Identified?</Label>
                      <Switch
                        checked={form.watch("sagLocationIdentified")}
                        onCheckedChange={(checked) => form.setValue("sagLocationIdentified", checked)}
                      />
                      <span className="text-sm">
                        {form.watch("sagLocationIdentified") ? "Yes" : "No"}
                      </span>
                    </div>

                    {form.watch("sagLocationIdentified") && (
                      <LiveCameraCapture
                        label="SAG Location Photos with GEO Tag"
                        onCapture={(photo) => addPhotoToField("sagLocationPhotos", photo)}
                        required
                      />
                    )}
                  </div>
                </div>

                {/* Clamp Damage Assessment */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <Wrench className="mr-2 h-5 w-5" />
                    Clamp Damage Assessment
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Label>Clamps Damaged or Missing?</Label>
                      <Switch
                        checked={form.watch("clampDamaged")}
                        onCheckedChange={(checked) => form.setValue("clampDamaged", checked)}
                      />
                      <span className="text-sm">
                        {form.watch("clampDamaged") ? "Yes" : "No"}
                      </span>
                    </div>

                    {form.watch("clampDamaged") && (
                      <div className="space-y-4">
                        <LiveCameraCapture
                          label="Clamp Damage Photos"
                          onCapture={(photo) => addPhotoToField("clampDamagePhotos", photo)}
                          required
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="tensionClampCount">Tension Clamp Count</Label>
                            <Input
                              id="tensionClampCount"
                              type="number"
                              min="0"
                              placeholder="Number of tension clamps"
                              {...form.register("tensionClampCount", { valueAsNumber: true })}
                              className="mt-2"
                            />
                          </div>

                          <div>
                            <Label htmlFor="suspensionClampCount">Suspension Clamp Count</Label>
                            <Input
                              id="suspensionClampCount"
                              type="number"
                              min="0"
                              placeholder="Number of suspension clamps"
                              {...form.register("suspensionClampCount", { valueAsNumber: true })}
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* New Pole/Bend Identification */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    New Pole/Bend Identification
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Label>New Pole or Bend Identified?</Label>
                      <Switch
                        checked={form.watch("newPoleBendIdentified")}
                        onCheckedChange={(checked) => form.setValue("newPoleBendIdentified", checked)}
                      />
                      <span className="text-sm">
                        {form.watch("newPoleBendIdentified") ? "Yes" : "No"}
                      </span>
                    </div>

                    {form.watch("newPoleBendIdentified") && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <Label>Pole Damage?</Label>
                          <Switch
                            checked={form.watch("poleDamage")}
                            onCheckedChange={(checked) => form.setValue("poleDamage", checked)}
                          />
                          <span className="text-sm">
                            {form.watch("poleDamage") ? "Yes" : "No"}
                          </span>
                        </div>

                        {form.watch("poleDamage") && (
                          <LiveCameraCapture
                            label="Pole Damage Photos"
                            onCapture={(photo) => addPhotoToField("poleDamagePhotos", photo)}
                            required
                          />
                        )}

                        <div className="flex items-center space-x-4">
                          <Label>New Poles Bent?</Label>
                          <Switch
                            checked={form.watch("poleBendNewPoles")}
                            onCheckedChange={(checked) => form.setValue("poleBendNewPoles", checked)}
                          />
                          <span className="text-sm">
                            {form.watch("poleBendNewPoles") ? "Yes" : "No"}
                          </span>
                        </div>

                        {form.watch("poleBendNewPoles") && (
                          <LiveCameraCapture
                            label="Pole Bend Photos"
                            onCapture={(photo) => addPhotoToField("poleBendPhotos", photo)}
                            required
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Loop Stand Issues */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <Wrench className="mr-2 h-5 w-5" />
                    Loop Stand Issues
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Label>Loop Stand Issues Found?</Label>
                      <Switch
                        checked={form.watch("loopStandIssues")}
                        onCheckedChange={(checked) => form.setValue("loopStandIssues", checked)}
                      />
                      <span className="text-sm">
                        {form.watch("loopStandIssues") ? "Yes" : "No"}
                      </span>
                    </div>

                    {form.watch("loopStandIssues") && (
                      <LiveCameraCapture
                        label="Loop Stand Issue Photos"
                        onCapture={(photo) => addPhotoToField("loopStandPhotos", photo)}
                        required
                      />
                    )}
                  </div>
                </div>

                {/* Tree Cutting Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <TreePine className="mr-2 h-5 w-5" />
                    Tree Cutting Activity
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Label>Tree Cutting Required/Found?</Label>
                      <Switch
                        checked={form.watch("treeCuttingActivity")}
                        onCheckedChange={(checked) => form.setValue("treeCuttingActivity", checked)}
                      />
                      <span className="text-sm">
                        {form.watch("treeCuttingActivity") ? "Yes" : "No"}
                      </span>
                    </div>

                    {form.watch("treeCuttingActivity") && (
                      <LiveCameraCapture
                        label="Tree Cutting Activity Photos"
                        onCapture={(photo) => addPhotoToField("treeCuttingPhotos", photo)}
                        required
                      />
                    )}
                  </div>
                </div>

                {/* Joint Enclosure Status */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Joint Enclosure Status
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Label>Joint Enclosure Problems Found?</Label>
                      <Switch
                        checked={form.watch("jointEnclosureProblems")}
                        onCheckedChange={(checked) => form.setValue("jointEnclosureProblems", checked)}
                      />
                      <span className="text-sm">
                        {form.watch("jointEnclosureProblems") ? "Yes" : "No"}
                      </span>
                    </div>

                    {form.watch("jointEnclosureProblems") && (
                      <LiveCameraCapture
                        label="Joint Enclosure Problem Photos"
                        onCapture={(photo) => addPhotoToField("jointEnclosurePhotos", photo)}
                        required
                      />
                    )}
                  </div>
                </div>

                {/* Cut Location Identification */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <Camera className="mr-2 h-5 w-5" />
                    Cut Location Identification
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Label>Cut or Damage Location Identified?</Label>
                      <Switch
                        checked={form.watch("cutLocationIdentified")}
                        onCheckedChange={(checked) => form.setValue("cutLocationIdentified", checked)}
                      />
                      <span className="text-sm">
                        {form.watch("cutLocationIdentified") ? "Yes" : "No"}
                      </span>
                    </div>

                    {form.watch("cutLocationIdentified") && (
                      <LiveCameraCapture
                        label="Cut Location Photos"
                        onCapture={(photo) => addPhotoToField("cutLocationPhotos", photo)}
                        required
                      />
                    )}
                  </div>
                </div>

                {/* Other Activities/Observations */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Other Activities / Observations</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="otherActivitiesDescription">Description of Other Activities</Label>
                      <Textarea
                        id="otherActivitiesDescription"
                        placeholder="Any other notable issues or maintenance activities (free-form description)"
                        {...form.register("otherActivitiesDescription")}
                        className="mt-2"
                      />
                    </div>

                    <LiveCameraCapture
                      label="Other Activities Photos (Optional)"
                      onCapture={(photo) => addPhotoToField("otherActivitiesPhotos", photo)}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-4 pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={loading}
                    className={`bg-yellow-600 hover:bg-yellow-700 ${showSuccess ? 'bg-green-600 hover:bg-green-700' : ''} transition-all duration-300`}
                  >
                    {loading ? "Submitting..." : showSuccess ? "✓ Submitted Successfully!" : "Submit Patroller Report"}
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