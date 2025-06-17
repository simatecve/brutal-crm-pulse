
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock } from 'lucide-react';

interface SesionTiempo {
  id: string;
  tiempo_transcurrido: number;
  estado: string;
  inicio: string;
  fin: string | null;
  tareas?: { titulo: string };
  proyectos?: { nombre: string };
}

interface SessionsTableProps {
  sesiones: SesionTiempo[];
}

const SessionsTable = ({ sesiones }: SessionsTableProps) => {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activa': return 'bg-green-400';
      case 'pausada': return 'bg-yellow-400';
      case 'finalizada': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  if (sesiones.length === 0) {
    return (
      <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-8 text-center">
        <Clock size={64} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-2xl font-black text-black mb-2">NO HAY REGISTROS</h3>
        <p className="text-gray-600 font-bold">Comienza a trackear tu tiempo o ajusta los filtros</p>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] overflow-hidden">
      <div className="bg-yellow-400 border-b-4 border-black p-4">
        <h3 className="text-xl font-black text-black">HISTORIAL DE SESIONES</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 border-b-2 border-black">
            <TableHead className="font-black text-black">TAREA</TableHead>
            <TableHead className="font-black text-black">PROYECTO</TableHead>
            <TableHead className="font-black text-black">DURACIÓN</TableHead>
            <TableHead className="font-black text-black">ESTADO</TableHead>
            <TableHead className="font-black text-black">FECHA INICIO</TableHead>
            <TableHead className="font-black text-black">FECHA FIN</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sesiones.map((sesion) => (
            <TableRow key={sesion.id} className="border-b-2 border-black">
              <TableCell className="font-bold">
                {sesion.tareas?.titulo || 'Tarea eliminada'}
              </TableCell>
              <TableCell className="font-bold">
                {sesion.proyectos?.nombre || 'Sin proyecto'}
              </TableCell>
              <TableCell className="font-bold">
                {formatDuration(sesion.tiempo_transcurrido || 0)}
              </TableCell>
              <TableCell>
                <span className={`${getEstadoColor(sesion.estado)} text-black px-3 py-1 font-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] text-xs`}>
                  {sesion.estado.toUpperCase()}
                </span>
              </TableCell>
              <TableCell className="font-bold">
                {new Date(sesion.inicio).toLocaleString()}
              </TableCell>
              <TableCell className="font-bold">
                {sesion.fin ? new Date(sesion.fin).toLocaleString() : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default SessionsTable;
