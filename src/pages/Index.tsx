
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Users, FolderOpen, FileText, CheckSquare, Clock, DollarSign } from 'lucide-react';

const Index = () => {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalProyectos: 0,
    totalPropuestas: 0,
    totalTareas: 0,
    proyectosActivos: 0,
    ingresosPotenciales: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [clientesRes, proyectosRes, propuestasRes, tareasRes] = await Promise.all([
        supabase.from('clientes').select('id', { count: 'exact' }),
        supabase.from('proyectos').select('id, estado, presupuesto', { count: 'exact' }),
        supabase.from('propuestas').select('id, monto', { count: 'exact' }),
        supabase.from('tareas').select('id', { count: 'exact' })
      ]);

      const proyectosActivos = proyectosRes.data?.filter(p => p.estado === 'en_progreso').length || 0;
      const ingresosPotenciales = propuestasRes.data?.reduce((sum, p) => sum + (p.monto || 0), 0) || 0;

      setStats({
        totalClientes: clientesRes.count || 0,
        totalProyectos: proyectosRes.count || 0,
        totalPropuestas: propuestasRes.count || 0,
        totalTareas: tareasRes.count || 0,
        proyectosActivos,
        ingresosPotenciales
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'CLIENTES',
      value: stats.totalClientes,
      icon: Users,
      color: 'bg-yellow-400',
      shadow: 'shadow-[8px_8px_0px_0px_#ffff00]'
    },
    {
      title: 'PROYECTOS',
      value: stats.totalProyectos,
      icon: FolderOpen,
      color: 'bg-green-400',
      shadow: 'shadow-[8px_8px_0px_0px_#00ff00]'
    },
    {
      title: 'PROPUESTAS',
      value: stats.totalPropuestas,
      icon: FileText,
      color: 'bg-pink-400',
      shadow: 'shadow-[8px_8px_0px_0px_#ff00ff]'
    },
    {
      title: 'TAREAS',
      value: stats.totalTareas,
      icon: CheckSquare,
      color: 'bg-blue-400',
      shadow: 'shadow-[8px_8px_0px_0px_#0000ff]'
    },
    {
      title: 'PROYECTOS ACTIVOS',
      value: stats.proyectosActivos,
      icon: Clock,
      color: 'bg-orange-400',
      shadow: 'shadow-[8px_8px_0px_0px_#ff8800]'
    },
    {
      title: 'INGRESOS POTENCIALES',
      value: `$${stats.ingresosPotenciales.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-400',
      shadow: 'shadow-[8px_8px_0px_0px_#00aa88]'
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-white text-xl font-black">CARGANDO DASHBOARD...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-6xl font-black text-white mb-4">CRM DASHBOARD</h1>
        <p className="text-xl text-gray-400 font-bold">GESTIÓN BRUTAL DE TU NEGOCIO</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={index}
              className={`${card.color} border-4 border-black ${card.shadow} p-6 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-black mb-2">{card.title}</h3>
                  <p className="text-3xl font-black text-black">{card.value}</p>
                </div>
                <Icon size={48} className="text-black" />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#ffff00] p-6">
          <h2 className="text-2xl font-black text-black mb-4">ACCIONES RÁPIDAS</h2>
          <div className="space-y-3">
            <button className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-3 px-4 border-4 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] transition-all">
              NUEVO CLIENTE
            </button>
            <button className="w-full bg-green-400 hover:bg-green-300 text-black font-black py-3 px-4 border-4 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] transition-all">
              NUEVO PROYECTO
            </button>
            <button className="w-full bg-pink-400 hover:bg-pink-300 text-black font-black py-3 px-4 border-4 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] transition-all">
              NUEVA PROPUESTA
            </button>
          </div>
        </Card>

        <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#ff00ff] p-6">
          <h2 className="text-2xl font-black text-black mb-4">ESTADO DEL SISTEMA</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b-2 border-black">
              <span className="font-bold">BASE DE DATOS</span>
              <span className="bg-green-400 text-black px-3 py-1 font-black border-2 border-black">ACTIVA</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b-2 border-black">
              <span className="font-bold">AUTENTICACIÓN</span>
              <span className="bg-green-400 text-black px-3 py-1 font-black border-2 border-black">ACTIVA</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-bold">SISTEMA CRM</span>
              <span className="bg-green-400 text-black px-3 py-1 font-black border-2 border-black">OPERATIVO</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
