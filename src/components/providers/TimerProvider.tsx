
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { TimerContext } from '@/context/TimerContext';
import { TimerSession } from '@/types/timer';
import { saveTimerState, loadTimerState, shouldSaveProgress } from '@/utils/timerUtils';
import { 
  loadActiveSession, 
  saveProgress, 
  createTimerSession, 
  updateSessionState, 
  updateTaskTime 
} from '@/services/timerService';

export const TimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeSession, setActiveSession] = useState<TimerSession | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load active session on start
  useEffect(() => {
    if (user) {
      loadActiveSessionData();
    }
  }, [user]);

  // Main timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && activeSession) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (shouldSaveProgress(newTime)) {
            saveProgress(activeSession.id, newTime);
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, activeSession]);

  // Persist state in localStorage
  useEffect(() => {
    saveTimerState(activeSession, currentTime, isRunning);
  }, [activeSession, currentTime, isRunning]);

  // Load state from localStorage on start
  useEffect(() => {
    const saved = loadTimerState();
    if (saved && user) {
      setActiveSession(saved.session);
      setCurrentTime(saved.currentTime);
      setIsRunning(saved.isRunning);
    }
  }, [user]);

  const loadActiveSessionData = async () => {
    if (!user?.id) return;
    
    const session = await loadActiveSession(user.id);
    if (session) {
      setActiveSession(session);
      setCurrentTime(session.tiempo_transcurrido);
      setIsRunning(session.estado === 'activa');
    }
  };

  const startTimer = async (tareaId: string) => {
    if (!user?.id) return;

    if (activeSession) {
      await stopTimer();
    }

    const session = await createTimerSession(user.id, tareaId);
    if (session) {
      setActiveSession(session);
      setCurrentTime(0);
      setIsRunning(true);
      
      toast({
        title: "Timer iniciado",
        description: "El contador de tiempo ha comenzado para esta tarea.",
      });
    } else {
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
      await updateSessionState(activeSession.id, 'pausada', currentTime);
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
      await updateSessionState(activeSession.id, 'activa');
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
      await updateSessionState(activeSession.id, 'finalizada', currentTime);

      const minutos = Math.floor(currentTime / 60);
      await updateTaskTime(activeSession.tarea_id, minutos);

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
