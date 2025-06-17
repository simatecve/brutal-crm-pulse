
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { TimerProvider } from "@/hooks/useTimer";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppSidebar from "@/components/AppSidebar";
import TimerWidget from "@/components/TimerWidget";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Clientes from "./pages/Clientes";
import Proyectos from "./pages/Proyectos";
import Propuestas from "./pages/Propuestas";
import Tareas from "./pages/Tareas";
import TimeTracker from "./pages/TimeTracker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <TimerProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <div className="flex min-h-screen bg-black">
                    <AppSidebar />
                    <main className="flex-1 overflow-auto">
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/clientes" element={<Clientes />} />
                        <Route path="/proyectos" element={<Proyectos />} />
                        <Route path="/propuestas" element={<Propuestas />} />
                        <Route path="/tareas" element={<Tareas />} />
                        <Route path="/time-tracker" element={<TimeTracker />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <TimerWidget />
                  </div>
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </TimerProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
