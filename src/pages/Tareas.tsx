import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTimer } from '@/hooks/useTimer';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, CheckSquare, Play, Pause, Clock, MessageSquare } from 'lucide-react';
import TareaDetalle from '@/components/TareaDetalle';

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
  proyectos?: { nombre: string };
}

const Tareas = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTarea, setEditingTarea] = useState<Tarea | null>(null);
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { startTimer, activeSession } = useTimer();

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
    fetchTareas();
    fetchProyectos();
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
      
      // Type assertion para convertir los datos de la DB
      const tareasData = (data || []).map(item => ({
        ...item,
        estado: item.estado as 'pendiente' | 'en_progreso' | 'completada',
        prioridad: item.prioridad as 'baja' | 'media' | 'alta' | 'urgente'
      }));
      
      setTareas(tareasData);
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

  const updateTareaField = async (tareaId: string, field: 'estado' | 'prioridad', value: string) => {
    try {
      const { error } = await supabase
        .from('tareas')
        .update({ [field]: value })
        .eq('id', tareaId);

      if (error) throw error;

      // Actualizar el estado local
      setTareas(prev => prev.map(tarea => 
        tarea.id === tareaId 
          ? { ...tarea, [field]: value }
          : tarea
      ));

      toast({
        title: "Actualizado",
        description: `${field === 'estado' ? 'Estado' : 'Prioridad'} actualizada correctamente.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo actualizar la ${field === 'estado' ? 'estado' : 'prioridad'}.`,
        variant: "destructive",
      });
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

      resetForm();
      setIsDialogOpen(false);
      fetchTareas();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la tarea.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (tarea: Tarea) => {
    setEditingTarea(tarea);
    setFormData({
      titulo: tarea.titulo,
      descripcion: tarea.descripcion || '',
      estado: tarea.estado,
      prioridad: tarea.prioridad,
      fecha_vencimiento: tarea.fecha_vencimiento || '',
      tiempo_estimado: tarea.tiempo_estimado?.toString() || '',
      proyecto_id: tarea.proyecto_id || ''
    });
    setIsDialogOpen(true);
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
      
      fetchTareas();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea.",
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
    setEditingTarea(null);
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

  const formatTime = (minutes: number) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleStartTimer = async (tareaId: string) => {
    await startTimer(tareaId);
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
              onClick={resetForm}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_#000000]"
            >
              <Plus className="mr-2" size={20} />
              NUEVA TAREA
            </Button>
          </DialogTrigger>
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
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-red-400 hover:bg-red-300 text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                >
                  CANCELAR
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-yellow-400 border-b-4 border-black">
              <TableHead className="font-black text-black">TAREA</TableHead>
              <TableHead className="font-black text-black">PROYECTO</TableHead>
              <TableHead className="font-black text-black">PRIORIDAD</TableHead>
              <TableHead className="font-black text-black">ESTADO</TableHead>
              <TableHead className="font-black text-black">TIEMPO</TableHead>
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
                    {formatTime(tarea.tiempo_registrado || 0)}
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
                      onClick={() => setSelectedTarea(tarea)}
                      className="bg-purple-400 hover:bg-purple-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] p-2"
                    >
                      <MessageSquare size={16} />
                    </Button>
                    <Button
                      onClick={() => handleEdit(tarea)}
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

      {tareas.length === 0 && (
        <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-8 text-center">
          <CheckSquare size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-2xl font-black text-black mb-2">NO HAY TAREAS</h3>
          <p className="text-gray-600 font-bold">Crea tu primera tarea</p>
        </Card>
      )}

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
