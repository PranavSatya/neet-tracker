import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Wrench, RefreshCw, Radio, UserRound, LogOut, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const activities = [
  {
    id: "punch-in",
    title: "⏰ Daily Punch-In",
    description: "Start your daily field activities with photo and location",
    icon: Clock,
    color: "indigo",
    path: "/punch-in-form",
  },
  {
    id: "preventive",
    title: "🛠️ FRT Daily Activity - Preventive Maintenance",
    description: "OTDR testing, fiber monitoring, and GP span management",
    icon: Settings,
    color: "blue",
    path: "/preventive-form",
  },
  {
    id: "corrective",
    title: "⚙️ Corrective Maintenance",
    description: "TT handling, cut location identification, and restoration",
    icon: Wrench,
    color: "red",
    path: "/corrective-form",
  },
  {
    id: "change-request",
    title: "🔁 Change Request",
    description: "Material consumption tracking and activity changes",
    icon: RefreshCw,
    color: "green",
    path: "/change-request-form",
  },
  {
    id: "gp-live-check",
    title: "📡 GP Live Check",
    description: "Comprehensive GP site verification and equipment checks",
    icon: Radio,
    color: "purple",
    path: "/gp-live-check-form",
  },
  {
    id: "patroller",
    title: "🚶 Patroller Task & Observations",
    description: "Field patrol activities, damage identification, and reporting",
    icon: UserRound,
    color: "yellow",
    path: "/patroller-form",
  },
];

export default function ActivitySelector() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with logout */}
        <div className="flex justify-end mb-6">
          <Button variant="outline" onClick={logout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Select Your Activity</h1>
          <p className="text-slate-600 text-lg">Choose the type of maintenance work you need to track</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {activity.disabled ? (
                <Card className="shadow-lg transition-all duration-200 opacity-60 cursor-not-allowed">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 bg-${activity.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                      <activity.icon className={`text-${activity.color}-600 h-8 w-8`} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">{activity.title}</h3>
                    <p className="text-slate-600">{activity.description}</p>
                    <div className="mt-4 text-slate-400 text-sm font-medium">
                      Coming Soon
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Link href={activity.path || "#"}>
                  <Card className="shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className={`w-16 h-16 bg-${activity.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                        <activity.icon className={`text-${activity.color}-600 h-8 w-8`} />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">{activity.title}</h3>
                      <p className="text-slate-600">{activity.description}</p>
                      <div className="mt-4 text-primary text-sm font-medium flex items-center">
                        Get Started <span className="ml-2">→</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
