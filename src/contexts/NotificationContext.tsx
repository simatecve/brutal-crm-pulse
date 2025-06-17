
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Bell, Clock, AlertTriangle } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep only last 50

    // Show toast notification
    const icon = notification.type === 'warning' ? AlertTriangle : 
                notification.type === 'error' ? AlertTriangle : 
                notification.type === 'success' ? Clock : Bell;

    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.type === 'error' ? 'destructive' : 'default',
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Check for upcoming tasks every 5 minutes
  useEffect(() => {
    if (!user) return;

    const checkUpcomingTasks = async () => {
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const { data: tareas } = await supabase
          .from('tareas')
          .select('id, titulo, fecha_vencimiento')
          .eq('user_id', user.id)
          .in('estado', ['pendiente', 'en_progreso'])
          .not('fecha_vencimiento', 'is', null)
          .lte('fecha_vencimiento', tomorrow.toISOString().split('T')[0]);

        if (tareas && tareas.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const todayTasks = tareas.filter(t => t.fecha_vencimiento === today);
          const tomorrowTasks = tareas.filter(t => t.fecha_vencimiento === tomorrow.toISOString().split('T')[0]);

          if (todayTasks.length > 0) {
            addNotification({
              title: '⚠️ TAREAS VENCEN HOY',
              message: `Tienes ${todayTasks.length} tarea(s) que vencen hoy`,
              type: 'warning'
            });
          }

          if (tomorrowTasks.length > 0) {
            addNotification({
              title: '📅 TAREAS VENCEN MAÑANA',
              message: `Tienes ${tomorrowTasks.length} tarea(s) que vencen mañana`,
              type: 'info'
            });
          }
        }
      } catch (error) {
        console.error('Error checking upcoming tasks:', error);
      }
    };

    // Check immediately
    checkUpcomingTasks();

    // Then check every 5 minutes
    const interval = setInterval(checkUpcomingTasks, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
