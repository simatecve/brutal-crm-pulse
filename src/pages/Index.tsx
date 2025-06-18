
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FolderOpen, FileText, CheckSquare, Clock, DollarSign, AlertTriangle, TrendingUp, Settings, BarChart3, Kanban, Target, Bell } from 'lucide-react';
import DashboardChart from '@/components/dashboard/DashboardChart';
import TasksOverview from '@/components/dashboard/TasksOverview';
import UpcomingTasks from '@/components/dashboard/UpcomingTasks';
import TimeStats from '@/components/dashboard/TimeStats';

const Index = () => {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalProyectos: 0,
    totalPropuestas: 0,
    totalTareas: 0,
    proyectosActivos: 0,
    ingresosPotenciales: 0,
    tareasPendientes: 0,
    tareasEnProgreso: 0,
    tareasCompletadas: 0,
    tareasVencidas: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const [clientesRes, proyectosRes, propuestasRes, tareasRes] = await Promise.all([
        supabase.from('clientes').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('proyectos').select('id, estado, presupuesto', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('propuestas').select('id, monto', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('tareas').select('id, estado, fecha_vencimiento', { count: 'exact' }).eq('user_id', user.id)
      ]);

      const proyectosActivos = proyectosRes.data?.filter(p => p.estado === 'en_progreso').length || 0;
      const ingresosPotenciales = propuestasRes.data?.reduce((sum, p) => sum + (p.monto || 0), 0) || 0;

      // Estadísticas de tareas
      const tareas = tareasRes.data || [];
      const tareasPendientes = tareas.filter(t => t.estado === 'pendiente').length;
      const tareasEnProgreso = tareas.filter(t => t.estado === 'en_progreso').length;
      const tareasCompletadas = tareas.filter(t => t.estado === 'completada').length;
      
      // Tareas vencidas (pendientes o en progreso con fecha vencimiento pasada)
      const hoy = new Date();
      const tareasVencidas = tareas.filter(t => 
        (t.estado === 'pendiente' || t.estado === 'en_progreso') && 
        t.fecha_vencimiento && 
        new Date(t.fecha_vencimiento) < hoy
      ).length;

      setStats({
        totalClientes: clientesRes.count || 0,
        totalProyectos: proyectosRes.count || 0,
        totalPropuestas: propuestasRes.count || 0,
        totalTareas: tareasRes.count || 0,
        proyectosActivos,
        ingresosPotenciales,
        tareasPendientes,
        tareasEnProgreso,
        tareasCompletadas,
        tareasVencidas
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

      {/* Stats Cards */}
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

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksOverview stats={stats} />
        <TimeStats />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingTasks />
        <DashboardChart />
      </div>

      {/* Action Cards - Nuevas funcionalidades destacadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#ffff00] p-6">
          <h2 className="text-2xl font-black text-black mb-4">⚡ GESTIÓN DE TIEMPO</h2>
          <div className="space-y-3">
            <Link to="/time-tracker">
              <Button className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-3 px-4 border-4 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] transition-all">
                <Clock className="mr-2" size={20} />
                TIME TRACKER
              </Button>
            </Link>
            <Link to="/kanban">
              <Button className="w-full bg-blue-400 hover:bg-blue-300 text-black font-black py-3 px-4 border-4 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] transition-all">
                <Kanban className="mr-2" size={20} />
                VISTA KANBAN
              </Button>
            </Link>
            <Link to="/configuracion">
              <Button className="w-full bg-purple-400 hover:bg-purple-300 text-black font-black py-3 px-4 border-4 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] transition-all">
                <Target className="mr-2" size={20} />
                POMODORO & OBJETIVOS
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#00ff00] p-6">
          <h2 className="text-2xl font-black text-black mb-4">📊 ANÁLISIS</h2>
          <div className="space-y-3">
            <Link to="/reportes">
              <Button className="w-full bg-green-400 hover:bg-green-300 text-black font-black py-3 px-4 border-4 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] transition-all">
                <BarChart3 className="mr-2" size={20} />
                REPORTES AVANZADOS
              </Button>
            </Link>
            <Button className="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-black py-3 px-4 border-4 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] transition-all">
              <TrendingUp className="mr-2" size={20} />
              PRODUCTIVIDAD SEMANAL
            </Button>
            <Button className="w-full bg-indigo-400 hover:bg-indigo-300 text-black font-black py-3 px-4 border-4 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] transition-all">
              <DollarSign className="mr-2" size={20} />
              ANÁLISIS DE INGRESOS
            </Button>
          </div>
        </Card>

        <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#ff00ff] p-6">
          <h2 className="text-2xl font-black text-black mb-4">⚙️ CONFIGURACIÓN</h2>
          <div className="space-y-3">
            <Link to="/configuracion">
              <Button className="w-full bg-pink-400 hover:bg-pink-300 text-black font-black py-3 px-4 border-4 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] transition-all">
                <Settings className="mr-2" size={20} />
                CONFIGURACIÓN AVANZADA
              </Button>
            </Link>
            <Button className="w-full bg-orange-400 hover:bg-orange-300 text-black font-black py-3 px-4 border-4 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] transition-all">
              <Bell className="mr-2" size={20} />
              NOTIFICACIONES ACTIVAS
            </Button>
            <Button className="w-full bg-red-400 hover:bg-red-300 text-black font-black py-3 px-4 border-4 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] transition-all">
              <AlertTriangle className="mr-2" size={20} />
              MODO OSCURO/CLARO
            </Button>
          </div>
        </Card>
      </div>

      {/* Estado del Sistema actualizado */}
      <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-6">
        <h2 className="text-2xl font-black text-black mb-4">🚀 FUNCIONALIDADES DISPONIBLES</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <h3 className="font-black text-black">GESTIÓN DE TIEMPO</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="font-bold">Time Tracker</span>
                <span className="bg-green-400 text-black px-2 py-1 font-black text-xs border border-black">ACTIVO</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-bold">Técnica Pomodoro</span>
                <span className="bg-green-400 text-black px-2 py-1 font-black text-xs border border-black">ACTIVO</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-bold">Recordatorios</span>
                <span className="bg-green-400 text-black px-2 py-1 font-black text-xs border border-black">ACTIVO</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-black text-black">VISTAS Y REPORTES</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="font-bold">Vista Kanban</span>
                <span className="bg-green-400 text-black px-2 py-1 font-black text-xs border border-black">ACTIVO</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-bold">Reportes PDF/Excel</span>
                <span className="bg-green-400 text-black px-2 py-1 font-black text-xs border border-black">ACTIVO</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-bold">Gráficos Productividad</span>
                <span className="bg-green-400 text-black px-2 py-1 font-black text-xs border border-black">ACTIVO</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-black text-black">CONFIGURACIÓN</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="font-bold">Objetivos Personalizados</span>
                <span className="bg-green-400 text-black px-2 py-1 font-black text-xs border border-black">ACTIVO</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-bold">Estados Personalizados</span>
                <span className="bg-green-400 text-black px-2 py-1 font-black text-xs border border-black">ACTIVO</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-bold">Modo Oscuro/Claro</span>
                <span className="bg-green-400 text-black px-2 py-1 font-black text-xs border border-black">ACTIVO</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-black text-black">SISTEMA</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="font-bold">Notificaciones</span>
                <span className="bg-green-400 text-black px-2 py-1 font-black text-xs border border-black">ACTIVO</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-bold">Drag & Drop</span>
                <span className="bg-green-400 text-black px-2 py-1 font-black text-xs border border-black">ACTIVO</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-bold">Categorías Tiempo</span>
                <span className="bg-green-400 text-black px-2 py-1 font-black text-xs border border-black">ACTIVO</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Index;
