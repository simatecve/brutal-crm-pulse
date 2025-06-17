
import { useState } from 'react';
import { useTimer } from '@/hooks/useTimer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Square } from 'lucide-react';

interface Tarea {
  id: string;
  titulo: string;
  proyectos?: { nombre: string };
}

interface TimerControlProps {
  tareas: Tarea[];
}

const TimerControl = ({ tareas }: TimerControlProps) => {
  const [selectedTarea, setSelectedTarea] = useState('');
  const { activeSession, currentTime, isRunning, startTimer, pauseTimer, resumeTimer, stopTimer } = useTimer();

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

  return (
    <Card className="bg-yellow-400 border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-black mb-2">TIMER PRINCIPAL</h2>
          <div className="text-4xl font-black text-black">
            {formatTime(currentTime)}
          </div>
          {activeSession && (
            <p className="text-black font-bold mt-2">
              Tarea activa: {tareas.find(t => t.id === activeSession.tarea_id)?.titulo || 'Desconocida'}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {!activeSession ? (
            <div className="space-y-2">
              <Select value={selectedTarea} onValueChange={setSelectedTarea}>
                <SelectTrigger className="w-64 border-2 border-black">
                  <SelectValue placeholder="Selecciona una tarea" />
                </SelectTrigger>
                <SelectContent>
                  {tareas.map((tarea) => (
                    <SelectItem key={tarea.id} value={tarea.id}>
                      {tarea.titulo} - {tarea.proyectos?.nombre || 'Sin proyecto'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleStartTimer}
                disabled={!selectedTarea}
                className="w-64 bg-green-400 hover:bg-green-300 text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] disabled:bg-gray-300"
              >
                <Play className="mr-2" size={20} />
                INICIAR TIMER
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {isRunning ? (
                <Button
                  onClick={pauseTimer}
                  className="w-64 bg-orange-400 hover:bg-orange-300 text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                >
                  <Pause className="mr-2" size={20} />
                  PAUSAR
                </Button>
              ) : (
                <Button
                  onClick={resumeTimer}
                  className="w-64 bg-green-400 hover:bg-green-300 text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                >
                  <Play className="mr-2" size={20} />
                  REANUDAR
                </Button>
              )}
              <Button
                onClick={stopTimer}
                className="w-64 bg-red-400 hover:bg-red-300 text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
              >
                <Square className="mr-2" size={20} />
                FINALIZAR
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TimerControl;
