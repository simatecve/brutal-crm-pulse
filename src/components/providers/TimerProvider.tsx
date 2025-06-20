
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { TimerContext } from '@/context/TimerContext';
import { TimerSession } from '@/types/timer';
import { saveTimerState, loadTimerState } from '@/utils/timerUtils';
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
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<number>(0);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load active session and restore state on mount
  useEffect(() => {
    if (user && !activeSession) {
      loadInitialState();
    }
  }, [user]);

  // Main timer interval
  useEffect(() => {
    if (isRunning && sessionStartTime) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const totalElapsed = Math.floor((now - sessionStartTime) / 1000);
        setCurrentTime(totalElapsed);
        
        // Auto-save every 30 seconds
        if (totalElapsed > 0 && totalElapsed % 30 === 0 && totalElapsed !== lastSaveRef.current) {
          lastSaveRef.current = totalElapsed;
          if (activeSession) {
            saveProgress(activeSession.id, totalElapsed);
          }
        }
      }, 1000);
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
  }, [isRunning, sessionStartTime, activeSession?.id]);

  // Save state to localStorage when timer state changes
  useEffect(() => {
    if (activeSession && sessionStartTime) {
      saveTimerState({
        session: activeSession,
        sessionStartTime,
        isRunning
      });
    }
  }, [activeSession, sessionStartTime, isRunning]);

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isRunning && sessionStartTime) {
        // Recalculate current time when tab becomes visible
        const now = Date.now();
        const totalElapsed = Math.floor((now - sessionStartTime) / 1000);
        setCurrentTime(totalElapsed);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [isRunning, sessionStartTime]);

  const loadInitialState = async () => {
    if (!user?.id) return;
    
    try {
      // First try to load from localStorage
      const savedState = loadTimerState();
      if (savedState && savedState.session && savedState.sessionStartTime) {
        setActiveSession(savedState.session);
        setSessionStartTime(savedState.sessionStartTime);
        setIsRunning(savedState.isRunning);
        
        // Calculate current time based on saved start time
        const now = Date.now();
        const totalElapsed = Math.floor((now - savedState.sessionStartTime) / 1000);
        setCurrentTime(totalElapsed);
        return;
      }

      // If no saved state, check database
      const session = await loadActiveSession(user.id);
      if (session && session.estado === 'activa') {
        // Calculate session start time based on stored elapsed time
        const now = Date.now();
        const calculatedStartTime = now - (session.tiempo_transcurrido * 1000);
        
        setActiveSession(session);
        setSessionStartTime(calculatedStartTime);
        setCurrentTime(session.tiempo_transcurrido);
        setIsRunning(true);
      }
    } catch (error) {
      console.error('Error loading timer state:', error);
    }
  };

  const startTimer = async (tareaId: string) => {
    if (!user?.id) return;

    if (activeSession) {
      await stopTimer();
    }

    try {
      const session = await createTimerSession(user.id, tareaId);
      if (session) {
        const now = Date.now();
        setActiveSession(session);
        setSessionStartTime(now);
        setCurrentTime(0);
        setIsRunning(true);
        
        toast({
          title: "Timer iniciado",
          description: "El contador de tiempo ha comenzado para esta tarea.",
        });
      }
    } catch (error) {
      console.error('Error starting timer:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el timer.",
        variant: "destructive",
      });
    }
  };

  const pauseTimer = async () => {
    if (!activeSession || !sessionStartTime) return;

    try {
      await updateSessionState(activeSession.id, 'pausada', currentTime);
      setIsRunning(false);
      setActiveSession({ ...activeSession, estado: 'pausada', tiempo_transcurrido: currentTime });
      
      toast({
        title: "Timer pausado",
        description: "El contador se ha pausado.",
      });
    } catch (error) {
      console.error('Error pausing timer:', error);
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
      // Reset session start time to current time minus elapsed time
      const now = Date.now();
      const newStartTime = now - (currentTime * 1000);
      
      setSessionStartTime(newStartTime);
      setIsRunning(true);
      setActiveSession({ ...activeSession, estado: 'activa' });
      
      toast({
        title: "Timer reanudado",
        description: "El contador continúa.",
      });
    } catch (error) {
      console.error('Error resuming timer:', error);
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
      setSessionStartTime(null);
      
      // Clear localStorage
      localStorage.removeItem('activeTimer');
      
      toast({
        title: "Timer finalizado",
        description: `Se registraron ${minutos} minutos en la tarea.`,
      });
    } catch (error) {
      console.error('Error stopping timer:', error);
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
