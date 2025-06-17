
import { useState } from 'react';
import { Bell, X, Check, CheckCheck, Trash } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/contexts/NotificationContext';

const NotificationWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      default: return '📢';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Notification Bell */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-yellow-400 hover:bg-yellow-300 text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] transition-all"
        size="lg"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black rounded-full h-6 w-6 flex items-center justify-center border-2 border-black">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute top-16 right-0 w-96 max-h-96 overflow-y-auto bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-black">NOTIFICACIONES</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  size="sm"
                  className="bg-green-400 hover:bg-green-300 text-black font-bold border-2 border-black"
                >
                  <CheckCheck size={16} />
                </Button>
              )}
              <Button
                onClick={clearNotifications}
                size="sm"
                className="bg-red-400 hover:bg-red-300 text-black font-bold border-2 border-black"
              >
                <Trash size={16} />
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                size="sm"
                className="bg-gray-400 hover:bg-gray-300 text-black font-bold border-2 border-black"
              >
                <X size={16} />
              </Button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <Bell size={48} className="mx-auto mb-2 opacity-50" />
              <p className="font-bold">No hay notificaciones</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-2 border-black ${
                    notification.read ? 'bg-gray-100' : 'bg-yellow-100'
                  } hover:bg-gray-50 transition-colors cursor-pointer`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{getNotificationIcon(notification.type)}</span>
                        <h4 className="font-black text-sm text-black">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-700 mb-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default NotificationWidget;
