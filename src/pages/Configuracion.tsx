
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Clock, Bell, Palette, Target, Keyboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import PomodoroConfig from '@/components/configuracion/PomodoroConfig';
import ObjetivosConfig from '@/components/configuracion/ObjetivosConfig';
import NotificacionesConfig from '@/components/configuracion/NotificacionesConfig';
import AtajosConfig from '@/components/configuracion/AtajosConfig';

const Configuracion = () => {
  const [configuracion, setConfiguracion] = useState({
    modoOscuro: false,
    atajosHabilitados: true,
    pomodoroTiempo: 25,
    pomodoroDescanso: 5,
    pomodoroDescansoLargo: 15,
    recordatoriosHabilitados: true,
    recordatorioInterval: 25,
    objetivoDiario: 8,
    objetivoSemanal: 40,
    categoriasPersonalizadas: ['Productivo', 'Reuniones', 'Administración'],
    estadosPersonalizados: ['pendiente', 'en_progreso', 'completada'],
    prioridadesPersonalizadas: ['baja', 'media', 'alta', 'urgente']
  });
  
  const { toast } = useToast();

  const guardarConfiguracion = () => {
    localStorage.setItem('configuracion_app', JSON.stringify(configuracion));
    
    toast({
      title: "Configuración guardada",
      description: "Tus preferencias han sido actualizadas correctamente.",
    });
  };

  // Activar atajos de teclado
  useKeyboardShortcuts({
    enabled: configuracion.atajosHabilitados,
    onSave: guardarConfiguracion
  });

  useEffect(() => {
    const configGuardada = localStorage.getItem('configuracion_app');
    if (configGuardada) {
      setConfiguracion(JSON.parse(configGuardada));
    }
  }, []);

  const toggleModoOscuro = () => {
    const nuevoModo = !configuracion.modoOscuro;
    setConfiguracion(prev => ({ ...prev, modoOscuro: nuevoModo }));
    document.documentElement.classList.toggle('dark', nuevoModo);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">CONFIGURACIÓN</h1>
          <p className="text-gray-400 font-bold">Personaliza tu experiencia de trabajo</p>
        </div>
        
        <Button
          onClick={guardarConfiguracion}
          className="bg-green-400 hover:bg-green-300 text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_#000000]"
        >
          <Settings className="mr-2" size={20} />
          GUARDAR
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000000] p-1">
          <TabsTrigger value="general" className="font-black data-[state=active]:bg-yellow-400">
            <Settings className="mr-2" size={16} />
            GENERAL
          </TabsTrigger>
          <TabsTrigger value="atajos" className="font-black data-[state=active]:bg-yellow-400">
            <Keyboard className="mr-2" size={16} />
            ATAJOS
          </TabsTrigger>
          <TabsTrigger value="tiempo" className="font-black data-[state=active]:bg-yellow-400">
            <Clock className="mr-2" size={16} />
            TIEMPO
          </TabsTrigger>
          <TabsTrigger value="objetivos" className="font-black data-[state=active]:bg-yellow-400">
            <Target className="mr-2" size={16} />
            OBJETIVOS
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="font-black data-[state=active]:bg-yellow-400">
            <Bell className="mr-2" size={16} />
            NOTIFICACIONES
          </TabsTrigger>
          <TabsTrigger value="interfaz" className="font-black data-[state=active]:bg-yellow-400">
            <Palette className="mr-2" size={16} />
            INTERFAZ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-6">
            <h3 className="text-xl font-black text-black mb-6">CONFIGURACIÓN GENERAL</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-lg font-bold text-black">Atajos de teclado</Label>
                  <p className="text-sm text-gray-600">Habilitar atajos de teclado para navegación rápida</p>
                </div>
                <Switch
                  checked={configuracion.atajosHabilitados}
                  onCheckedChange={(checked) => 
                    setConfiguracion(prev => ({ ...prev, atajosHabilitados: checked }))
                  }
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-black">ESTADOS PERSONALIZADOS</h4>
                <div className="grid grid-cols-2 gap-4">
                  {configuracion.estadosPersonalizados.map((estado, index) => (
                    <Input
                      key={index}
                      value={estado}
                      onChange={(e) => {
                        const nuevosEstados = [...configuracion.estadosPersonalizados];
                        nuevosEstados[index] = e.target.value;
                        setConfiguracion(prev => ({ ...prev, estadosPersonalizados: nuevosEstados }));
                      }}
                      className="border-2 border-black font-bold"
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-black">PRIORIDADES PERSONALIZADAS</h4>
                <div className="grid grid-cols-2 gap-4">
                  {configuracion.prioridadesPersonalizadas.map((prioridad, index) => (
                    <Input
                      key={index}
                      value={prioridad}
                      onChange={(e) => {
                        const nuevasPrioridades = [...configuracion.prioridadesPersonalizadas];
                        nuevasPrioridades[index] = e.target.value;
                        setConfiguracion(prev => ({ ...prev, prioridadesPersonalizadas: nuevasPrioridades }));
                      }}
                      className="border-2 border-black font-bold"
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="atajos">
          <AtajosConfig
            configuracion={configuracion}
          />
        </TabsContent>

        <TabsContent value="tiempo">
          <PomodoroConfig
            configuracion={configuracion}
            setConfiguracion={setConfiguracion}
          />
        </TabsContent>

        <TabsContent value="objetivos">
          <ObjetivosConfig
            configuracion={configuracion}
            setConfiguracion={setConfiguracion}
          />
        </TabsContent>

        <TabsContent value="notificaciones">
          <NotificacionesConfig
            configuracion={configuracion}
            setConfiguracion={setConfiguracion}
          />
        </TabsContent>

        <TabsContent value="interfaz">
          <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-6">
            <h3 className="text-xl font-black text-black mb-6">CONFIGURACIÓN DE INTERFAZ</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-lg font-bold text-black">Modo Oscuro</Label>
                  <p className="text-sm text-gray-600">Cambiar entre tema claro y oscuro</p>
                </div>
                <Switch
                  checked={configuracion.modoOscuro}
                  onCheckedChange={toggleModoOscuro}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracion;
