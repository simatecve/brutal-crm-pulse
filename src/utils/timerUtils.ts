
import { TimerState } from '@/types/timer';

export const saveTimerState = (activeSession: any, currentTime: number, isRunning: boolean) => {
  if (activeSession) {
    localStorage.setItem('activeTimer', JSON.stringify({
      session: activeSession,
      currentTime,
      isRunning
    }));
  } else {
    localStorage.removeItem('activeTimer');
  }
};

export const loadTimerState = (): TimerState | null => {
  const saved = localStorage.getItem('activeTimer');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Error loading timer state:', error);
      return null;
    }
  }
  return null;
};

export const shouldSaveProgress = (time: number): boolean => {
  return time % 30 === 0;
};
