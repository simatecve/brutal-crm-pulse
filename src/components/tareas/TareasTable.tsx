
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useTimer } from '@/hooks/useTimer';
import { CheckSquare, Play, Edit2, Trash2, Clock, MessageSquare } from 'lucide-react';

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

interface TareasTableProps {
  tareas: Tarea[];
  onEdit: (tarea: Tarea) => void;
  onDelete: (id: string) => void;
  onSelectTarea: (tarea: Tarea) => void;
  onUpdate: () => void;
}

const TareasTable = ({ tareas, onEdit, onDelete, onSelectTarea, onUpdate }: TareasTableProps) => {
  const { toast } = useToast();
  const { startTimer, activeSession } = useTimer();

  const updateTareaField = async (tareaId: string, field: 'estado' | 'prioridad', value: string) => {
    try {
      const { error } = await supabase
        .from('tareas')
        .update({ [field]: value })
        .eq('id', tareaId);

      if (error) throw error;

      toast({
        title: "Actualizado",
        description: `${field === 'estado' ? 'Estado' : 'Prioridad'} actualizada correctamente.`,
      });
      
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo actualizar la ${field === 'estado' ? 'estado' : 'prioridad'}.`,
        variant: "destructive",
      });
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'baja': return 'bg-green-400';
      case 'media': return 'bg-yellow-400';
      case 'alta': return 'bg-orange-400';
      case 'urgente': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-gray-400';
      case 'en_progreso': return 'bg-blue-400';
      case 'completada': return 'bg-green-400';
      default: return 'bg-gray-400';
    }
  };

  const formatTime = (segundos: number) => {
    if (!segundos) return '0s';
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    
    if (horas > 0) {
      return `${horas}h ${minutos}m ${segs}s`;
    } else if (minutos > 0) {
      return `${minutos}m ${segs}s`;
    } else {
      return `${segs}s`;
    }
  };

  const handleStartTimer = async (tareaId: string) => {
    await startTimer(tareaId);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return;

    try {
      const { error } = await supabase
        .from('tareas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Tarea eliminada",
        description: "La tarea se eliminó correctamente.",
      });
      
      onDelete(id);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-yellow-400 border-b-4 border-black">
            <TableHead className="font-black text-black">TAREA</TableHead>
            <TableHead className="font-black text-black">PROYECTO</TableHead>
            <TableHead className="font-black text-black">PRIORIDAD</TableHead>
            <TableHead className="font-black text-black">ESTADO</TableHead>
            <TableHead className="font-black text-black">TIEMPO USADO</TableHead>
            <TableHead className="font-black text-black">ACCIONES</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tareas.map((tarea) => (
            <TableRow key={tarea.id} className="border-b-2 border-black">
              <TableCell className="font-bold">
                <div className="flex items-center gap-2">
                  <CheckSquare size={16} />
                  {tarea.titulo}
                </div>
              </TableCell>
              <TableCell className="font-bold">
                {tarea.proyectos?.nombre || 'Sin proyecto'}
              </TableCell>
              <TableCell>
                <Select 
                  value={tarea.prioridad} 
                  onValueChange={(value: 'baja' | 'media' | 'alta' | 'urgente') => 
                    updateTareaField(tarea.id, 'prioridad', value)}
                >
                  <SelectTrigger className={`${getPrioridadColor(tarea.prioridad)} text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] w-32 h-8`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">BAJA</SelectItem>
                    <SelectItem value="media">MEDIA</SelectItem>
                    <SelectItem value="alta">ALTA</SelectItem>
                    <SelectItem value="urgente">URGENTE</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select 
                  value={tarea.estado} 
                  onValueChange={(value: 'pendiente' | 'en_progreso' | 'completada') => 
                    updateTareaField(tarea.id, 'estado', value)}
                >
                  <SelectTrigger className={`${getEstadoColor(tarea.estado)} text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] w-36 h-8`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">PENDIENTE</SelectItem>
                    <SelectItem value="en_progreso">EN PROGRESO</SelectItem>
                    <SelectItem value="completada">COMPLETADA</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="font-bold">
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  {formatTime(tarea.tiempo_total || 0)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStartTimer(tarea.id)}
                    disabled={activeSession?.tarea_id === tarea.id}
                    className="bg-green-400 hover:bg-green-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] p-2 disabled:bg-gray-300"
                  >
                    <Play size={16} />
                  </Button>
                  <Button
                    onClick={() => onSelectTarea(tarea)}
                    className="bg-purple-400 hover:bg-purple-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] p-2"
                  >
                    <MessageSquare size={16} />
                  </Button>
                  <Button
                    onClick={() => onEdit(tarea)}
                    className="bg-blue-400 hover:bg-blue-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] p-2"
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    onClick={() => handleDelete(tarea.id)}
                    className="bg-red-400 hover:bg-red-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] p-2"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default TareasTable;
