
import { useState, useEffect, useRef } from 'react';
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
  const [startTime, setStartTime] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load active session on start
  useEffect(() => {
    if (user) {
      loadActiveSessionData();
    }
  }, [user]);

  // Main timer - calculate time based on start time instead of incrementing
  useEffect(() => {
    if (isRunning && activeSession && startTime) {
      const updateTimer = () => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        const totalTime = activeSession.tiempo_transcurrido + elapsed;
        
        setCurrentTime(totalTime);
        
        if (shouldSaveProgress(totalTime)) {
          saveProgress(activeSession.id, totalTime);
        }
      };

      // Update immediately
      updateTimer();
      
      // Set interval to update every second
      intervalRef.current = setInterval(updateTimer, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, activeSession, startTime]);

  // Persist state in localStorage
  useEffect(() => {
    if (activeSession) {
      saveTimerState({
        ...activeSession,
        tiempo_transcurrido: currentTime
      }, currentTime, isRunning, startTime);
    }
  }, [activeSession, currentTime, isRunning, startTime]);

  // Load state from localStorage on start and handle page visibility changes
  useEffect(() => {
    const loadSavedState = () => {
      const saved = loadTimerState();
      if (saved && user) {
        setActiveSession(saved.session);
        
        if (saved.isRunning && saved.startTime) {
          // Recalculate time based on actual elapsed time
          const now = Date.now();
          const elapsed = Math.floor((now - saved.startTime) / 1000);
          const totalTime = saved.session.tiempo_transcurrido + elapsed;
          
          setCurrentTime(totalTime);
          setStartTime(saved.startTime);
          setIsRunning(true);
        } else {
          setCurrentTime(saved.currentTime);
          setIsRunning(false);
          setStartTime(null);
        }
      }
    };

    // Load on mount
    if (user) {
      loadSavedState();
    }

    // Handle visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden && isRunning && activeSession && startTime) {
        // Recalculate time when tab becomes visible again
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        const totalTime = activeSession.tiempo_transcurrido + elapsed;
        setCurrentTime(totalTime);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [user, isRunning, activeSession, startTime]);

  const loadActiveSessionData = async () => {
    if (!user?.id) return;
    
    const session = await loadActiveSession(user.id);
    if (session) {
      setActiveSession(session);
      setCurrentTime(session.tiempo_transcurrido);
      
      if (session.estado === 'activa') {
        // If the session is active, calculate elapsed time since last update
        const now = Date.now();
        const sessionStart = new Date(session.inicio).getTime();
        const pausedTime = session.tiempo_transcurrido * 1000; // Convert to ms
        const actualStartTime = now - pausedTime;
        
        setStartTime(actualStartTime);
        setIsRunning(true);
      } else {
        setIsRunning(false);
        setStartTime(null);
      }
    }
  };

  const startTimer = async (tareaId: string) => {
    if (!user?.id) return;

    if (activeSession) {
      await stopTimer();
    }

    const session = await createTimerSession(user.id, tareaId);
    if (session) {
      const now = Date.now();
      setActiveSession(session);
      setCurrentTime(0);
      setStartTime(now);
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
      setStartTime(null);
      setActiveSession({ ...activeSession, estado: 'pausada', tiempo_transcurrido: currentTime });
      
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
      const now = Date.now();
      const resumeStartTime = now - (currentTime * 1000);
      
      setStartTime(resumeStartTime);
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
      setStartTime(null);
      
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
