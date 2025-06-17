
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
import { Plus, Edit2, Trash2, FileText, DollarSign } from 'lucide-react';

interface Cliente {
  id: string;
  nombre: string;
  empresa: string;
}

interface Propuesta {
  id: string;
  titulo: string;
  descripcion: string;
  monto: number;
  estado: 'borrador' | 'enviada' | 'aceptada' | 'rechazada';
  fecha_envio: string;
  fecha_vencimiento: string;
  cliente_id: string;
  clientes?: { nombre: string; empresa: string };
}

const Propuestas = () => {
  const [propuestas, setPropuestas] = useState<Propuesta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPropuesta, setEditingPropuesta] = useState<Propuesta | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    monto: '',
    estado: 'borrador' as 'borrador' | 'enviada' | 'aceptada' | 'rechazada',
    fecha_envio: '',
    fecha_vencimiento: '',
    cliente_id: ''
  });

  useEffect(() => {
    fetchPropuestas();
    fetchClientes();
  }, []);

  const fetchPropuestas = async () => {
    try {
      const { data, error } = await supabase
        .from('propuestas')
        .select(`
          *,
          clientes (nombre, empresa)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion para convertir los datos de la DB
      const propuestasData = (data || []).map(item => ({
        ...item,
        estado: item.estado as 'borrador' | 'enviada' | 'aceptada' | 'rechazada'
      }));
      
      setPropuestas(propuestasData);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las propuestas.",
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
        .select('id, nombre, empresa')
        .eq('user_id', user?.id)
        .eq('estado', 'activo');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Error fetching clientes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const propuestaData = {
        ...formData,
        monto: parseFloat(formData.monto) || 0,
        user_id: user?.id,
        fecha_envio: formData.fecha_envio || null,
        fecha_vencimiento: formData.fecha_vencimiento || null
      };

      if (editingPropuesta) {
        const { error } = await supabase
          .from('propuestas')
          .update(propuestaData)
          .eq('id', editingPropuesta.id);

        if (error) throw error;
        toast({
          title: "Propuesta actualizada",
          description: "La propuesta se actualizó correctamente.",
        });
      } else {
        const { error } = await supabase
          .from('propuestas')
          .insert(propuestaData);

        if (error) throw error;
        toast({
          title: "Propuesta creada",
          description: "La nueva propuesta se creó correctamente.",
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchPropuestas();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la propuesta.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (propuesta: Propuesta) => {
    setEditingPropuesta(propuesta);
    setFormData({
      titulo: propuesta.titulo,
      descripcion: propuesta.descripcion || '',
      monto: propuesta.monto?.toString() || '',
      estado: propuesta.estado,
      fecha_envio: propuesta.fecha_envio || '',
      fecha_vencimiento: propuesta.fecha_vencimiento || '',
      cliente_id: propuesta.cliente_id || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta propuesta?')) return;

    try {
      const { error } = await supabase
        .from('propuestas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Propuesta eliminada",
        description: "La propuesta se eliminó correctamente.",
      });
      
      fetchPropuestas();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la propuesta.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      monto: '',
      estado: 'borrador',
      fecha_envio: '',
      fecha_vencimiento: '',
      cliente_id: ''
    });
    setEditingPropuesta(null);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'borrador': return 'bg-gray-400';
      case 'enviada': return 'bg-blue-400';
      case 'aceptada': return 'bg-green-400';
      case 'rechazada': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-white text-xl font-black">CARGANDO PROPUESTAS...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">PROPUESTAS</h1>
          <p className="text-gray-400 font-bold">Gestiona tus propuestas comerciales</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_#000000]"
            >
              <Plus className="mr-2" size={20} />
              NUEVA PROPUESTA
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-black">
                {editingPropuesta ? 'EDITAR PROPUESTA' : 'NUEVA PROPUESTA'}
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
                <Label htmlFor="cliente_id" className="text-black font-bold">Cliente</Label>
                <Select
                  value={formData.cliente_id}
                  onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
                >
                  <SelectTrigger className="border-2 border-black">
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nombre} - {cliente.empresa}
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
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monto" className="text-black font-bold">Monto</Label>
                  <Input
                    id="monto"
                    type="number"
                    step="0.01"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    className="border-2 border-black"
                  />
                </div>

                <div>
                  <Label htmlFor="estado" className="text-black font-bold">Estado</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value: 'borrador' | 'enviada' | 'aceptada' | 'rechazada') => 
                      setFormData({ ...formData, estado: value })}
                  >
                    <SelectTrigger className="border-2 border-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="borrador">Borrador</SelectItem>
                      <SelectItem value="enviada">Enviada</SelectItem>
                      <SelectItem value="aceptada">Aceptada</SelectItem>
                      <SelectItem value="rechazada">Rechazada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fecha_envio" className="text-black font-bold">Fecha de Envío</Label>
                  <Input
                    id="fecha_envio"
                    type="date"
                    value={formData.fecha_envio}
                    onChange={(e) => setFormData({ ...formData, fecha_envio: e.target.value })}
                    className="border-2 border-black"
                  />
                </div>

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
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="bg-green-400 hover:bg-green-300 text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                >
                  {editingPropuesta ? 'ACTUALIZAR' : 'CREAR'}
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
              <TableHead className="font-black text-black">TÍTULO</TableHead>
              <TableHead className="font-black text-black">CLIENTE</TableHead>
              <TableHead className="font-black text-black">MONTO</TableHead>
              <TableHead className="font-black text-black">ESTADO</TableHead>
              <TableHead className="font-black text-black">FECHA ENVÍO</TableHead>
              <TableHead className="font-black text-black">ACCIONES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {propuestas.map((propuesta) => (
              <TableRow key={propuesta.id} className="border-b-2 border-black">
                <TableCell className="font-bold">
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    {propuesta.titulo}
                  </div>
                </TableCell>
                <TableCell className="font-bold">
                  {propuesta.clientes?.nombre} - {propuesta.clientes?.empresa}
                </TableCell>
                <TableCell className="font-bold">
                  <div className="flex items-center gap-1">
                    <DollarSign size={16} />
                    {propuesta.monto?.toLocaleString() || '0'}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`${getEstadoColor(propuesta.estado)} text-black px-3 py-1 font-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-xs`}>
                    {propuesta.estado.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell className="font-bold">
                  {propuesta.fecha_envio ? new Date(propuesta.fecha_envio).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(propuesta)}
                      className="bg-blue-400 hover:bg-blue-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] p-2"
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      onClick={() => handleDelete(propuesta.id)}
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

      {propuestas.length === 0 && (
        <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-8 text-center">
          <FileText size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-2xl font-black text-black mb-2">NO HAY PROPUESTAS</h3>
          <p className="text-gray-600 font-bold">Crea tu primera propuesta comercial</p>
        </Card>
      )}
    </div>
  );
};

export default Propuestas;
