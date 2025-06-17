
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import TareaDetalle from '@/components/TareaDetalle';
import TareaForm from '@/components/tareas/TareaForm';
import TareasTable from '@/components/tareas/TareasTable';
import TareasEmptyState from '@/components/tareas/TareasEmptyState';
import TareasFilters from '@/components/tareas/TareasFilters';

interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'pendiente' | 'en_progreso' | 'completada';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  fecha_vencimiento: string;
  tiempo_estimado: number;
  tiempo_registrado: number;
  proyecto_id: string;
  proyectos?: { nombre: string };
  tiempo_total?: number;
  created_at: string;
}

const Tareas = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTarea, setEditingTarea] = useState<Tarea | null>(null);
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para filtros y ordenamiento
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState('todos');
  const [ordenarPor, setOrdenarPor] = useState('created_at');
  const [direccionOrden, setDireccionOrden] = useState<'asc' | 'desc'>('desc');
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchTareas();
  }, []);

  // Función para obtener el valor numérico de prioridad para ordenamiento
  const getPrioridadNumero = (prioridad: string) => {
    switch (prioridad) {
      case 'baja': return 1;
      case 'media': return 2;
      case 'alta': return 3;
      case 'urgente': return 4;
      default: return 0;
    }
  };

  // Función para obtener el valor numérico de estado para ordenamiento
  const getEstadoNumero = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 1;
      case 'en_progreso': return 2;
      case 'completada': return 3;
      default: return 0;
    }
  };

  // Memo para tareas filtradas y ordenadas
  const tareasFiltradas = useMemo(() => {
    let filtradas = [...tareas];

    // Aplicar filtro de estado
    if (filtroEstado !== 'todos') {
      filtradas = filtradas.filter(tarea => tarea.estado === filtroEstado);
    }

    // Aplicar filtro de prioridad
    if (filtroPrioridad !== 'todos') {
      filtradas = filtradas.filter(tarea => tarea.prioridad === filtroPrioridad);
    }

    // Aplicar ordenamiento
    filtradas.sort((a, b) => {
      let valorA: any, valorB: any;

      switch (ordenarPor) {
        case 'prioridad':
          valorA = getPrioridadNumero(a.prioridad);
          valorB = getPrioridadNumero(b.prioridad);
          break;
        case 'estado':
          valorA = getEstadoNumero(a.estado);
          valorB = getEstadoNumero(b.estado);
          break;
        case 'tiempo_total':
          valorA = a.tiempo_total || 0;
          valorB = b.tiempo_total || 0;
          break;
        case 'fecha_vencimiento':
          valorA = a.fecha_vencimiento ? new Date(a.fecha_vencimiento).getTime() : 0;
          valorB = b.fecha_vencimiento ? new Date(b.fecha_vencimiento).getTime() : 0;
          break;
        case 'titulo':
          valorA = a.titulo.toLowerCase();
          valorB = b.titulo.toLowerCase();
          break;
        case 'created_at':
        default:
          valorA = new Date(a.created_at).getTime();
          valorB = new Date(b.created_at).getTime();
          break;
      }

      if (direccionOrden === 'asc') {
        return valorA > valorB ? 1 : valorA < valorB ? -1 : 0;
      } else {
        return valorA < valorB ? 1 : valorA > valorB ? -1 : 0;
      }
    });

    return filtradas;
  }, [tareas, filtroEstado, filtroPrioridad, ordenarPor, direccionOrden]);

  const fetchTareas = async () => {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .select(`
          *,
          proyectos (nombre)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Obtener tiempo total de sesiones para cada tarea
      const tareasConTiempo = await Promise.all((data || []).map(async (tarea) => {
        const { data: sesiones } = await supabase
          .from('sesiones_tiempo')
          .select('tiempo_transcurrido')
          .eq('tarea_id', tarea.id);
        
        const tiempoTotalSegundos = sesiones?.reduce((total, sesion) => total + (sesion.tiempo_transcurrido || 0), 0) || 0;
        
        return {
          ...tarea,
          estado: tarea.estado as 'pendiente' | 'en_progreso' | 'completada',
          prioridad: tarea.prioridad as 'baja' | 'media' | 'alta' | 'urgente',
          tiempo_total: tiempoTotalSegundos
        };
      }));
      
      setTareas(tareasConTiempo);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las tareas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tarea: Tarea) => {
    setEditingTarea(tarea);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setTareas(prev => prev.filter(tarea => tarea.id !== id));
  };

  const handleFormClose = () => {
    setIsDialogOpen(false);
    setEditingTarea(null);
  };

  const handleFormSuccess = () => {
    fetchTareas();
  };

  const handleNewTarea = () => {
    setEditingTarea(null);
    setIsDialogOpen(true);
  };

  const handleSelectTarea = (tarea: Tarea) => {
    setSelectedTarea(tarea);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-white text-xl font-black">CARGANDO TAREAS...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">TAREAS</h1>
          <p className="text-gray-400 font-bold">Gestiona tus tareas y tiempo</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleNewTarea}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_#000000]"
            >
              <Plus className="mr-2" size={20} />
              NUEVA TAREA
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <TareasFilters
        filtroEstado={filtroEstado}
        filtroPrioridad={filtroPrioridad}
        ordenarPor={ordenarPor}
        direccionOrden={direccionOrden}
        onFiltroEstadoChange={setFiltroEstado}
        onFiltroPrioridadChange={setFiltroPrioridad}
        onOrdenarPorChange={setOrdenarPor}
        onDireccionOrdenChange={setDireccionOrden}
      />

      {tareasFiltradas.length === 0 ? (
        tareas.length === 0 ? (
          <TareasEmptyState />
        ) : (
          <div className="text-center text-white text-xl font-black">
            NO SE ENCONTRARON TAREAS CON LOS FILTROS APLICADOS
          </div>
        )
      ) : (
        <TareasTable
          tareas={tareasFiltradas}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSelectTarea={handleSelectTarea}
          onUpdate={fetchTareas}
        />
      )}

      <TareaForm
        isOpen={isDialogOpen}
        onClose={handleFormClose}
        editingTarea={editingTarea}
        onSuccess={handleFormSuccess}
      />

      {selectedTarea && (
        <TareaDetalle
          tarea={selectedTarea}
          onClose={() => setSelectedTarea(null)}
          onUpdate={fetchTareas}
        />
      )}
    </div>
  );
};

export default Tareas;
