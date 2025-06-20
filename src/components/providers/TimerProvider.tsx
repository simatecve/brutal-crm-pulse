
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
  const lastSaveRef = useRef<number>(0);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load active session only once when user is available
  useEffect(() => {
    if (user && !activeSession) {
      loadActiveSessionData();
    }
  }, [user]);

  // Load saved state from localStorage only once on mount
  useEffect(() => {
    if (user) {
      const saved = loadTimerState();
      if (saved) {
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
    }
  }, [user]);

  // Main timer interval - only runs when timer is active
  useEffect(() => {
    if (isRunning && activeSession && startTime) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        const totalTime = activeSession.tiempo_transcurrido + elapsed;
        
        setCurrentTime(totalTime);
        
        // Save progress periodically (every 30 seconds)
        if (shouldSaveProgress(totalTime) && totalTime !== lastSaveRef.current) {
          lastSaveRef.current = totalTime;
          saveProgress(activeSession.id, totalTime);
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
  }, [isRunning, activeSession?.id, startTime]);

  // Save to localStorage when state changes (debounced)
  useEffect(() => {
    if (activeSession) {
      const timeoutId = setTimeout(() => {
        saveTimerState({
          ...activeSession,
          tiempo_transcurrido: currentTime
        }, currentTime, isRunning, startTime);
      }, 500); // Debounce saves

      return () => clearTimeout(timeoutId);
    }
  }, [activeSession, currentTime, isRunning, startTime]);

  // Handle visibility change (tab switching)
  useEffect(() => {
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
  }, [isRunning, activeSession, startTime]);

  const loadActiveSessionData = async () => {
    if (!user?.id) return;
    
    try {
      const session = await loadActiveSession(user.id);
      if (session) {
        setActiveSession(session);
        setCurrentTime(session.tiempo_transcurrido);
        
        if (session.estado === 'activa') {
          // If the session is active, calculate start time based on stored time
          const now = Date.now();
          const calculatedStartTime = now - (session.tiempo_transcurrido * 1000);
          
          setStartTime(calculatedStartTime);
          setIsRunning(true);
        } else {
          setIsRunning(false);
          setStartTime(null);
        }
      }
    } catch (error) {
      console.error('Error loading active session:', error);
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
      setStartTime(null);
      
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
