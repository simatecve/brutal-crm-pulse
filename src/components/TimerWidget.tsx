
import { Play, Pause, Square, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTimer } from '@/hooks/useTimer';

const TimerWidget = () => {
  const { activeSession, currentTime, isRunning, pauseTimer, resumeTimer, stopTimer } = useTimer();

  if (!activeSession) return null;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="fixed bottom-4 right-4 bg-yellow-400 border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-4 z-50">
      <div className="flex items-center gap-3">
        <Clock size={24} className="text-black" />
        <div className="text-black font-black">
          <div className="text-xs">TIMER ACTIVO</div>
          <div className="text-xl">{formatTime(currentTime)}</div>
        </div>
        <div className="flex gap-2">
          {isRunning ? (
            <Button
              onClick={pauseTimer}
              className="bg-orange-400 hover:bg-orange-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] p-2"
            >
              <Pause size={16} />
            </Button>
          ) : (
            <Button
              onClick={resumeTimer}
              className="bg-green-400 hover:bg-green-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] p-2"
            >
              <Play size={16} />
            </Button>
          )}
          <Button
            onClick={stopTimer}
            className="bg-red-400 hover:bg-red-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] p-2"
          >
            <Square size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TimerWidget;
