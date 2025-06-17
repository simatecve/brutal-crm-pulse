
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Clock, Calendar, TrendingUp } from 'lucide-react';

const TimeStats = () => {
  const [timeStats, setTimeStats] = useState({
    hoy: 0,
    semana: 0,
    mes: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTimeStats();
    }
  }, [user]);

  const fetchTimeStats = async () => {
    try {
      const hoy = new Date();
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - hoy.getDay());
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

      // Tiempo trabajado hoy
      const { data: sesionesHoy } = await supabase
        .from('sesiones_tiempo')
        .select('tiempo_transcurrido')
        .eq('user_id', user?.id)
        .gte('inicio', hoy.toISOString().split('T')[0]);

      // Tiempo trabajado esta semana
      const { data: sesionesSemana } = await supabase
        .from('sesiones_tiempo')
        .select('tiempo_transcurrido')
        .eq('user_id', user?.id)
        .gte('inicio', inicioSemana.toISOString());

      // Tiempo trabajado este mes
      const { data: sesionesMes } = await supabase
        .from('sesiones_tiempo')
        .select('tiempo_transcurrido')
        .eq('user_id', user?.id)
        .gte('inicio', inicioMes.toISOString());

      const tiempoHoy = sesionesHoy?.reduce((sum, s) => sum + (s.tiempo_transcurrido || 0), 0) || 0;
      const tiempoSemana = sesionesSemana?.reduce((sum, s) => sum + (s.tiempo_transcurrido || 0), 0) || 0;
      const tiempoMes = sesionesMes?.reduce((sum, s) => sum + (s.tiempo_transcurrido || 0), 0) || 0;

      setTimeStats({
        hoy: Math.floor(tiempoHoy / 3600), // Convertir a horas
        semana: Math.floor(tiempoSemana / 3600),
        mes: Math.floor(tiempoMes / 3600)
      });
    } catch (error) {
      console.error('Error fetching time stats:', error);
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

  const stats = [
    {
      label: 'HOY',
      value: `${timeStats.hoy}h`,
      icon: Clock,
      color: 'bg-purple-400'
    },
    {
      label: 'ESTA SEMANA',
      value: `${timeStats.semana}h`,
      icon: Calendar,
      color: 'bg-cyan-400'
    },
    {
      label: 'ESTE MES',
      value: `${timeStats.mes}h`,
      icon: TrendingUp,
      color: 'bg-indigo-400'
    }
  ];

  return (
    <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-6">
      <h2 className="text-2xl font-black text-black mb-6">TIEMPO TRABAJADO</h2>
      <div className="space-y-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`${stat.color} border-2 border-black shadow-[4px_4px_0px_0px_#000000] p-4 flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <Icon size={24} className="text-black" />
                <span className="font-bold text-black">{stat.label}</span>
              </div>
              <span className="text-2xl font-black text-black">{stat.value}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default TimeStats;
