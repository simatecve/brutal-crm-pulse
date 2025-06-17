
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface Proyecto {
  id: string;
  nombre: string;
  descripcion?: string;
  estado: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  presupuesto?: number;
  cliente_id?: string;
  created_at: string;
  clientes?: { nombre: string };
}

interface Cliente {
  id: string;
  nombre: string;
}

const Proyectos = () => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProyecto, setEditingProyecto] = useState<Proyecto | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado: 'planificacion',
    fecha_inicio: '',
    fecha_fin: '',
    presupuesto: '',
    cliente_id: ''
  });

  useEffect(() => {
    fetchProyectos();
    fetchClientes();
  }, []);

  const fetchProyectos = async () => {
    try {
      const { data, error } = await supabase
        .from('proyectos')
        .select(`
          *,
          clientes (nombre)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProyectos(data || []);
    } catch (error) {
      console.error('Error fetching proyectos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los proyectos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nombre')
        .order('nombre');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Error fetching clientes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const projectData = {
        ...formData,
        presupuesto: formData.presupuesto ? parseFloat(formData.presupuesto) : null,
        fecha_inicio: formData.fecha_inicio || null,
        fecha_fin: formData.fecha_fin || null,
        cliente_id: formData.cliente_id || null
      };

      if (editingProyecto) {
        const { error } = await supabase
          .from('proyectos')
          .update(projectData)
          .eq('id', editingProyecto.id);

        if (error) throw error;
        toast({ title: "Proyecto actualizado correctamente" });
      } else {
        const { error } = await supabase
          .from('proyectos')
          .insert([{ ...projectData, user_id: (await supabase.auth.getUser()).data.user?.id }]);

        if (error) throw error;
        toast({ title: "Proyecto creado correctamente" });
      }

      resetForm();
      fetchProyectos();
    } catch (error) {
      console.error('Error saving proyecto:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el proyecto",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (proyecto: Proyecto) => {
    setEditingProyecto(proyecto);
    setFormData({
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion || '',
      estado: proyecto.estado,
      fecha_inicio: proyecto.fecha_inicio || '',
      fecha_fin: proyecto.fecha_fin || '',
      presupuesto: proyecto.presupuesto?.toString() || '',
      cliente_id: proyecto.cliente_id || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este proyecto?')) return;
    
    try {
      const { error } = await supabase
        .from('proyectos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Proyecto eliminado correctamente" });
      fetchProyectos();
    } catch (error) {
      console.error('Error deleting proyecto:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el proyecto",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      estado: 'planificacion',
      fecha_inicio: '',
      fecha_fin: '',
      presupuesto: '',
      cliente_id: ''
    });
    setShowForm(false);
    setEditingProyecto(null);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'planificacion': return 'bg-yellow-400';
      case 'en_progreso': return 'bg-blue-400';
      case 'completado': return 'bg-green-400';
      case 'cancelado': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-white text-xl font-black">CARGANDO PROYECTOS...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-black text-white">PROYECTOS</h1>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-yellow-400 hover:bg-yellow-300 text-black font-black border-4 border-white shadow-[4px_4px_0px_0px_#ffffff]"
        >
          <Plus size={20} className="mr-2" />
          NUEVO PROYECTO
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#00ff00] p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-black">
              {editingProyecto ? 'EDITAR PROYECTO' : 'NUEVO PROYECTO'}
            </h2>
            <Button
              onClick={resetForm}
              className="bg-red-500 hover:bg-red-400 text-white border-2 border-black"
            >
              <X size={20} />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="NOMBRE DEL PROYECTO *"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="border-4 border-black font-bold"
              required
            />
            
            <Select value={formData.cliente_id} onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}>
              <SelectTrigger className="border-4 border-black font-bold">
                <SelectValue placeholder="SELECCIONAR CLIENTE" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
              <SelectTrigger className="border-4 border-black font-bold">
                <SelectValue placeholder="ESTADO" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planificacion">PLANIFICACIÓN</SelectItem>
                <SelectItem value="en_progreso">EN PROGRESO</SelectItem>
                <SelectItem value="completado">COMPLETADO</SelectItem>
                <SelectItem value="cancelado">CANCELADO</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="PRESUPUESTO"
              type="number"
              value={formData.presupuesto}
              onChange={(e) => setFormData({ ...formData, presupuesto: e.target.value })}
              className="border-4 border-black font-bold"
            />

            <Input
              placeholder="FECHA INICIO"
              type="date"
              value={formData.fecha_inicio}
              onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
              className="border-4 border-black font-bold"
            />

            <Input
              placeholder="FECHA FIN"
              type="date"
              value={formData.fecha_fin}
              onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
              className="border-4 border-black font-bold"
            />

            <Textarea
              placeholder="DESCRIPCIÓN"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="border-4 border-black font-bold md:col-span-2"
            />

            <Button
              type="submit"
              className="bg-green-400 hover:bg-green-300 text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_#000000] md:col-span-2"
            >
              {editingProyecto ? 'ACTUALIZAR' : 'CREAR'} PROYECTO
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proyectos.map((proyecto) => (
          <Card
            key={proyecto.id}
            className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#00ff00] p-4 hover:shadow-[8px_8px_0px_0px_#00ff00] transition-all"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-black text-black">{proyecto.nombre}</h3>
                <span className={`px-2 py-1 text-xs font-black text-black border-2 border-black ${getEstadoColor(proyecto.estado)}`}>
                  {proyecto.estado.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              {proyecto.clientes && (
                <p className="text-sm font-bold text-gray-600">Cliente: {proyecto.clientes.nombre}</p>
              )}
              
              {proyecto.descripcion && (
                <p className="text-sm text-gray-600">{proyecto.descripcion}</p>
              )}
              
              {proyecto.presupuesto && (
                <p className="text-sm font-bold text-green-600">${proyecto.presupuesto.toLocaleString()}</p>
              )}
              
              {proyecto.fecha_inicio && (
                <p className="text-xs text-gray-500">Inicio: {new Date(proyecto.fecha_inicio).toLocaleDateString()}</p>
              )}
              
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => handleEdit(proyecto)}
                  className="bg-blue-400 hover:bg-blue-300 text-black font-bold border-2 border-black flex-1"
                >
                  <Edit size={16} />
                </Button>
                <Button
                  onClick={() => handleDelete(proyecto.id)}
                  className="bg-red-400 hover:bg-red-300 text-black font-bold border-2 border-black flex-1"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {proyectos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white text-xl font-bold">NO HAY PROYECTOS REGISTRADOS</p>
          <p className="text-gray-400 mt-2">Crea tu primer proyecto usando el botón de arriba</p>
        </div>
      )}
    </div>
  );
};

export default Proyectos;
