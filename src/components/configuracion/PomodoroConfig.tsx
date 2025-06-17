
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Clock } from 'lucide-react';

interface PomodoroConfigProps {
  configuracion: any;
  setConfiguracion: (config: any) => void;
}

const PomodoroConfig = ({ configuracion, setConfiguracion }: PomodoroConfigProps) => {
  return (
    <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-6">
      <div className="flex items-center gap-4 mb-6">
        <Clock className="text-black" size={32} />
        <h3 className="text-xl font-black text-black">TÉCNICA POMODORO</h3>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-bold text-black">TIEMPO DE TRABAJO (min)</Label>
            <Input
              type="number"
              value={configuracion.pomodoroTiempo}
              onChange={(e) => 
                setConfiguracion(prev => ({ ...prev, pomodoroTiempo: parseInt(e.target.value) || 25 }))
              }
              className="border-2 border-black font-bold"
              min="1"
              max="60"
            />
          </div>
          
          <div>
            <Label className="text-sm font-bold text-black">DESCANSO CORTO (min)</Label>
            <Input
              type="number"
              value={configuracion.pomodoroDescanso}
              onChange={(e) => 
                setConfiguracion(prev => ({ ...prev, pomodoroDescanso: parseInt(e.target.value) || 5 }))
              }
              className="border-2 border-black font-bold"
              min="1"
              max="30"
            />
          </div>
          
          <div>
            <Label className="text-sm font-bold text-black">DESCANSO LARGO (min)</Label>
            <Input
              type="number"
              value={configuracion.pomodoroDescansoLargo}
              onChange={(e) => 
                setConfiguracion(prev => ({ ...prev, pomodoroDescansoLargo: parseInt(e.target.value) || 15 }))
              }
              className="border-2 border-black font-bold"
              min="1"
              max="60"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-bold text-black">CATEGORÍAS DE TIEMPO</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {configuracion.categoriasPersonalizadas.map((categoria: string, index: number) => (
              <Input
                key={index}
                value={categoria}
                onChange={(e) => {
                  const nuevasCategorias = [...configuracion.categoriasPersonalizadas];
                  nuevasCategorias[index] = e.target.value;
                  setConfiguracion(prev => ({ ...prev, categoriasPersonalizadas: nuevasCategorias }));
                }}
                className="border-2 border-black font-bold"
                placeholder={`Categoría ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PomodoroConfig;
