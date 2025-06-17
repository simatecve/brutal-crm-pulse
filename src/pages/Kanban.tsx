
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
}

const columnas = {
  pendiente: { titulo: 'PENDIENTE', color: 'bg-yellow-400' },
  en_progreso: { titulo: 'EN PROGRESO', color: 'bg-blue-400' },
  completada: { titulo: 'COMPLETADA', color: 'bg-green-400' }
};

const Kanban = () => {
  const [tareas, setTareas] = useState<{ [key: string]: Tarea[] }>({
    pendiente: [],
    en_progreso: [],
    completada: []
  });
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

      // Organizar tareas por estado
      const tareasOrganizadas = {
        pendiente: [],
        en_progreso: [],
        completada: []
      };

      data?.forEach(tarea => {
        tareasOrganizadas[tarea.estado].push(tarea);
      });

      setTareas(tareasOrganizadas);
    } catch (error) {
      console.error('Error fetching tareas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las tareas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = tareas[source.droppableId];
    const finish = tareas[destination.droppableId];

    if (start === finish) {
      const newTareas = Array.from(start);
      const [removed] = newTareas.splice(source.index, 1);
      newTareas.splice(destination.index, 0, removed);

      setTareas({
        ...tareas,
        [source.droppableId]: newTareas
      });
      return;
    }

    // Mover entre columnas
    const startTareas = Array.from(start);
    const [removed] = startTareas.splice(source.index, 1);
    
    const finishTareas = Array.from(finish);
    finishTareas.splice(destination.index, 0, removed);

    setTareas({
      ...tareas,
      [source.droppableId]: startTareas,
      [destination.droppableId]: finishTareas
    });

    // Actualizar en la base de datos
    try {
      await supabase
        .from('tareas')
        .update({ estado: destination.droppableId })
        .eq('id', draggableId);

      toast({
        title: "Tarea actualizada",
        description: `Tarea movida a ${columnas[destination.droppableId].titulo}`,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la tarea.",
        variant: "destructive",
      });
      // Revertir cambios en caso de error
      fetchTareas();
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'bg-red-500';
      case 'alta': return 'bg-orange-500';
      case 'media': return 'bg-yellow-500';
      case 'baja': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return horas > 0 ? `${horas}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-white text-xl font-black">CARGANDO KANBAN...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">KANBAN</h1>
          <p className="text-gray-400 font-bold">Vista de tablero para gestión visual de tareas</p>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.entries(columnas).map(([estadoId, columna]) => (
            <div key={estadoId} className="space-y-4">
              <Card className={`${columna.color} border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-4`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-black">{columna.titulo}</h2>
                  <Badge className="bg-black text-white font-bold">
                    {tareas[estadoId].length}
                  </Badge>
                </div>
              </Card>

              <Droppable droppableId={estadoId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[500px] space-y-3 p-2 rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-gray-200' : 'bg-transparent'
                    }`}
                  >
                    {tareas[estadoId].map((tarea, index) => (
                      <Draggable key={tarea.id} draggableId={tarea.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000000] p-4 cursor-grab active:cursor-grabbing ${
                              snapshot.isDragging ? 'rotate-3 scale-105' : ''
                            } transition-transform`}
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <h3 className="font-black text-black text-sm leading-tight">
                                  {tarea.titulo}
                                </h3>
                                <Badge className={`${getPrioridadColor(tarea.prioridad)} text-white text-xs`}>
                                  {tarea.prioridad.toUpperCase()}
                                </Badge>
                              </div>

                              {tarea.descripcion && (
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {tarea.descripcion}
                                </p>
                              )}

                              {tarea.proyectos && (
                                <div className="flex items-center gap-1">
                                  <User size={12} className="text-gray-500" />
                                  <span className="text-xs font-bold text-gray-700">
                                    {tarea.proyectos.nombre}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1">
                                  <Clock size={12} className="text-gray-500" />
                                  <span className="font-bold">
                                    {formatTime(tarea.tiempo_registrado || 0)}
                                  </span>
                                </div>

                                {tarea.fecha_vencimiento && (
                                  <span className="font-bold text-gray-600">
                                    {new Date(tarea.fecha_vencimiento).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Kanban;
