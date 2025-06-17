
import { useEffect, useRef } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTimer } from '@/hooks/useTimer';

interface BreakReminderSettings {
  reminderInterval: number; // minutes
  maxSessionTime: number; // minutes
  enabled: boolean;
}

const DEFAULT_SETTINGS: BreakReminderSettings = {
  reminderInterval: 25, // Pomodoro style - 25 minutes
  maxSessionTime: 90, // Maximum 1.5 hours
  enabled: true
};

export const useBreakReminders = (settings: BreakReminderSettings = DEFAULT_SETTINGS) => {
  const { addNotification } = useNotifications();
  const { currentTime, isRunning } = useTimer();
  const lastReminderRef = useRef<number>(0);
  const settingsRef = useRef(settings);

  // Update settings ref when settings change
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    if (!isRunning || !settingsRef.current.enabled) {
      lastReminderRef.current = 0;
      return;
    }

    const currentMinutes = Math.floor(currentTime / 60);
    const { reminderInterval, maxSessionTime } = settingsRef.current;

    // Check for break reminder
    if (currentMinutes > 0 && currentMinutes % reminderInterval === 0 && 
        currentMinutes !== lastReminderRef.current) {
      
      lastReminderRef.current = currentMinutes;
      
      addNotification({
        title: '☕ TIEMPO DE DESCANSO',
        message: `Has trabajado ${currentMinutes} minutos. ¡Considera tomar un descanso!`,
        type: 'info'
      });
    }

    // Check for maximum session time alert
    if (currentMinutes >= maxSessionTime) {
      addNotification({
        title: '🚨 SESIÓN MUY LARGA',
        message: `Has superado los ${maxSessionTime} minutos. ¡Es hora de parar y descansar!`,
        type: 'warning'
      });
    }

    // Eye strain reminder every hour
    if (currentMinutes > 0 && currentMinutes % 60 === 0) {
      addNotification({
        title: '👁️ CUIDA TUS OJOS',
        message: 'Mira algo lejano por 20 segundos para descansar la vista.',
        type: 'info'
      });
    }

  }, [currentTime, isRunning, addNotification]);

  return {
    currentSessionMinutes: Math.floor(currentTime / 60),
    nextBreakIn: settingsRef.current.reminderInterval - (Math.floor(currentTime / 60) % settingsRef.current.reminderInterval),
    maxSessionReached: Math.floor(currentTime / 60) >= settingsRef.current.maxSessionTime
  };
};
