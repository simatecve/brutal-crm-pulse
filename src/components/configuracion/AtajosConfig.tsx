
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Keyboard, Info } from 'lucide-react';
import { keyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface AtajosConfigProps {
  configuracion: {
    atajosHabilitados: boolean;
  };
}

const AtajosConfig = ({ configuracion }: AtajosConfigProps) => {
  const categorias = ['Navegación', 'Acciones', 'Timer', 'Interfaz'];

  const getShortcutsByCategory = (category: string) => {
    return keyboardShortcuts.filter(shortcut => shortcut.category === category);
  };

  const getBadgeColor = (category: string) => {
    switch (category) {
      case 'Navegación': return 'bg-blue-500 text-white';
      case 'Acciones': return 'bg-green-500 text-white';
      case 'Timer': return 'bg-orange-500 text-white';
      case 'Interfaz': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-6">
      <div className="flex items-center gap-3 mb-6">
        <Keyboard className="text-black" size={24} />
        <h3 className="text-xl font-black text-black">ATAJOS DE TECLADO</h3>
      </div>

      {!configuracion.atajosHabilitados && (
        <div className="mb-6 p-4 bg-yellow-100 border-2 border-yellow-400 rounded">
          <div className="flex items-center gap-2">
            <Info className="text-yellow-600" size={16} />
            <p className="text-yellow-800 font-bold text-sm">
              Los atajos de teclado están deshabilitados. Actívalos en la pestaña General para usar estas funciones.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {categorias.map((categoria) => {
          const shortcuts = getShortcutsByCategory(categoria);
          if (shortcuts.length === 0) return null;

          return (
            <div key={categoria} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={`${getBadgeColor(categoria)} border-2 border-black font-black`}>
                  {categoria.toUpperCase()}
                </Badge>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow className="border-2 border-black">
                    <TableHead className="font-black text-black bg-gray-100 border-r-2 border-black">
                      ATAJO
                    </TableHead>
                    <TableHead className="font-black text-black bg-gray-100">
                      DESCRIPCIÓN
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shortcuts.map((shortcut, index) => (
                    <TableRow 
                      key={index} 
                      className={`border-2 border-black ${
                        configuracion.atajosHabilitados ? '' : 'opacity-50'
                      }`}
                    >
                      <TableCell className="border-r-2 border-black">
                        <Badge variant="outline" className="border-2 border-black font-mono font-bold">
                          {shortcut.key}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-black">
                        {shortcut.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-300 rounded">
        <h4 className="font-black text-blue-800 mb-2">💡 CONSEJOS DE USO</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li className="font-bold">• Los atajos no funcionan cuando escribes en campos de texto</li>
          <li className="font-bold">• Usa Ctrl en Windows/Linux o Cmd en Mac</li>
          <li className="font-bold">• Los atajos muestran notificaciones cuando se activan</li>
          <li className="font-bold">• Puedes combinar atajos para trabajar más rápido</li>
        </ul>
      </div>
    </Card>
  );
};

export default AtajosConfig;
