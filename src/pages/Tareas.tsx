
import { useState, useEffect } from 'react';
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
}

const Tareas = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTarea, setEditingTarea] = useState<Tarea | null>(null);
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchTareas();
  }, []);

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

      {tareas.length === 0 ? (
        <TareasEmptyState />
      ) : (
        <TareasTable
          tareas={tareas}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSelectTarea={setSelectedTarea}
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
