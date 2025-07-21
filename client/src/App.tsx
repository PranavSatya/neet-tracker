import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import LoginPage from "@/pages/LoginPage";
import ActivitySelector from "@/pages/ActivitySelector";
import AdminDashboard from "@/pages/AdminDashboard";
import GPDashboard from "@/pages/GPDashboard";
import PreventiveMaintenanceForm from "@/forms/PreventiveMaintenanceForm";
import CorrectiveMaintenanceForm from "@/forms/CorrectiveMaintenanceForm";
import ChangeRequestMaintenanceForm from "@/forms/ChangeRequestMaintenanceForm";
import GPLiveCheckMaintenanceForm from "@/forms/GPLiveCheckMaintenanceForm";
import PatrollerMaintenanceForm from "@/forms/PatrollerMaintenanceForm";
import PunchInForm from "@/forms/PunchInForm";
import NotFound from "@/pages/not-found";

function AuthRouter() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  if (authLoading || (user && roleLoading)) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route>
          <Redirect to="/login" />
        </Route>
      </Switch>
    );
  }

  // Redirect based on role after login
  // console.log("Current user role in App.tsx:", role);
  return (
    <Switch>
      <Route path="/punch-in-form">
        <ProtectedRoute>
          <PunchInForm />
        </ProtectedRoute>
      </Route>

      <Route path="/admin-dashboard">
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/gp-dashboard">
        <ProtectedRoute requiredRole="admin">
          <GPDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/activity-selector">
        <ProtectedRoute>
          {role === "admin" ? <Redirect to="/admin-dashboard" /> : <ActivitySelector />}
        </ProtectedRoute>
      </Route>
      
      <Route path="/preventive-form">
        <ProtectedRoute>
          <PreventiveMaintenanceForm />
        </ProtectedRoute>
      </Route>
      
      <Route path="/corrective-form">
        <ProtectedRoute>
          <CorrectiveMaintenanceForm />
        </ProtectedRoute>
      </Route>
      
      <Route path="/change-request-form">
        <ProtectedRoute>
          <ChangeRequestMaintenanceForm />
        </ProtectedRoute>
      </Route>
      
      <Route path="/gp-live-check-form">
        <ProtectedRoute>
          <GPLiveCheckMaintenanceForm />
        </ProtectedRoute>
      </Route>
      
      <Route path="/patroller-form">
        <ProtectedRoute>
          <PatrollerMaintenanceForm />
        </ProtectedRoute>
      </Route>

      <Route path="/login">
        <Redirect to={role === "admin" ? "/admin-dashboard" : "/activity-selector"} />
      </Route>

      <Route path="/">
        <Redirect to={role === "admin" ? "/admin-dashboard" : "/activity-selector"} />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  return (
    <AuthProvider>
      <AuthRouter />
    </AuthProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
