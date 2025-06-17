
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target } from 'lucide-react';

interface ObjetivosConfigProps {
  configuracion: any;
  setConfiguracion: (config: any) => void;
}

const ObjetivosConfig = ({ configuracion, setConfiguracion }: ObjetivosConfigProps) => {
  return (
    <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-6">
      <div className="flex items-center gap-4 mb-6">
        <Target className="text-black" size={32} />
        <h3 className="text-xl font-black text-black">OBJETIVOS DE TIEMPO</h3>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-lg font-bold text-black">OBJETIVO DIARIO (horas)</Label>
            <Input
              type="number"
              value={configuracion.objetivoDiario}
              onChange={(e) => 
                setConfiguracion(prev => ({ ...prev, objetivoDiario: parseInt(e.target.value) || 8 }))
              }
              className="border-2 border-black font-bold text-xl"
              min="1"
              max="16"
            />
            <p className="text-sm text-gray-600 mt-2">Horas de trabajo objetivo por día</p>
          </div>
          
          <div>
            <Label className="text-lg font-bold text-black">OBJETIVO SEMANAL (horas)</Label>
            <Input
              type="number"
              value={configuracion.objetivoSemanal}
              onChange={(e) => 
                setConfiguracion(prev => ({ ...prev, objetivoSemanal: parseInt(e.target.value) || 40 }))
              }
              className="border-2 border-black font-bold text-xl"
              min="1"
              max="80"
            />
            <p className="text-sm text-gray-600 mt-2">Horas de trabajo objetivo por semana</p>
          </div>
        </div>

        <div className="bg-yellow-100 border-2 border-black p-4 rounded">
          <h4 className="font-black text-black mb-2">📊 PROGRESO ACTUAL</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-bold text-gray-700">Hoy</p>
              <p className="text-2xl font-black text-black">0h / {configuracion.objetivoDiario}h</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700">Esta semana</p>
              <p className="text-2xl font-black text-black">0h / {configuracion.objetivoSemanal}h</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ObjetivosConfig;
