
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface Cliente {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  empresa?: string;
  direccion?: string;
  estado: string;
  created_at: string;
}

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    empresa: '',
    direccion: ''
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Error fetching clientes:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCliente) {
        const { error } = await supabase
          .from('clientes')
          .update(formData)
          .eq('id', editingCliente.id);

        if (error) throw error;
        toast({ title: "Cliente actualizado correctamente" });
      } else {
        const { error } = await supabase
          .from('clientes')
          .insert([{ ...formData, user_id: (await supabase.auth.getUser()).data.user?.id }]);

        if (error) throw error;
        toast({ title: "Cliente creado correctamente" });
      }

      setFormData({ nombre: '', email: '', telefono: '', empresa: '', direccion: '' });
      setShowForm(false);
      setEditingCliente(null);
      fetchClientes();
    } catch (error) {
      console.error('Error saving cliente:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el cliente",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nombre: cliente.nombre,
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      empresa: cliente.empresa || '',
      direccion: cliente.direccion || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente?')) return;
    
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Cliente eliminado correctamente" });
      fetchClientes();
    } catch (error) {
      console.error('Error deleting cliente:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', email: '', telefono: '', empresa: '', direccion: '' });
    setShowForm(false);
    setEditingCliente(null);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-white text-xl font-black">CARGANDO CLIENTES...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-black text-white">CLIENTES</h1>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-yellow-400 hover:bg-yellow-300 text-black font-black border-4 border-white shadow-[4px_4px_0px_0px_#ffffff]"
        >
          <Plus size={20} className="mr-2" />
          NUEVO CLIENTE
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#ffff00] p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-black">
              {editingCliente ? 'EDITAR CLIENTE' : 'NUEVO CLIENTE'}
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
              placeholder="NOMBRE *"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="border-4 border-black font-bold"
              required
            />
            <Input
              placeholder="EMAIL"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border-4 border-black font-bold"
            />
            <Input
              placeholder="TELÉFONO"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="border-4 border-black font-bold"
            />
            <Input
              placeholder="EMPRESA"
              value={formData.empresa}
              onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
              className="border-4 border-black font-bold"
            />
            <Input
              placeholder="DIRECCIÓN"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="border-4 border-black font-bold md:col-span-2"
            />
            <Button
              type="submit"
              className="bg-green-400 hover:bg-green-300 text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_#000000] md:col-span-2"
            >
              {editingCliente ? 'ACTUALIZAR' : 'CREAR'} CLIENTE
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientes.map((cliente) => (
          <Card
            key={cliente.id}
            className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#ff00ff] p-4 hover:shadow-[8px_8px_0px_0px_#ff00ff] transition-all"
          >
            <div className="space-y-2">
              <h3 className="text-xl font-black text-black">{cliente.nombre}</h3>
              {cliente.empresa && (
                <p className="text-sm font-bold text-gray-600">{cliente.empresa}</p>
              )}
              {cliente.email && (
                <p className="text-sm text-gray-600">{cliente.email}</p>
              )}
              {cliente.telefono && (
                <p className="text-sm text-gray-600">{cliente.telefono}</p>
              )}
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => handleEdit(cliente)}
                  className="bg-blue-400 hover:bg-blue-300 text-black font-bold border-2 border-black flex-1"
                >
                  <Edit size={16} />
                </Button>
                <Button
                  onClick={() => handleDelete(cliente.id)}
                  className="bg-red-400 hover:bg-red-300 text-black font-bold border-2 border-black flex-1"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {clientes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white text-xl font-bold">NO HAY CLIENTES REGISTRADOS</p>
          <p className="text-gray-400 mt-2">Crea tu primer cliente usando el botón de arriba</p>
        </div>
      )}
    </div>
  );
};

export default Clientes;
