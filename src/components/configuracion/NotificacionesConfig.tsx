
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell } from 'lucide-react';

interface NotificacionesConfigProps {
  configuracion: any;
  setConfiguracion: (config: any) => void;
}

const NotificacionesConfig = ({ configuracion, setConfiguracion }: NotificacionesConfigProps) => {
  return (
    <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-6">
      <div className="flex items-center gap-4 mb-6">
        <Bell className="text-black" size={32} />
        <h3 className="text-xl font-black text-black">NOTIFICACIONES Y RECORDATORIOS</h3>
      </div>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-lg font-bold text-black">Recordatorios de descanso</Label>
            <p className="text-sm text-gray-600">Recibir notificaciones para tomar descansos</p>
          </div>
          <Switch
            checked={configuracion.recordatoriosHabilitados}
            onCheckedChange={(checked) => 
              setConfiguracion(prev => ({ ...prev, recordatoriosHabilitados: checked }))
            }
          />
        </div>

        {configuracion.recordatoriosHabilitados && (
          <div>
            <Label className="text-sm font-bold text-black">INTERVALO DE RECORDATORIOS (minutos)</Label>
            <Input
              type="number"
              value={configuracion.recordatorioInterval}
              onChange={(e) => 
                setConfiguracion(prev => ({ ...prev, recordatorioInterval: parseInt(e.target.value) || 25 }))
              }
              className="border-2 border-black font-bold"
              min="5"
              max="120"
            />
            <p className="text-sm text-gray-600 mt-2">
              Cada {configuracion.recordatorioInterval} minutos recibirás un recordatorio
            </p>
          </div>
        )}

        <div className="bg-blue-100 border-2 border-black p-4 rounded">
          <h4 className="font-black text-black mb-2">🔔 TIPOS DE NOTIFICACIONES</h4>
          <ul className="space-y-2 text-sm">
            <li>• Recordatorios de descanso cada {configuracion.recordatorioInterval} minutos</li>
            <li>• Alertas de sesiones muy largas (90+ minutos)</li>
            <li>• Recordatorios para cuidar la vista cada hora</li>
            <li>• Notificaciones de tareas próximas a vencer</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default NotificacionesConfig;
