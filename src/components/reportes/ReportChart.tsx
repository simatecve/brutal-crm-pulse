
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ReportData {
  proyecto: string;
  cliente: string;
  tiempo_total: number;
  sesiones: number;
  fecha: string;
}

interface ReportChartProps {
  data: ReportData[];
  tipo: string;
}

const COLORS = ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa', '#fb7185'];

const ReportChart = ({ data, tipo }: ReportChartProps) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const chartData = data.map(item => ({
    name: tipo === 'proyecto' ? item.proyecto : item.cliente,
    tiempo: Math.floor(item.tiempo_total / 3600 * 100) / 100, // Convertir a horas con 2 decimales
    sesiones: item.sesiones
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de barras */}
      <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-6">
        <h3 className="text-lg font-black text-black mb-4">TIEMPO POR {tipo.toUpperCase()}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: any, name: string) => [
                name === 'tiempo' ? `${value}h` : value,
                name === 'tiempo' ? 'Horas' : 'Sesiones'
              ]}
            />
            <Bar dataKey="tiempo" fill="#fbbf24" stroke="#000" strokeWidth={2} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Gráfico circular */}
      <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-6">
        <h3 className="text-lg font-black text-black mb-4">DISTRIBUCIÓN DE TIEMPO</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="tiempo"
              stroke="#000"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => [`${value}h`, 'Horas']} />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default ReportChart;
