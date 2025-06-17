
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface SesionTiempo {
  id: string;
  tiempo_transcurrido: number;
  inicio: string;
}

interface TimeStatsProps {
  sesiones: SesionTiempo[];
}

const TimeStats = ({ sesiones }: TimeStatsProps) => {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const getTotalTime = () => {
    return sesiones.reduce((total, sesion) => total + (sesion.tiempo_transcurrido || 0), 0);
  };

  const getTotalTimeToday = () => {
    const today = new Date().toDateString();
    return sesiones
      .filter(sesion => new Date(sesion.inicio).toDateString() === today)
      .reduce((total, sesion) => total + (sesion.tiempo_transcurrido || 0), 0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-green-400 border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-6">
        <div className="flex items-center gap-4">
          <Clock size={48} className="text-black" />
          <div>
            <h3 className="text-lg font-black text-black">HOY</h3>
            <p className="text-2xl font-black text-black">{formatDuration(getTotalTimeToday())}</p>
          </div>
        </div>
      </Card>

      <Card className="bg-blue-400 border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-6">
        <div className="flex items-center gap-4">
          <Clock size={48} className="text-black" />
          <div>
            <h3 className="text-lg font-black text-black">TOTAL</h3>
            <p className="text-2xl font-black text-black">{formatDuration(getTotalTime())}</p>
          </div>
        </div>
      </Card>

      <Card className="bg-pink-400 border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-6">
        <div className="flex items-center gap-4">
          <Clock size={48} className="text-black" />
          <div>
            <h3 className="text-lg font-black text-black">SESIONES</h3>
            <p className="text-2xl font-black text-black">{sesiones.length}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TimeStats;
