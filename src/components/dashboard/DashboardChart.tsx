
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

const DashboardChart = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchChartData();
    }
  }, [user]);

  const fetchChartData = async () => {
    try {
      // Obtener datos de los últimos 7 días
      const fechas = [];
      for (let i = 6; i >= 0; i--) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        fechas.push(fecha.toISOString().split('T')[0]);
      }

      const datos = await Promise.all(
        fechas.map(async (fecha) => {
          const { data: sesiones } = await supabase
            .from('sesiones_tiempo')
            .select('tiempo_transcurrido')
            .eq('user_id', user?.id)
            .gte('inicio', fecha)
            .lt('inicio', new Date(new Date(fecha).getTime() + 24 * 60 * 60 * 1000).toISOString());

          const tiempoTotal = sesiones?.reduce((sum, s) => sum + (s.tiempo_transcurrido || 0), 0) || 0;
          
          return {
            fecha: new Date(fecha).toLocaleDateString('es-ES', { weekday: 'short' }),
            horas: Math.round((tiempoTotal / 3600) * 10) / 10
          };
        })
      );

      setChartData(datos);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-6">
        <div className="text-center text-black font-black">CARGANDO...</div>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={24} className="text-black" />
        <h2 className="text-2xl font-black text-black">PRODUCTIVIDAD SEMANAL</h2>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#000" />
            <XAxis 
              dataKey="fecha" 
              stroke="#000" 
              style={{ fontWeight: 'bold', fontSize: '12px' }}
            />
            <YAxis 
              stroke="#000" 
              style={{ fontWeight: 'bold', fontSize: '12px' }}
              label={{ value: 'Horas', angle: -90, position: 'insideLeft', style: { fontWeight: 'bold' } }}
            />
            <Bar 
              dataKey="horas" 
              fill="#facc15" 
              stroke="#000" 
              strokeWidth={2}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default DashboardChart;
