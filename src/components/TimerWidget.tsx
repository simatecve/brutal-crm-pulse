import { useState, useEffect } from 'react';
import { useTimer } from '@/hooks/useTimer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Square, Maximize2, Minimize2 } from 'lucide-react';
import { useBreakReminders } from '@/hooks/useBreakReminders';

interface Tarea {
  id: string;
  titulo: string;
}

const TimerWidget = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [selectedTarea, setSelectedTarea] = useState('');
  const { user } = useAuth();
  const { activeSession, currentTime, isRunning, startTimer, pauseTimer, resumeTimer, stopTimer } = useTimer();
  
  // Add break reminders
  const { nextBreakIn, maxSessionReached } = useBreakReminders({
    reminderInterval: 25,
    maxSessionTime: 90,
    enabled: true
  });

  useEffect(() => {
    if (user) {
      fetchTareas();
    }
  }, [user]);

  const fetchTareas = async () => {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .select('id, titulo')
        .eq('user_id', user?.id);

      if (error) throw error;
      if (data) {
        setTareas(data);
      }
    } catch (error) {
      console.error('Error fetching tareas:', error);
    }
  };

  const handleStartTimer = async () => {
    if (selectedTarea) {
      await startTimer(selectedTarea);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTareaTitle = (tareaId: string) => {
    const tarea = tareas.find(t => t.id === tareaId);
    return tarea ? tarea.titulo : 'Desconocida';
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Card className={`bg-yellow-400 border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-4 min-w-72 ${
        maxSessionReached ? 'animate-pulse bg-red-400' : ''
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-black text-black">TIMER</h3>
          <div className="flex items-center gap-2">
            {activeSession && (
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></div>
                <span className="text-xs font-bold text-black">
                  {isRunning ? 'ACTIVO' : 'PAUSADO'}
                </span>
              </div>
            )}
            <Button
              onClick={() => setIsCollapsed(!isCollapsed)}
              size="sm"
              className="bg-white hover:bg-gray-100 text-black font-bold border-2 border-black"
            >
              {isCollapsed ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </Button>
          </div>
        </div>

        {!isCollapsed && (
          <>
            <div className="text-3xl font-black text-black mb-2">
              {formatTime(currentTime)}
            </div>

            {activeSession && (
              <div className="mb-3">
                <p className="text-black font-bold text-sm mb-1">
                  Tarea: {getTareaTitle(activeSession.tarea_id)}
                </p>
                {isRunning && (
                  <p className="text-xs text-black font-bold">
                    Próximo descanso en: {nextBreakIn} min
                  </p>
                )}
                {maxSessionReached && (
                  <p className="text-xs text-red-700 font-black animate-pulse">
                    ⚠️ SESIÓN MUY LARGA - ¡DESCANSA!
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              {!activeSession ? (
                <div className="space-y-2">
                  <Select value={selectedTarea} onValueChange={setSelectedTarea}>
                    <SelectTrigger className="border-2 border-black text-black font-bold">
                      <SelectValue placeholder="Selecciona una tarea" />
                    </SelectTrigger>
                    <SelectContent>
                      {tareas.map((tarea) => (
                        <SelectItem key={tarea.id} value={tarea.id}>
                          {tarea.titulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleStartTimer}
                    disabled={!selectedTarea}
                    className="w-full bg-green-400 hover:bg-green-300 text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] disabled:bg-gray-300"
                  >
                    <Play className="mr-2" size={16} />
                    INICIAR
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {isRunning ? (
                    <Button
                      onClick={pauseTimer}
                      className="w-full bg-orange-400 hover:bg-orange-300 text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                    >
                      <Pause className="mr-2" size={16} />
                      PAUSAR
                    </Button>
                  ) : (
                    <Button
                      onClick={resumeTimer}
                      className="w-full bg-green-400 hover:bg-green-300 text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                    >
                      <Play className="mr-2" size={16} />
                      REANUDAR
                    </Button>
                  )}
                  <Button
                    onClick={stopTimer}
                    className="w-full bg-red-400 hover:bg-red-300 text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                  >
                    <Square className="mr-2" size={16} />
                    FINALIZAR
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default TimerWidget;
