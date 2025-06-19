import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, MessageSquare, Bug, Lightbulb, Sparkles, FileText } from 'lucide-react';

interface Sugerencia {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: 'bug' | 'mejora' | 'nueva_funcionalidad' | 'general';
  estado: 'pendiente' | 'en_revision' | 'implementada' | 'rechazada';
  created_at: string;
}

const Sugerencias = () => {
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: 'general' as const
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchSugerencias();
  }, []);

  const fetchSugerencias = async () => {
    try {
      const { data, error } = await supabase
        .from('sugerencias')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSugerencias(data || []);
    } catch (error) {
      console.error('Error fetching sugerencias:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las sugerencias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo.trim() || !formData.descripcion.trim()) {
      toast({
        title: "Error",
        description: "Título y descripción son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('sugerencias')
        .insert([{ 
          ...formData, 
          user_id: user?.id 
        }]);

      if (error) throw error;
      
      toast({ 
        title: "¡Sugerencia enviada!", 
        description: "Gracias por ayudarnos a mejorar el sistema" 
      });
      
      setFormData({ titulo: '', descripcion: '', categoria: 'general' });
      setShowForm(false);
      fetchSugerencias();
    } catch (error) {
      console.error('Error saving sugerencia:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la sugerencia",
        variant: "destructive",
      });
    }
  };

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case 'bug': return <Bug className="text-red-500" size={20} />;
      case 'mejora': return <Lightbulb className="text-yellow-500" size={20} />;
      case 'nueva_funcionalidad': return <Sparkles className="text-blue-500" size={20} />;
      default: return <FileText className="text-gray-500" size={20} />;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-400';
      case 'en_revision': return 'bg-blue-400';
      case 'implementada': return 'bg-green-400';
      case 'rechazada': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-white text-xl font-black">CARGANDO SUGERENCIAS...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">SUGERENCIAS</h1>
          <p className="text-gray-400 font-bold">Ayúdanos a mejorar el sistema</p>
        </div>
        
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-400 hover:bg-yellow-300 text-black font-black border-4 border-white shadow-[4px_4px_0px_0px_#ffffff]"
        >
          <Plus size={20} className="mr-2" />
          NUEVA SUGERENCIA
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#ffff00] p-6">
          <h2 className="text-2xl font-black text-black mb-4">ENVIAR SUGERENCIA</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-black font-bold mb-2">Categoría</label>
              <Select value={formData.categoria} onValueChange={(value: any) => setFormData({ ...formData, categoria: value })}>
                <SelectTrigger className="border-4 border-black font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="bug">Reporte de Bug</SelectItem>
                  <SelectItem value="mejora">Mejora</SelectItem>
                  <SelectItem value="nueva_funcionalidad">Nueva Funcionalidad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-black font-bold mb-2">Título *</label>
              <Input
                placeholder="Título de la sugerencia"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="border-4 border-black font-bold"
                required
              />
            </div>
            
            <div>
              <label className="block text-black font-bold mb-2">Descripción *</label>
              <Textarea
                placeholder="Describe tu sugerencia en detalle..."
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="border-4 border-black font-bold min-h-[120px]"
                required
              />
            </div>
            
            <div className="flex gap-4">
              <Button
                type="submit"
                className="bg-green-400 hover:bg-green-300 text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_#000000] flex-1"
              >
                ENVIAR SUGERENCIA
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-400 hover:bg-gray-300 text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_#000000]"
              >
                CANCELAR
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-black text-white">MIS SUGERENCIAS</h2>
        
        {sugerencias.length === 0 ? (
          <Card className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#ff00ff] p-8 text-center">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-black text-black mb-2">NO HAY SUGERENCIAS</h3>
            <p className="text-gray-600">¡Sé el primero en enviarnos una sugerencia para mejorar el sistema!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sugerencias.map((sugerencia) => (
              <Card
                key={sugerencia.id}
                className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#ff00ff] p-4 hover:shadow-[8px_8px_0px_0px_#ff00ff] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoriaIcon(sugerencia.categoria)}
                      <span className="text-xs font-bold text-gray-600 uppercase">
                        {sugerencia.categoria.replace('_', ' ')}
                      </span>
                    </div>
                    <span className={`${getEstadoColor(sugerencia.estado)} text-black px-2 py-1 text-xs font-black border border-black`}>
                      {sugerencia.estado.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-black text-black">{sugerencia.titulo}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">{sugerencia.descripcion}</p>
                  
                  <div className="text-xs text-gray-500">
                    {new Date(sugerencia.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sugerencias;
