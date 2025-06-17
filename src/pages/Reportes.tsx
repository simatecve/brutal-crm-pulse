
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, Download, FileText, Filter } from 'lucide-react';
import ReportChart from '@/components/reportes/ReportChart';
import ReportTable from '@/components/reportes/ReportTable';
import ExportModal from '@/components/reportes/ExportModal';

interface ReportData {
  proyecto: string;
  cliente: string;
  tiempo_total: number;
  sesiones: number;
  fecha: string;
}

const Reportes = () => {
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [filtroProyecto, setFiltroProyecto] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoReporte, setTipoReporte] = useState('proyecto');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchReportData();
  }, [filtroProyecto, filtroCliente, fechaInicio, fechaFin, tipoReporte]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('sesiones_tiempo')
        .select(`
          tiempo_transcurrido,
          inicio,
          tareas!inner (
            titulo,
            proyectos (
              nombre,
              clientes (nombre)
            )
          )
        `)
        .eq('user_id', user?.id)
        .eq('estado', 'finalizada');

      if (fechaInicio) {
        query = query.gte('inicio', fechaInicio + 'T00:00:00');
      }
      if (fechaFin) {
        query = query.lte('inicio', fechaFin + 'T23:59:59');
      }

      const { data, error } = await query;
      if (error) throw error;

      // Procesar datos para reportes
      const processedData: ReportData[] = [];
      const groupedData: { [key: string]: { tiempo: number; sesiones: number; fecha: string } } = {};

      data?.forEach(sesion => {
        const proyecto = sesion.tareas?.proyectos?.nombre || 'Sin proyecto';
        const cliente = sesion.tareas?.proyectos?.clientes?.nombre || 'Sin cliente';
        const fecha = new Date(sesion.inicio).toLocaleDateString();
        
        const key = tipoReporte === 'proyecto' ? proyecto : cliente;
        
        if (!groupedData[key]) {
          groupedData[key] = { tiempo: 0, sesiones: 0, fecha };
        }
        
        groupedData[key].tiempo += sesion.tiempo_transcurrido || 0;
        groupedData[key].sesiones += 1;
      });

      Object.entries(groupedData).forEach(([key, value]) => {
        processedData.push({
          proyecto: tipoReporte === 'proyecto' ? key : 'N/A',
          cliente: tipoReporte === 'cliente' ? key : 'N/A',
          tiempo_total: value.tiempo,
          sesiones: value.sesiones,
          fecha: value.fecha
        });
      });

      setReportData(processedData);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltroProyecto('');
    setFiltroCliente('');
    setFechaInicio('');
    setFechaFin('');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-white text-xl font-black">CARGANDO REPORTES...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">REPORTES</h1>
          <p className="text-gray-400 font-bold">Análisis de tiempo y productividad</p>
        </div>
        
        <Button
          onClick={() => setExportModalOpen(true)}
          className="bg-green-400 hover:bg-green-300 text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_#000000]"
        >
          <Download className="mr-2" size={20} />
          EXPORTAR
        </Button>
      </div>

      {/* Filtros */}
      <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="text-black" size={24} />
          <h3 className="text-lg font-black text-black">FILTROS</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Select value={tipoReporte} onValueChange={setTipoReporte}>
            <SelectTrigger className="border-2 border-black">
              <SelectValue placeholder="Tipo de reporte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="proyecto">Por Proyecto</SelectItem>
              <SelectItem value="cliente">Por Cliente</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="border-2 border-black"
            placeholder="Fecha inicio"
          />
          
          <Input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="border-2 border-black"
            placeholder="Fecha fin"
          />
          
          <Button
            onClick={limpiarFiltros}
            className="bg-gray-400 hover:bg-gray-300 text-black font-black border-2 border-black"
          >
            LIMPIAR
          </Button>
        </div>
      </Card>

      {/* Gráfico */}
      <ReportChart data={reportData} tipo={tipoReporte} />

      {/* Tabla */}
      <ReportTable data={reportData} tipo={tipoReporte} />

      {/* Modal de exportación */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        data={reportData}
        tipo={tipoReporte}
      />
    </div>
  );
};

export default Reportes;
