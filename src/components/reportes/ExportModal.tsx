
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  proyecto: string;
  cliente: string;
  tiempo_total: number;
  sesiones: number;
  fecha: string;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReportData[];
  tipo: string;
}

const ExportModal = ({ isOpen, onClose, data, tipo }: ExportModalProps) => {
  const [formatoExport, setFormatoExport] = useState('pdf');
  const [nombreArchivo, setNombreArchivo] = useState('reporte-tiempo');
  const [incluirGraficos, setIncluirGraficos] = useState(true);
  const { toast } = useToast();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const exportToPDF = () => {
    // Crear contenido HTML para PDF
    const htmlContent = `
      <html>
        <head>
          <title>Reporte de Tiempo</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #000; border-bottom: 3px solid #000; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 2px solid #000; padding: 10px; text-align: left; }
            th { background-color: #fbbf24; font-weight: bold; }
            .total { background-color: #fef3c7; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>REPORTE DE TIEMPO - ${tipo.toUpperCase()}</h1>
          <p><strong>Fecha de generación:</strong> ${new Date().toLocaleDateString()}</p>
          
          <table>
            <thead>
              <tr>
                <th>${tipo === 'proyecto' ? 'PROYECTO' : 'CLIENTE'}</th>
                <th>TIEMPO TOTAL</th>
                <th>SESIONES</th>
                <th>PROMEDIO/SESIÓN</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(item => `
                <tr>
                  <td>${tipo === 'proyecto' ? item.proyecto : item.cliente}</td>
                  <td>${formatTime(item.tiempo_total)}</td>
                  <td>${item.sesiones}</td>
                  <td>${formatTime(Math.floor(item.tiempo_total / item.sesiones))}</td>
                </tr>
              `).join('')}
              <tr class="total">
                <td>TOTAL</td>
                <td>${formatTime(data.reduce((sum, item) => sum + item.tiempo_total, 0))}</td>
                <td>${data.reduce((sum, item) => sum + item.sesiones, 0)}</td>
                <td>${formatTime(Math.floor(data.reduce((sum, item) => sum + item.tiempo_total, 0) / data.reduce((sum, item) => sum + item.sesiones, 0)))}</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Crear y descargar el archivo
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nombreArchivo}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    // Crear contenido CSV para Excel
    const headers = [tipo === 'proyecto' ? 'Proyecto' : 'Cliente', 'Tiempo Total', 'Sesiones', 'Promedio por Sesión'];
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        tipo === 'proyecto' ? item.proyecto : item.cliente,
        formatTime(item.tiempo_total),
        item.sesiones,
        formatTime(Math.floor(item.tiempo_total / item.sesiones))
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nombreArchivo}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (formatoExport === 'pdf') {
      exportToPDF();
    } else {
      exportToExcel();
    }
    
    toast({
      title: "Exportación completada",
      description: `Reporte exportado como ${formatoExport.toUpperCase()}`,
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-black">EXPORTAR REPORTE</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-black mb-2">FORMATO</label>
            <Select value={formatoExport} onValueChange={setFormatoExport}>
              <SelectTrigger className="border-2 border-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    PDF (HTML)
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet size={16} />
                    Excel (CSV)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-black mb-2">NOMBRE DEL ARCHIVO</label>
            <Input
              value={nombreArchivo}
              onChange={(e) => setNombreArchivo(e.target.value)}
              className="border-2 border-black"
              placeholder="nombre-del-archivo"
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button
              onClick={onClose}
              className="flex-1 bg-gray-400 hover:bg-gray-300 text-black font-black border-2 border-black"
            >
              CANCELAR
            </Button>
            <Button
              onClick={handleExport}
              className="flex-1 bg-green-400 hover:bg-green-300 text-black font-black border-2 border-black"
            >
              <Download className="mr-2" size={20} />
              EXPORTAR
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
