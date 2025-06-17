
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Proyecto {
  id: string;
  nombre: string;
}

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
}

interface TareaFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingTarea: Tarea | null;
  onSuccess: () => void;
}

const TareaForm = ({ isOpen, onClose, editingTarea, onSuccess }: TareaFormProps) => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    estado: 'pendiente' as 'pendiente' | 'en_progreso' | 'completada',
    prioridad: 'media' as 'baja' | 'media' | 'alta' | 'urgente',
    fecha_vencimiento: '',
    tiempo_estimado: '',
    proyecto_id: ''
  });

  useEffect(() => {
    fetchProyectos();
  }, []);

  useEffect(() => {
    if (editingTarea) {
      setFormData({
        titulo: editingTarea.titulo,
        descripcion: editingTarea.descripcion || '',
        estado: editingTarea.estado,
        prioridad: editingTarea.prioridad,
        fecha_vencimiento: editingTarea.fecha_vencimiento || '',
        tiempo_estimado: editingTarea.tiempo_estimado?.toString() || '',
        proyecto_id: editingTarea.proyecto_id || ''
      });
    } else {
      resetForm();
    }
  }, [editingTarea, isOpen]);

  const fetchProyectos = async () => {
    try {
      const { data, error } = await supabase
        .from('proyectos')
        .select('id, nombre')
        .eq('user_id', user?.id)
        .neq('estado', 'cancelado');

      if (error) throw error;
      setProyectos(data || []);
    } catch (error) {
      console.error('Error fetching proyectos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const tareaData = {
        ...formData,
        tiempo_estimado: parseInt(formData.tiempo_estimado) || null,
        fecha_vencimiento: formData.fecha_vencimiento || null,
        user_id: user?.id
      };

      if (editingTarea) {
        const { error } = await supabase
          .from('tareas')
          .update(tareaData)
          .eq('id', editingTarea.id);

        if (error) throw error;
        toast({
          title: "Tarea actualizada",
          description: "La tarea se actualizó correctamente.",
        });
      } else {
        const { error } = await supabase
          .from('tareas')
          .insert(tareaData);

        if (error) throw error;
        toast({
          title: "Tarea creada",
          description: "La nueva tarea se creó correctamente.",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la tarea.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      estado: 'pendiente',
      prioridad: 'media',
      fecha_vencimiento: '',
      tiempo_estimado: '',
      proyecto_id: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-black">
            {editingTarea ? 'EDITAR TAREA' : 'NUEVA TAREA'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo" className="text-black font-bold">Título</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="border-2 border-black"
              required
            />
          </div>

          <div>
            <Label htmlFor="proyecto_id" className="text-black font-bold">Proyecto</Label>
            <Select
              value={formData.proyecto_id}
              onValueChange={(value) => setFormData({ ...formData, proyecto_id: value })}
            >
              <SelectTrigger className="border-2 border-black">
                <SelectValue placeholder="Selecciona un proyecto" />
              </SelectTrigger>
              <SelectContent>
                {proyectos.map((proyecto) => (
                  <SelectItem key={proyecto.id} value={proyecto.id}>
                    {proyecto.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="descripcion" className="text-black font-bold">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="border-2 border-black"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estado" className="text-black font-bold">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value: 'pendiente' | 'en_progreso' | 'completada') => 
                  setFormData({ ...formData, estado: value })}
              >
                <SelectTrigger className="border-2 border-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_progreso">En Progreso</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="prioridad" className="text-black font-bold">Prioridad</Label>
              <Select
                value={formData.prioridad}
                onValueChange={(value: 'baja' | 'media' | 'alta' | 'urgente') => 
                  setFormData({ ...formData, prioridad: value })}
              >
                <SelectTrigger className="border-2 border-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fecha_vencimiento" className="text-black font-bold">Fecha de Vencimiento</Label>
              <Input
                id="fecha_vencimiento"
                type="date"
                value={formData.fecha_vencimiento}
                onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                className="border-2 border-black"
              />
            </div>

            <div>
              <Label htmlFor="tiempo_estimado" className="text-black font-bold">Tiempo Estimado (minutos)</Label>
              <Input
                id="tiempo_estimado"
                type="number"
                value={formData.tiempo_estimado}
                onChange={(e) => setFormData({ ...formData, tiempo_estimado: e.target.value })}
                className="border-2 border-black"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="bg-green-400 hover:bg-green-300 text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
            >
              {editingTarea ? 'ACTUALIZAR' : 'CREAR'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="bg-red-400 hover:bg-red-300 text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
            >
              CANCELAR
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TareaForm;
