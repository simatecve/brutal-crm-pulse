
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

interface TimeEntry {
  id: string;
  descripcion: string;
  tiempo_minutos: number;
  fecha_inicio: string;
  fecha_fin: string;
  tareas?: { titulo: string };
  proyectos?: { nombre: string };
}

interface SesionTiempo {
  id: string;
  tiempo_transcurrido: number;
  estado: string;
  inicio: string;
  fin: string;
  tareas?: { titulo: string };
}

const TimeTracker = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [sesiones, setSesiones] = useState<SesionTiempo[]>([]);
  const [selectedTarea, setSelectedTarea] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { activeSession, currentTime, isRunning, startTimer, pauseTimer, resumeTimer, stopTimer } = useTimer();

  useEffect(() => {
    fetchTareas();
    fetchTimeEntries();
    fetchSesiones();
  }, []);

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

  const fetchTimeEntries = async () => {
    try {
      let query = supabase
        .from('time_entries')
        .select(`
          *,
          tareas (titulo),
          proyectos (nombre)
        `)
        .eq('user_id', user?.id)
        .order('fecha_inicio', { ascending: false });

      if (filtroFecha) {
        const fechaInicio = new Date(filtroFecha);
        const fechaFin = new Date(filtroFecha);
        fechaFin.setHours(23, 59, 59, 999);
        
        query = query
          .gte('fecha_inicio', fechaInicio.toISOString())
          .lte('fecha_inicio', fechaFin.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      setTimeEntries(data || []);
    } catch (error) {
      console.error('Error fetching time entries:', error);
    }
  };

  const fetchSesiones = async () => {
    try {
      const { data, error } = await supabase
        .from('sesiones_tiempo')
        .select(`
          *,
          tareas (titulo)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSesiones(data || []);
    } catch (error) {
      console.error('Error fetching sesiones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeEntries();
  }, [filtroFecha]);

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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getTotalTime = () => {
    return timeEntries.reduce((total, entry) => total + entry.tiempo_minutos, 0);
  };

  const getTotalTimeToday = () => {
    const today = new Date().toDateString();
    return timeEntries
      .filter(entry => new Date(entry.fecha_inicio).toDateString() === today)
      .reduce((total, entry) => total + entry.tiempo_minutos, 0);
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
              <p className="text-2xl font-black text-black">{timeEntries.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-4">
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-black" />
          <span className="font-black text-black">FILTROS:</span>
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="border-2 border-black px-3 py-1 font-bold"
          />
          <Button
            onClick={() => setFiltroFecha('')}
            className="bg-gray-400 hover:bg-gray-300 text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] px-4 py-1"
          >
            LIMPIAR
          </Button>
        </div>
      </Card>

      {/* Historial de tiempo */}
      <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] overflow-hidden">
        <div className="bg-yellow-400 border-b-4 border-black p-4">
          <h3 className="text-xl font-black text-black">HISTORIAL DE TIEMPO</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 border-b-2 border-black">
              <TableHead className="font-black text-black">TAREA</TableHead>
              <TableHead className="font-black text-black">PROYECTO</TableHead>
              <TableHead className="font-black text-black">DURACIÓN</TableHead>
              <TableHead className="font-black text-black">FECHA</TableHead>
              <TableHead className="font-black text-black">HORA INICIO</TableHead>
              <TableHead className="font-black text-black">HORA FIN</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeEntries.map((entry) => (
              <TableRow key={entry.id} className="border-b-2 border-black">
                <TableCell className="font-bold">
                  {entry.tareas?.titulo || 'Tarea eliminada'}
                </TableCell>
                <TableCell className="font-bold">
                  {entry.proyectos?.nombre || 'Sin proyecto'}
                </TableCell>
                <TableCell className="font-bold">
                  {formatDuration(entry.tiempo_minutos)}
                </TableCell>
                <TableCell className="font-bold">
                  {new Date(entry.fecha_inicio).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-bold">
                  {new Date(entry.fecha_inicio).toLocaleTimeString()}
                </TableCell>
                <TableCell className="font-bold">
                  {entry.fecha_fin ? new Date(entry.fecha_fin).toLocaleTimeString() : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {timeEntries.length === 0 && (
        <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-8 text-center">
          <Clock size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-2xl font-black text-black mb-2">NO HAY REGISTROS</h3>
          <p className="text-gray-600 font-bold">Comienza a trackear tu tiempo</p>
        </Card>
      )}
    </div>
  );
};

export default TimeTracker;
