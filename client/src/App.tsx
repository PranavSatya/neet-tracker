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
import PreventiveForm from "@/forms/PreventiveForm";
import CorrectiveForm from "@/forms/CorrectiveForm";
import ChangeRequestForm from "@/forms/ChangeRequestForm";
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
  return (
    <Switch>
      <Route path="/login">
        <Redirect to={role === "admin" ? "/admin-dashboard" : "/activity-selector"} />
      </Route>
      
      <Route path="/activity-selector">
        <ProtectedRoute>
          <ActivitySelector />
        </ProtectedRoute>
      </Route>
      
      <Route path="/preventive-form">
        <ProtectedRoute>
          <PreventiveForm />
        </ProtectedRoute>
      </Route>
      
      <Route path="/corrective-form">
        <ProtectedRoute>
          <CorrectiveForm />
        </ProtectedRoute>
      </Route>
      
      <Route path="/change-request-form">
        <ProtectedRoute>
          <ChangeRequestForm />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin-dashboard">
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
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
