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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Radio, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

const gpLiveCheckSchema = z.object({
  mandal: z.string().min(1, "Mandal is required"),
  ringName: z.string().min(1, "Ring Name is required"),
  gpName: z.string().min(1, "GP Name is required"),
  
  // Passive Infrastructure Checks
  fdmsIssue: z.boolean(),
  terminationIssue: z.boolean(),
  reLocation: z.boolean(),
  fiberIssue: z.boolean(),
  issueDetails: z.string().optional(),
  
  // Active Infrastructure Checks
  rackInstalled: z.boolean(),
  routerIssue: z.boolean(),
  sfpModule: z.boolean(),
  upsIssue: z.boolean(),
  mcbIssue: z.boolean(),
  troughRawPowerRouter: z.boolean(),
  apsflPowerMeterConnection: z.boolean(),
});

type GPLiveCheckFormData = z.infer<typeof gpLiveCheckSchema>;

export default function GPLiveCheckMaintenanceForm() {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<GPLiveCheckFormData>({
    resolver: zodResolver(gpLiveCheckSchema),
    defaultValues: {
      mandal: "",
      ringName: "",
      gpName: "",
      fdmsIssue: false,
      terminationIssue: false,
      reLocation: false,
      fiberIssue: false,
      issueDetails: "",
      rackInstalled: true,
      routerIssue: false,
      sfpModule: true,
      upsIssue: false,
      mcbIssue: false,
      troughRawPowerRouter: false,
      apsflPowerMeterConnection: true,
    },
  });

  const onSubmit = async (data: GPLiveCheckFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "gp_live_check"), {
        ...data,
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date(),
        submittedAt: new Date().toISOString(),
        activityType: "GP Live Check",
      });

      setShowSuccess(true);
      toast({
        title: "Success!",
        description: "GP Live Check record submitted successfully",
      });

      setTimeout(() => {
        setShowSuccess(false);
        form.reset();
      }, 2000);
    } catch (error) {
      console.error("Error submitting GP Live Check:", error);
      toast({
        title: "Error",
        description: "Failed to submit GP Live Check record",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const hasAnyIssues = form.watch("fdmsIssue") || form.watch("terminationIssue") || 
                     form.watch("reLocation") || form.watch("fiberIssue");

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
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <Radio className="text-purple-600 h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-800">GP Live Check</CardTitle>
                  <p className="text-slate-600 mt-1">Comprehensive GP site verification and equipment checks</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Basic GP Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">GP Site Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="mandal">Mandal (Region) *</Label>
                      <Input
                        id="mandal"
                        placeholder="Enter mandal/region name"
                        {...form.register("mandal")}
                        className="mt-2"
                      />
                      {form.formState.errors.mandal && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.mandal.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="ringName">Ring Name *</Label>
                      <Input
                        id="ringName"
                        placeholder="Name of the fiber ring at this GP"
                        {...form.register("ringName")}
                        className="mt-2"
                      />
                      {form.formState.errors.ringName && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.ringName.message}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="gpName">GP Name *</Label>
                      <Input
                        id="gpName"
                        placeholder="Name of the specific GP site being checked"
                        {...form.register("gpName")}
                        className="mt-2"
                      />
                      {form.formState.errors.gpName && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.gpName.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Passive Infrastructure Checks */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Passive Infrastructure Checks
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">FDMS Issue</Label>
                        <p className="text-sm text-slate-600">Fiber Distribution Management System</p>
                      </div>
                      <Switch
                        checked={form.watch("fdmsIssue")}
                        onCheckedChange={(checked) => form.setValue("fdmsIssue", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">Termination Issue</Label>
                        <p className="text-sm text-slate-600">Fiber termination problems</p>
                      </div>
                      <Switch
                        checked={form.watch("terminationIssue")}
                        onCheckedChange={(checked) => form.setValue("terminationIssue", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">Re-Location Required</Label>
                        <p className="text-sm text-slate-600">Equipment needs relocation</p>
                      </div>
                      <Switch
                        checked={form.watch("reLocation")}
                        onCheckedChange={(checked) => form.setValue("reLocation", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">Fiber Issue</Label>
                        <p className="text-sm text-slate-600">Any fiber-related problems</p>
                      </div>
                      <Switch
                        checked={form.watch("fiberIssue")}
                        onCheckedChange={(checked) => form.setValue("fiberIssue", checked)}
                      />
                    </div>
                  </div>

                  {hasAnyIssues && (
                    <div className="mt-6">
                      <Label htmlFor="issueDetails">Issue Details</Label>
                      <Textarea
                        id="issueDetails"
                        placeholder="Describe the issues found in the passive infrastructure checks..."
                        {...form.register("issueDetails")}
                        className="mt-2"
                      />
                    </div>
                  )}
                </div>

                {/* Active Infrastructure Checks */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Active Infrastructure Checks
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">Rack Installed</Label>
                        <p className="text-sm text-slate-600">Network rack properly installed</p>
                      </div>
                      <Switch
                        checked={form.watch("rackInstalled")}
                        onCheckedChange={(checked) => form.setValue("rackInstalled", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">Router Issue</Label>
                        <p className="text-sm text-slate-600">Any router problems</p>
                      </div>
                      <Switch
                        checked={form.watch("routerIssue")}
                        onCheckedChange={(checked) => form.setValue("routerIssue", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">SFP Module</Label>
                        <p className="text-sm text-slate-600">Optic transceiver module condition</p>
                      </div>
                      <Switch
                        checked={form.watch("sfpModule")}
                        onCheckedChange={(checked) => form.setValue("sfpModule", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">UPS Issue</Label>
                        <p className="text-sm text-slate-600">UPS functioning correctly</p>
                      </div>
                      <Switch
                        checked={form.watch("upsIssue")}
                        onCheckedChange={(checked) => form.setValue("upsIssue", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">MCB Issue</Label>
                        <p className="text-sm text-slate-600">MCB tripping or faulty</p>
                      </div>
                      <Switch
                        checked={form.watch("mcbIssue")}
                        onCheckedChange={(checked) => form.setValue("mcbIssue", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">Raw Power - Router</Label>
                        <p className="text-sm text-slate-600">Router powered directly from raw power</p>
                      </div>
                      <Switch
                        checked={form.watch("troughRawPowerRouter")}
                        onCheckedChange={(checked) => form.setValue("troughRawPowerRouter", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg md:col-span-2">
                      <div>
                        <Label className="font-medium">APSFL Power Meter Connection</Label>
                        <p className="text-sm text-slate-600">Power meter properly connected and active</p>
                      </div>
                      <Switch
                        checked={form.watch("apsflPowerMeterConnection")}
                        onCheckedChange={(checked) => form.setValue("apsflPowerMeterConnection", checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-4 pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={loading}
                    className={`bg-purple-600 hover:bg-purple-700 ${showSuccess ? 'bg-green-600 hover:bg-green-700' : ''} transition-all duration-300`}
                  >
                    {loading ? "Submitting..." : showSuccess ? "✓ Submitted Successfully!" : "Submit GP Live Check"}
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