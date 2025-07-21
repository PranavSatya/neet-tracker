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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Wrench, Camera, MapPin, TestTube, Package } from "lucide-react";
import { Link } from "wouter";
import LiveCameraCapture from "@/components/LiveCameraCapture";

const correctiveMaintenanceSchema = z.object({
  // Present Location and Time
  presentLocation: z.string().min(1, "Present location is required"),
  offlineMandalLocation: z.string().optional(),
  ttNo: z.string().min(1, "TT Number is required"),
  
  // Distance and Location Info
  distanceFromPOP: z.number().min(0, "Distance from POP is required"),
  gpName: z.string().min(1, "GP Name is required"),
  reasonForDamage: z.string().min(1, "Reason for Damage is required"),
  restorationPossibleAsPerSLA: z.boolean(),
  reasonIfNo: z.string().optional(),
  
  // Cut Location Photos with live capture
  cutLocationPhotos: z.array(z.object({
    photoId: z.string(),
    timestamp: z.string(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    base64Image: z.string(),
  })).min(1, "At least one cut location photo is required"),
  
  // OTDR Test Results
  otdrFromLocation: z.string().min(1, "OTDR From Location is required"),
  otdrToLocation: z.string().min(1, "OTDR To Location is required"),
  fiberNo: z.enum(["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "F13", "F14", "F15", "F16", "F17", "F18", "F19", "F20", "F21", "F22", "F23", "F24"]),
  distance: z.number().min(0, "Distance must be positive"),
  cumulativeLoss: z.number().min(0, "Cumulative Loss must be positive"),
  
  // Material Consumed
  tensionClamps: z.number().int().min(0).optional(),
  suspensionClamps: z.number().int().min(0).optional(),
  loopStand: z.number().int().min(0).optional(),
  newPoles: z.number().int().min(0).optional(),
  jointEnclosures: z.number().int().min(0).optional(),
  ofcUsedInKM: z.number().min(0).optional(),
  
  // TT Closure
  ttClosed: z.boolean(),
  ttClosedTime: z.string().optional(),
});

type CorrectiveMaintenanceFormData = z.infer<typeof correctiveMaintenanceSchema>;

export default function CorrectiveMaintenanceForm() {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [geoLocation, setGeoLocation] = useState<{lat: number, lng: number} | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<CorrectiveMaintenanceFormData>({
    resolver: zodResolver(correctiveMaintenanceSchema),
    defaultValues: {
      presentLocation: "",
      offlineMandalLocation: "",
      ttNo: "",
      distanceFromPOP: 0,
      gpName: "",
      reasonForDamage: "",
      restorationPossibleAsPerSLA: true,
      reasonIfNo: "",
      cutLocationPhotos: [],
      otdrFromLocation: "",
      otdrToLocation: "",
      fiberNo: "F1",
      distance: 0,
      cumulativeLoss: 0,
      tensionClamps: 0,
      suspensionClamps: 0,
      loopStand: 0,
      newPoles: 0,
      jointEnclosures: 0,
      ofcUsedInKM: 0,
      ttClosed: false,
      ttClosedTime: "",
    },
  });

  const { fields: photoFields, append: appendPhoto, remove: removePhoto } = useFieldArray({
    control: form.control,
    name: "cutLocationPhotos",
  });

  const captureCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setGeoLocation(location);
        form.setValue("presentLocation", `Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(6)}`);
        
        toast({
          title: "Location Captured",
          description: `GPS coordinates: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
        });
      });
    }
  };

  const handleCutLocationPhotoCapture = (photoData: any) => {
    appendPhoto(photoData);
  };

  const onSubmit = async (data: CorrectiveMaintenanceFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "corrective_maintenance"), {
        ...data,
        currentGeoLocation: geoLocation,
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date(),
        submittedAt: new Date().toISOString(),
        activityType: "Corrective Maintenance",
      });

      setShowSuccess(true);
      toast({
        title: "Success!",
        description: "Corrective maintenance record submitted successfully",
      });

      setTimeout(() => {
        setShowSuccess(false);
        form.reset();
        setGeoLocation(null);
      }, 2000);
    } catch (error) {
      console.error("Error submitting corrective maintenance:", error);
      toast({
        title: "Error",
        description: "Failed to submit corrective maintenance record",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                  <Wrench className="text-red-600 h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-800">Corrective Maintenance</CardTitle>
                  <p className="text-slate-600 mt-1">TT handling, cut location identification, and restoration</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Location and TT Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Location and TT Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Label htmlFor="presentLocation">Present Location and Time *</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="presentLocation"
                          placeholder="Current location with timestamp"
                          {...form.register("presentLocation")}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={captureCurrentLocation}
                          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                        >
                          <MapPin className="h-4 w-4" />
                          GPS
                        </Button>
                      </div>
                      {form.formState.errors.presentLocation && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.presentLocation.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="offlineMandalLocation">Offline Mandal Location</Label>
                      <Input
                        id="offlineMandalLocation"
                        placeholder="If offline, enter location"
                        {...form.register("offlineMandalLocation")}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="ttNo">TT Number *</Label>
                      <Input
                        id="ttNo"
                        placeholder="Enter ticket number"
                        {...form.register("ttNo")}
                        className="mt-2"
                      />
                      {form.formState.errors.ttNo && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.ttNo.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="distanceFromPOP">Distance From POP (km) *</Label>
                      <Input
                        id="distanceFromPOP"
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        {...form.register("distanceFromPOP", { valueAsNumber: true })}
                        className="mt-2"
                      />
                      {form.formState.errors.distanceFromPOP && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.distanceFromPOP.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="gpName">GP Name *</Label>
                      <Input
                        id="gpName"
                        placeholder="GP where issue occurred"
                        {...form.register("gpName")}
                        className="mt-2"
                      />
                      {form.formState.errors.gpName && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.gpName.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cut Location and Damage */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <Camera className="mr-2 h-5 w-5" />
                    Cut Location Identification
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reasonForDamage">Reason for Damage *</Label>
                      <Textarea
                        id="reasonForDamage"
                        placeholder="Explain the cause of fault/damage"
                        {...form.register("reasonForDamage")}
                        className="mt-2"
                      />
                      {form.formState.errors.reasonForDamage && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.reasonForDamage.message}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-4">
                      <Label>Restoration Possible as per SLA?</Label>
                      <Switch
                        checked={form.watch("restorationPossibleAsPerSLA")}
                        onCheckedChange={(checked) => form.setValue("restorationPossibleAsPerSLA", checked)}
                      />
                      <span className="text-sm">
                        {form.watch("restorationPossibleAsPerSLA") ? "Yes" : "No"}
                      </span>
                    </div>

                    {!form.watch("restorationPossibleAsPerSLA") && (
                      <div>
                        <Label htmlFor="reasonIfNo">If No, Reason</Label>
                        <Textarea
                          id="reasonIfNo"
                          placeholder="Explain why restoration is not possible as per SLA"
                          {...form.register("reasonIfNo")}
                          className="mt-2"
                        />
                      </div>
                    )}

                    <div>
                      <LiveCameraCapture
                        label="Cut Location Evidence Photos with GEO Tag"
                        onCapture={handleCutLocationPhotoCapture}
                        required
                      />
                      
                      {photoFields.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <Label className="text-sm font-medium">Captured Photos ({photoFields.length})</Label>
                          {photoFields.map((photo, index) => (
                            <div key={photo.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                              <div className="text-sm">
                                <p className="font-medium">Photo #{index + 1}</p>
                                <p className="text-slate-600">
                                  {photo.lat && photo.lng 
                                    ? `Location: ${photo.lat.toFixed(6)}, ${photo.lng.toFixed(6)}`
                                    : "Location data available"
                                  }
                                </p>
                                <p className="text-slate-500">Time: {new Date(photo.timestamp).toLocaleString()}</p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removePhoto(index)}
                                className="text-red-600"
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {form.formState.errors.cutLocationPhotos && (
                        <p className="text-red-500 text-sm mt-2">{form.formState.errors.cutLocationPhotos.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* OTDR Test Results */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <TestTube className="mr-2 h-5 w-5" />
                    OTDR Test Results
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="otdrFromLocation">From Location (Mandal/GP) *</Label>
                      <Input
                        id="otdrFromLocation"
                        placeholder="OTDR test starting point"
                        {...form.register("otdrFromLocation")}
                        className="mt-2"
                      />
                      {form.formState.errors.otdrFromLocation && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.otdrFromLocation.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="otdrToLocation">To Location (Mandal/GP) *</Label>
                      <Input
                        id="otdrToLocation"
                        placeholder="OTDR test endpoint"
                        {...form.register("otdrToLocation")}
                        className="mt-2"
                      />
                      {form.formState.errors.otdrToLocation && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.otdrToLocation.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>Fiber Number *</Label>
                      <Select onValueChange={(value) => form.setValue("fiberNo", value as any)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select fiber" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i + 1} value={`F${i + 1}`}>
                              F{i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="distance">Distance *</Label>
                      <Input
                        id="distance"
                        type="number"
                        step="0.001"
                        placeholder="Cable length under test"
                        {...form.register("distance", { valueAsNumber: true })}
                        className="mt-2"
                      />
                      {form.formState.errors.distance && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.distance.message}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="cumulativeLoss">Cumulative Loss (dB) *</Label>
                      <Input
                        id="cumulativeLoss"
                        type="number"
                        step="0.01"
                        placeholder="Signal loss over distance"
                        {...form.register("cumulativeLoss", { valueAsNumber: true })}
                        className="mt-2"
                      />
                      {form.formState.errors.cumulativeLoss && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.cumulativeLoss.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Material Consumed */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Total Material Consumed
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="tensionClamps">Tension Clamps</Label>
                      <Input
                        id="tensionClamps"
                        type="number"
                        min="0"
                        placeholder="0"
                        {...form.register("tensionClamps", { valueAsNumber: true })}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="suspensionClamps">Suspension Clamps</Label>
                      <Input
                        id="suspensionClamps"
                        type="number"
                        min="0"
                        placeholder="0"
                        {...form.register("suspensionClamps", { valueAsNumber: true })}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="loopStand">Loop Stand</Label>
                      <Input
                        id="loopStand"
                        type="number"
                        min="0"
                        placeholder="0"
                        {...form.register("loopStand", { valueAsNumber: true })}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="newPoles">New Poles</Label>
                      <Input
                        id="newPoles"
                        type="number"
                        min="0"
                        placeholder="0"
                        {...form.register("newPoles", { valueAsNumber: true })}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="jointEnclosures">Joint Enclosures</Label>
                      <Input
                        id="jointEnclosures"
                        type="number"
                        min="0"
                        placeholder="0"
                        {...form.register("jointEnclosures", { valueAsNumber: true })}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="ofcUsedInKM">OFC Used (km)</Label>
                      <Input
                        id="ofcUsedInKM"
                        type="number"
                        step="0.001"
                        min="0"
                        placeholder="0.000"
                        {...form.register("ofcUsedInKM", { valueAsNumber: true })}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                {/* TT Closure */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">TT Closure Status</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Label>TT Closed?</Label>
                      <Switch
                        checked={form.watch("ttClosed")}
                        onCheckedChange={(checked) => form.setValue("ttClosed", checked)}
                      />
                      <span className="text-sm">
                        {form.watch("ttClosed") ? "Yes" : "No"}
                      </span>
                    </div>

                    {form.watch("ttClosed") && (
                      <div>
                        <Label htmlFor="ttClosedTime">TT Closed Time with GEO Tag</Label>
                        <Input
                          id="ttClosedTime"
                          type="datetime-local"
                          {...form.register("ttClosedTime")}
                          className="mt-2"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-4 pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={loading}
                    className={`bg-red-600 hover:bg-red-700 ${showSuccess ? 'bg-green-600 hover:bg-green-700' : ''} transition-all duration-300`}
                  >
                    {loading ? "Submitting..." : showSuccess ? "✓ Submitted Successfully!" : "Submit Corrective Maintenance"}
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