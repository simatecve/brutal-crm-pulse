
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Clock, User, Timer } from 'lucide-react';

interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  fecha_vencimiento: string;
  tiempo_estimado: number;
  tiempo_registrado: number;
}

interface Comentario {
  id: string;
  comentario: string;
  created_at: string;
  user_id: string;
}

interface SesionTiempo {
  id: string;
  tiempo_transcurrido: number;
  estado: string;
  inicio: string;
  fin: string | null;
}

interface TareaDetalleProps {
  tarea: Tarea;
  onClose: () => void;
  onUpdate: () => void;
}

const TareaDetalle = ({ tarea, onClose, onUpdate }: TareaDetalleProps) => {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [sesiones, setSesiones] = useState<SesionTiempo[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchComentarios();
    fetchSesiones();
  }, [tarea.id]);

  const fetchComentarios = async () => {
    try {
      const { data, error } = await supabase
        .from('comentarios_tareas')
        .select('*')
        .eq('tarea_id', tarea.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComentarios(data || []);
    } catch (error) {
      console.error('Error fetching comentarios:', error);
    }
  };

  const fetchSesiones = async () => {
    try {
      const { data, error } = await supabase
        .from('sesiones_tiempo')
        .select('*')
        .eq('tarea_id', tarea.id)
        .order('inicio', { ascending: false });

      if (error) throw error;
      setSesiones(data || []);
    } catch (error) {
      console.error('Error fetching sesiones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    try {
      const { error } = await supabase
        .from('comentarios_tareas')
        .insert({
          tarea_id: tarea.id,
          user_id: user?.id,
          comentario: nuevoComentario.trim()
        });

      if (error) throw error;

      setNuevoComentario('');
      fetchComentarios();
      
      toast({
        title: "Comentario agregado",
        description: "El comentario se agregó correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el comentario.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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

  const getTiempoTotal = () => {
    return sesiones.reduce((total, sesion) => total + (sesion.tiempo_transcurrido || 0), 0);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activa': return 'bg-green-400';
      case 'pausada': return 'bg-yellow-400';
      case 'finalizada': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-black flex items-center gap-2">
            <MessageSquare size={24} />
            DETALLES DE TAREA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la tarea */}
          <Card className="bg-yellow-400 border-2 border-black p-4">
            <h3 className="text-xl font-black text-black mb-2">{tarea.titulo}</h3>
            {tarea.descripcion && (
              <p className="text-black font-bold mb-2">{tarea.descripcion}</p>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm font-bold text-black">
              <div>Estado: {tarea.estado.replace('_', ' ').toUpperCase()}</div>
              <div>Prioridad: {tarea.prioridad.toUpperCase()}</div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                Tiempo total: {formatTime(getTiempoTotal())}
              </div>
              <div>
                Tiempo estimado: {tarea.tiempo_estimado || 0} min
              </div>
              {tarea.fecha_vencimiento && (
                <div className="col-span-2">
                  Vencimiento: {new Date(tarea.fecha_vencimiento).toLocaleDateString()}
                </div>
              )}
            </div>
          </Card>

          {/* Resumen de tiempo */}
          <div>
            <h4 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Timer size={20} />
              RESUMEN DE TIEMPO ({sesiones.length} sesiones)
            </h4>

            <div className="space-y-3 max-h-40 overflow-y-auto mb-4">
              {loading ? (
                <div className="text-center text-gray-400 font-bold">Cargando sesiones...</div>
              ) : sesiones.length === 0 ? (
                <Card className="bg-gray-100 border-2 border-black p-4 text-center">
                  <p className="text-black font-bold">No hay sesiones de tiempo registradas</p>
                </Card>
              ) : (
                sesiones.map((sesion) => (
                  <Card key={sesion.id} className="bg-white border-2 border-black p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-black font-bold">
                          Duración: {formatTime(sesion.tiempo_transcurrido || 0)}
                        </p>
                        <p className="text-gray-600 text-xs font-bold">
                          Inicio: {formatDate(sesion.inicio)}
                          {sesion.fin && ` - Fin: ${formatDate(sesion.fin)}`}
                        </p>
                      </div>
                      <span className={`${getEstadoColor(sesion.estado)} text-black px-3 py-1 font-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-xs`}>
                        {sesion.estado.toUpperCase()}
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Comentarios */}
          <div>
            <h4 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <MessageSquare size={20} />
              COMENTARIOS ({comentarios.length})
            </h4>

            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
              {comentarios.length === 0 ? (
                <Card className="bg-gray-100 border-2 border-black p-4 text-center">
                  <p className="text-black font-bold">No hay comentarios aún</p>
                </Card>
              ) : (
                comentarios.map((comentario) => (
                  <Card key={comentario.id} className="bg-white border-2 border-black p-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-400 border-2 border-black p-2 rounded">
                        <User size={16} className="text-black" />
                      </div>
                      <div className="flex-1">
                        <p className="text-black font-bold mb-1">{comentario.comentario}</p>
                        <p className="text-gray-600 text-xs font-bold">
                          {formatDate(comentario.created_at)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Formulario para nuevo comentario */}
            <form onSubmit={handleSubmitComentario} className="space-y-3">
              <Textarea
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                placeholder="Escribe un comentario..."
                className="border-2 border-black resize-none"
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={!nuevoComentario.trim()}
                  className="bg-green-400 hover:bg-green-300 text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] disabled:bg-gray-300"
                >
                  <Send size={16} className="mr-2" />
                  ENVIAR
                </Button>
                <Button
                  type="button"
                  onClick={onClose}
                  className="bg-red-400 hover:bg-red-300 text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                >
                  CERRAR
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TareaDetalle;
