
import { Card } from '@/components/ui/card';
import { CheckSquare, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface TasksOverviewProps {
  stats: {
    tareasPendientes: number;
    tareasEnProgreso: number;
    tareasCompletadas: number;
    tareasVencidas: number;
  };
}

const TasksOverview = ({ stats }: TasksOverviewProps) => {
  const taskStats = [
    {
      label: 'PENDIENTES',
      value: stats.tareasPendientes,
      icon: CheckSquare,
      color: 'bg-yellow-400',
      textColor: 'text-black'
    },
    {
      label: 'EN PROGRESO',
      value: stats.tareasEnProgreso,
      icon: Clock,
      color: 'bg-blue-400',
      textColor: 'text-black'
    },
    {
      label: 'COMPLETADAS',
      value: stats.tareasCompletadas,
      icon: CheckCircle,
      color: 'bg-green-400',
      textColor: 'text-black'
    },
    {
      label: 'VENCIDAS',
      value: stats.tareasVencidas,
      icon: AlertTriangle,
      color: 'bg-red-400',
      textColor: 'text-black'
    }
  ];

  return (
    <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-6">
      <h2 className="text-2xl font-black text-black mb-6">RESUMEN DE TAREAS</h2>
      <div className="grid grid-cols-2 gap-4">
        {taskStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`${stat.color} border-2 border-black shadow-[4px_4px_0px_0px_#000000] p-4 flex items-center gap-3`}
            >
              <Icon size={24} className={stat.textColor} />
              <div>
                <p className="text-xs font-bold text-black">{stat.label}</p>
                <p className="text-2xl font-black text-black">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default TasksOverview;
