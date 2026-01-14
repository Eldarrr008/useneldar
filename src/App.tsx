import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Landing from "./pages/Landing";
import StudentDashboard from "./pages/StudentDashboard";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Psychologist from "./pages/Psychologist";
import Survey from "./pages/Survey";
import Results from "./pages/Results";
import History from "./pages/History";
import JoinClassroom from "./pages/JoinClassroom";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="zenithmind-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes - accessible without login */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected student routes - require login */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/survey"
              element={
                <ProtectedRoute>
                  <Survey />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results"
              element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/join"
              element={
                <ProtectedRoute>
                  <JoinClassroom />
                </ProtectedRoute>
              }
            />
            
            {/* Psychologist panel - requires psychologist or admin role */}
            <Route
              path="/psychologist"
              element={
                <ProtectedRoute allowedRoles={["psychologist", "admin"]}>
                  <Psychologist />
                </ProtectedRoute>
              }
            />
            
            {/* Admin panel - requires admin role */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Admin />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
