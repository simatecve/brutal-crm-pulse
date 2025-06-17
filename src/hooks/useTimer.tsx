
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface TimerSession {
  id: string;
  tarea_id: string;
  inicio: string;
  tiempo_transcurrido: number;
  estado: 'activa' | 'pausada' | 'finalizada';
}

interface TimerContextType {
  activeSession: TimerSession | null;
  currentTime: number;
  isRunning: boolean;
  startTimer: (tareaId: string) => Promise<void>;
  pauseTimer: () => Promise<void>;
  stopTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeSession, setActiveSession] = useState<TimerSession | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Cargar sesión activa al iniciar
  useEffect(() => {
    if (user) {
      loadActiveSession();
    }
  }, [user]);

  // Timer principal
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && activeSession) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          // Guardar progreso cada 30 segundos
          if (newTime % 30 === 0) {
            saveProgress(newTime);
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, activeSession]);

  // Persistir estado en localStorage
  useEffect(() => {
    if (activeSession) {
      localStorage.setItem('activeTimer', JSON.stringify({
        session: activeSession,
        currentTime,
        isRunning
      }));
    } else {
      localStorage.removeItem('activeTimer');
    }
  }, [activeSession, currentTime, isRunning]);

  // Cargar estado del localStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('activeTimer');
    if (saved && user) {
      try {
        const { session, currentTime: savedTime, isRunning: wasRunning } = JSON.parse(saved);
        setActiveSession(session);
        setCurrentTime(savedTime);
        setIsRunning(wasRunning);
      } catch (error) {
        console.error('Error loading timer state:', error);
      }
    }
  }, [user]);

  const loadActiveSession = async () => {
    try {
      const { data, error } = await supabase
        .from('sesiones_tiempo')
        .select('*')
        .eq('user_id', user?.id)
        .in('estado', ['activa', 'pausada'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        // Type assertion para convertir el string de la DB al tipo específico
        const sessionData: TimerSession = {
          ...data,
          estado: data.estado as 'activa' | 'pausada' | 'finalizada'
        };
        setActiveSession(sessionData);
        setCurrentTime(data.tiempo_transcurrido);
        setIsRunning(data.estado === 'activa');
      }
    } catch (error) {
      console.log('No active session found');
    }
  };

  const saveProgress = async (timeElapsed: number) => {
    if (!activeSession) return;

    try {
      await supabase
        .from('sesiones_tiempo')
        .update({
          tiempo_transcurrido: timeElapsed
        })
        .eq('id', activeSession.id);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const startTimer = async (tareaId: string) => {
    if (activeSession) {
      await stopTimer();
    }

    try {
      const { data, error } = await supabase
        .from('sesiones_tiempo')
        .insert({
          user_id: user?.id,
          tarea_id: tareaId,
          tiempo_transcurrido: 0,
          estado: 'activa'
        })
        .select()
        .single();

      if (error) throw error;

      // Type assertion para el nuevo registro
      const sessionData: TimerSession = {
        ...data,
        estado: data.estado as 'activa' | 'pausada' | 'finalizada'
      };

      setActiveSession(sessionData);
      setCurrentTime(0);
      setIsRunning(true);
      
      toast({
        title: "Timer iniciado",
        description: "El contador de tiempo ha comenzado para esta tarea.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo iniciar el timer.",
        variant: "destructive",
      });
    }
  };

  const pauseTimer = async () => {
    if (!activeSession) return;

    try {
      await supabase
        .from('sesiones_tiempo')
        .update({
          tiempo_transcurrido: currentTime,
          estado: 'pausada'
        })
        .eq('id', activeSession.id);

      setIsRunning(false);
      setActiveSession({ ...activeSession, estado: 'pausada' });
      
      toast({
        title: "Timer pausado",
        description: "El contador se ha pausado.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo pausar el timer.",
        variant: "destructive",
      });
    }
  };

  const resumeTimer = async () => {
    if (!activeSession) return;

    try {
      await supabase
        .from('sesiones_tiempo')
        .update({
          estado: 'activa'
        })
        .eq('id', activeSession.id);

      setIsRunning(true);
      setActiveSession({ ...activeSession, estado: 'activa' });
      
      toast({
        title: "Timer reanudado",
        description: "El contador continúa.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo reanudar el timer.",
        variant: "destructive",
      });
    }
  };

  const stopTimer = async () => {
    if (!activeSession) return;

    try {
      // Finalizar sesión
      await supabase
        .from('sesiones_tiempo')
        .update({
          tiempo_transcurrido: currentTime,
          fin: new Date().toISOString(),
          estado: 'finalizada'
        })
        .eq('id', activeSession.id);

      // Actualizar tiempo total en la tarea
      const minutos = Math.floor(currentTime / 60);
      const { data: tarea } = await supabase
        .from('tareas')
        .select('tiempo_registrado')
        .eq('id', activeSession.tarea_id)
        .single();

      if (tarea) {
        await supabase
          .from('tareas')
          .update({
            tiempo_registrado: (tarea.tiempo_registrado || 0) + minutos
          })
          .eq('id', activeSession.tarea_id);
      }

      setActiveSession(null);
      setCurrentTime(0);
      setIsRunning(false);
      
      toast({
        title: "Timer finalizado",
        description: `Se registraron ${minutos} minutos en la tarea.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo finalizar el timer.",
        variant: "destructive",
      });
    }
  };

  return (
    <TimerContext.Provider value={{
      activeSession,
      currentTime,
      isRunning,
      startTimer,
      pauseTimer,
      stopTimer,
      resumeTimer
    }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
