import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import DashboardLayout from "./components/DashboardLayout";
import PatientsPage from "./pages/Patients";
import AppointmentsPage from "./pages/Appointments";

// Placeholder components
const ExaminationsPage = () => <DashboardLayout><div>صفحة الفحوصات قيد التطوير</div></DashboardLayout>;
const SettingsPage = () => <DashboardLayout><div>صفحة الإعدادات قيد التطوير</div></DashboardLayout>;

function Router() {
  return (
    <Switch>
      <Route path="/">
        <DashboardLayout>
          <Home />
        </DashboardLayout>
      </Route>
      <Route path="/patients" component={PatientsPage} />
      <Route path="/appointments" component={AppointmentsPage} />
      <Route path="/examinations" component={ExaminationsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-center" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
