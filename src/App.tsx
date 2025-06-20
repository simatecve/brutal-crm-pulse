
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { TimerProvider } from "@/hooks/useTimer";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppSidebar from "@/components/AppSidebar";
import TimerWidget from "@/components/TimerWidget";
import NotificationWidget from "@/components/notifications/NotificationWidget";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Clientes from "./pages/Clientes";
import Proyectos from "./pages/Proyectos";
import Propuestas from "./pages/Propuestas";
import Tareas from "./pages/Tareas";
import TimeTracker from "./pages/TimeTracker";
import Reportes from "./pages/Reportes";
import Configuracion from "./pages/Configuracion";
import Kanban from "./pages/Kanban";
import Sugerencias from "./pages/Sugerencias";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const [configuracion, setConfiguracion] = useState({
    atajosHabilitados: true
  });

  useEffect(() => {
    const configGuardada = localStorage.getItem('configuracion_app');
    if (configGuardada) {
      try {
        const config = JSON.parse(configGuardada);
        setConfiguracion(prev => ({ ...prev, atajosHabilitados: config.atajosHabilitados ?? true }));
      } catch (error) {
        console.error('Error parsing config:', error);
      }
    }
  }, []);

  // Activar atajos globales
  useKeyboardShortcuts({
    enabled: configuracion.atajosHabilitados
  });

  return (
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
                  <Route path="/kanban" element={<Kanban />} />
                  <Route path="/time-tracker" element={<TimeTracker />} />
                  <Route path="/reportes" element={<Reportes />} />
                  <Route path="/sugerencias" element={<Sugerencias />} />
                  <Route path="/configuracion" element={<Configuracion />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <TimerWidget />
              <NotificationWidget />
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <NotificationProvider>
          <TimerProvider>
            <AppContent />
          </TimerProvider>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
