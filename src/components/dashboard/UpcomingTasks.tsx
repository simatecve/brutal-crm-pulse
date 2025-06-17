import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Calendar, Clock } from 'lucide-react';

interface Tarea {
  id: string;
  titulo: string;
  fecha_vencimiento: string;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  proyectos?: { nombre: string };
}

const UpcomingTasks = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUpcomingTasks();
    }
  }, [user]);

  const fetchUpcomingTasks = async () => {
    try {
      const hoy = new Date();
      const unaSemana = new Date();
      unaSemana.setDate(hoy.getDate() + 7);

      const { data, error } = await supabase
        .from('tareas')
        .select(`
          id,
          titulo,
          fecha_vencimiento,
          prioridad,
          proyectos (nombre)
        `)
        .eq('user_id', user?.id)
        .in('estado', ['pendiente', 'en_progreso'])
        .not('fecha_vencimiento', 'is', null)
        .lte('fecha_vencimiento', unaSemana.toISOString().split('T')[0])
        .order('fecha_vencimiento', { ascending: true })
        .limit(5);

      if (error) throw error;
      
      // Cast the prioridad field to the correct type
      const tareasWithCorrectTypes = (data || []).map(tarea => ({
        ...tarea,
        prioridad: tarea.prioridad as 'baja' | 'media' | 'alta' | 'urgente'
      }));
      
      setTareas(tareasWithCorrectTypes);
    } catch (error) {
      console.error('Error fetching upcoming tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'bg-red-400';
      case 'alta': return 'bg-orange-400';
      case 'media': return 'bg-yellow-400';
      case 'baja': return 'bg-green-400';
      default: return 'bg-gray-400';
    }
  };

  const getDaysRemaining = (fecha: string) => {
    const hoy = new Date();
    const vencimiento = new Date(fecha);
    const diffTime = vencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'VENCIDA', color: 'text-red-600' };
    if (diffDays === 0) return { text: 'HOY', color: 'text-orange-600' };
    if (diffDays === 1) return { text: 'MAÑANA', color: 'text-yellow-600' };
    return { text: `${diffDays} DÍAS`, color: 'text-black' };
  };

  if (loading) {
    return (
      <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-6">
        <div className="text-center text-black font-black">CARGANDO...</div>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-6">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle size={24} className="text-black" />
        <h2 className="text-2xl font-black text-black">TAREAS PRÓXIMAS</h2>
      </div>
      
      {tareas.length === 0 ? (
        <div className="text-center py-4">
          <Calendar size={48} className="mx-auto mb-2 text-gray-400" />
          <p className="font-bold text-gray-600">No hay tareas próximas a vencer</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tareas.map((tarea) => {
            const daysRemaining = getDaysRemaining(tarea.fecha_vencimiento);
            return (
              <div
                key={tarea.id}
                className="border-2 border-black p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-black text-black text-sm">{tarea.titulo}</h3>
                    {tarea.proyectos && (
                      <p className="text-xs text-gray-600 font-bold">{tarea.proyectos.nombre}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`${getPriorityColor(tarea.prioridad)} text-black text-xs font-black px-2 py-1 border border-black`}>
                      {tarea.prioridad.toUpperCase()}
                    </span>
                    <span className={`text-xs font-black ${daysRemaining.color}`}>
                      {daysRemaining.text}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default UpcomingTasks;
