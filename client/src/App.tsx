import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { KeyAuthProvider } from "./contexts/KeyAuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateBot from "./pages/CreateBot";
import MyBots from "./pages/MyBots";
import EditBot from "./pages/EditBot";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCreateKey from "./pages/AdminCreateKey";
import AdminKeys from "./pages/AdminKeys";
import AdminAllBots from "./pages/AdminAllBots";
import ActivityLogs from "./pages/ActivityLogs";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/create-bot" component={CreateBot} />
      <Route path="/my-bots" component={MyBots} />
      <Route path="/edit-bot/:id" component={EditBot} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/create-key" component={AdminCreateKey} />
      <Route path="/admin/keys" component={AdminKeys} />
      <Route path="/admin/all-bots" component={AdminAllBots} />
      <Route path="/activity-logs" component={ActivityLogs} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <KeyAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </KeyAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
