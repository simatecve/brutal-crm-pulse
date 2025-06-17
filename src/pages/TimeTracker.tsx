
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import TimerControl from '@/components/timetracker/TimerControl';
import TimeStats from '@/components/timetracker/TimeStats';
import SessionFilters from '@/components/timetracker/SessionFilters';
import SessionsTable from '@/components/timetracker/SessionsTable';

interface Tarea {
  id: string;
  titulo: string;
  proyectos?: { nombre: string };
}

interface Proyecto {
  id: string;
  nombre: string;
}

interface SesionTiempo {
  id: string;
  tiempo_transcurrido: number;
  estado: string;
  inicio: string;
  fin: string | null;
  tareas?: { titulo: string };
  proyectos?: { nombre: string };
}

const TimeTracker = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [sesiones, setSesiones] = useState<SesionTiempo[]>([]);
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroProyecto, setFiltroProyecto] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchTareas();
    fetchProyectos();
    fetchSesiones();
  }, []);

  useEffect(() => {
    fetchSesiones();
  }, [filtroFecha, filtroProyecto]);

  const fetchTareas = async () => {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .select(`
          id,
          titulo,
          proyectos (nombre)
        `)
        .eq('user_id', user?.id)
        .neq('estado', 'completada')
        .order('titulo');

      if (error) throw error;
      setTareas(data || []);
    } catch (error) {
      console.error('Error fetching tareas:', error);
    }
  };

  const fetchProyectos = async () => {
    try {
      const { data, error } = await supabase
        .from('proyectos')
        .select('id, nombre')
        .eq('user_id', user?.id)
        .neq('estado', 'cancelado')
        .order('nombre');

      if (error) throw error;
      setProyectos(data || []);
    } catch (error) {
      console.error('Error fetching proyectos:', error);
    }
  };

  const fetchSesiones = async () => {
    try {
      let query = supabase
        .from('sesiones_tiempo')
        .select(`
          *,
          tareas!inner (
            titulo,
            proyectos (nombre)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (filtroFecha) {
        const fechaInicio = new Date(filtroFecha);
        const fechaFin = new Date(filtroFecha);
        fechaFin.setHours(23, 59, 59, 999);
        
        query = query
          .gte('inicio', fechaInicio.toISOString())
          .lte('inicio', fechaFin.toISOString());
      }

      if (filtroProyecto) {
        const { data: tareasProyecto } = await supabase
          .from('tareas')
          .select('id')
          .eq('proyecto_id', filtroProyecto);
        
        if (tareasProyecto && tareasProyecto.length > 0) {
          const tareaIds = tareasProyecto.map(t => t.id);
          query = query.in('tarea_id', tareaIds);
        } else {
          setSesiones([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      
      const sesionesTransformadas = (data || []).map(sesion => ({
        ...sesion,
        proyectos: sesion.tareas?.proyectos
      }));
      
      setSesiones(sesionesTransformadas);
    } catch (error) {
      console.error('Error fetching sesiones:', error);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltroFecha('');
    setFiltroProyecto('');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-white text-xl font-black">CARGANDO TIME TRACKER...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">TIME TRACKER</h1>
        <p className="text-gray-400 font-bold">Controla y registra tu tiempo de trabajo</p>
      </div>

      <TimerControl tareas={tareas} />

      <TimeStats sesiones={sesiones} />

      <SessionFilters
        filtroFecha={filtroFecha}
        setFiltroFecha={setFiltroFecha}
        filtroProyecto={filtroProyecto}
        setFiltroProyecto={setFiltroProyecto}
        proyectos={proyectos}
        onLimpiarFiltros={limpiarFiltros}
      />

      <SessionsTable sesiones={sesiones} />
    </div>
  );
};

export default TimeTracker;
