
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTimer } from '@/hooks/useTimer';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, Play, Pause, Square, Filter } from 'lucide-react';

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
  const [selectedTarea, setSelectedTarea] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroProyecto, setFiltroProyecto] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { activeSession, currentTime, isRunning, startTimer, pauseTimer, resumeTimer, stopTimer } = useTimer();

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
        // Primero obtenemos las tareas del proyecto seleccionado
        const { data: tareasProyecto } = await supabase
          .from('tareas')
          .select('id')
          .eq('proyecto_id', filtroProyecto);
        
        if (tareasProyecto && tareasProyecto.length > 0) {
          const tareaIds = tareasProyecto.map(t => t.id);
          query = query.in('tarea_id', tareaIds);
        } else {
          // Si no hay tareas para este proyecto, no mostramos sesiones
          setSesiones([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      
      // Transformar los datos para que coincidan con la estructura esperada
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

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activa': return 'bg-green-400';
      case 'pausada': return 'bg-yellow-400';
      case 'finalizada': return 'bg-gray-400';
      default: return 'bg-gray-400';
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

      {/* Timer Principal */}
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

      {/* Estadísticas */}
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

      {/* Filtros */}
      <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter size={20} className="text-black" />
          <span className="font-black text-black">FILTROS:</span>
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="border-2 border-black px-3 py-1 font-bold"
          />
          <Select value={filtroProyecto} onValueChange={setFiltroProyecto}>
            <SelectTrigger className="w-48 border-2 border-black">
              <SelectValue placeholder="Filtrar por proyecto" />
            </SelectTrigger>
            <SelectContent>
              {proyectos.map((proyecto) => (
                <SelectItem key={proyecto.id} value={proyecto.id}>
                  {proyecto.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={limpiarFiltros}
            className="bg-gray-400 hover:bg-gray-300 text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] px-4 py-1"
          >
            LIMPIAR
          </Button>
        </div>
      </Card>

      {/* Historial de sesiones */}
      <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] overflow-hidden">
        <div className="bg-yellow-400 border-b-4 border-black p-4">
          <h3 className="text-xl font-black text-black">HISTORIAL DE SESIONES</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 border-b-2 border-black">
              <TableHead className="font-black text-black">TAREA</TableHead>
              <TableHead className="font-black text-black">PROYECTO</TableHead>
              <TableHead className="font-black text-black">DURACIÓN</TableHead>
              <TableHead className="font-black text-black">ESTADO</TableHead>
              <TableHead className="font-black text-black">FECHA INICIO</TableHead>
              <TableHead className="font-black text-black">FECHA FIN</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sesiones.map((sesion) => (
              <TableRow key={sesion.id} className="border-b-2 border-black">
                <TableCell className="font-bold">
                  {sesion.tareas?.titulo || 'Tarea eliminada'}
                </TableCell>
                <TableCell className="font-bold">
                  {sesion.proyectos?.nombre || 'Sin proyecto'}
                </TableCell>
                <TableCell className="font-bold">
                  {formatDuration(sesion.tiempo_transcurrido || 0)}
                </TableCell>
                <TableCell>
                  <span className={`${getEstadoColor(sesion.estado)} text-black px-3 py-1 font-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-xs`}>
                    {sesion.estado.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell className="font-bold">
                  {new Date(sesion.inicio).toLocaleString()}
                </TableCell>
                <TableCell className="font-bold">
                  {sesion.fin ? new Date(sesion.fin).toLocaleString() : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {sesiones.length === 0 && (
        <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-8 text-center">
          <Clock size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-2xl font-black text-black mb-2">NO HAY REGISTROS</h3>
          <p className="text-gray-600 font-bold">Comienza a trackear tu tiempo o ajusta los filtros</p>
        </Card>
      )}
    </div>
  );
};

export default TimeTracker;
