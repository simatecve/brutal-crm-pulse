
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ReportData {
  proyecto: string;
  cliente: string;
  tiempo_total: number;
  sesiones: number;
  fecha: string;
}

interface ReportTableProps {
  data: ReportData[];
  tipo: string;
}

const ReportTable = ({ data, tipo }: ReportTableProps) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const totalTiempo = data.reduce((sum, item) => sum + item.tiempo_total, 0);
  const totalSesiones = data.reduce((sum, item) => sum + item.sesiones, 0);

  return (
    <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-6">
      <h3 className="text-lg font-black text-black mb-4">DETALLE DE TIEMPO</h3>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-black">
              <TableHead className="font-black text-black">
                {tipo === 'proyecto' ? 'PROYECTO' : 'CLIENTE'}
              </TableHead>
              <TableHead className="font-black text-black">TIEMPO TOTAL</TableHead>
              <TableHead className="font-black text-black">SESIONES</TableHead>
              <TableHead className="font-black text-black">PROMEDIO/SESIÓN</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index} className="border-b border-gray-200">
                <TableCell className="font-bold">
                  {tipo === 'proyecto' ? item.proyecto : item.cliente}
                </TableCell>
                <TableCell className="font-bold">
                  {formatTime(item.tiempo_total)}
                </TableCell>
                <TableCell className="font-bold">
                  {item.sesiones}
                </TableCell>
                <TableCell className="font-bold">
                  {formatTime(Math.floor(item.tiempo_total / item.sesiones))}
                </TableCell>
              </TableRow>
            ))}
            {data.length > 1 && (
              <TableRow className="border-t-2 border-black bg-yellow-100">
                <TableCell className="font-black">TOTAL</TableCell>
                <TableCell className="font-black">{formatTime(totalTiempo)}</TableCell>
                <TableCell className="font-black">{totalSesiones}</TableCell>
                <TableCell className="font-black">
                  {formatTime(Math.floor(totalTiempo / totalSesiones))}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default ReportTable;
