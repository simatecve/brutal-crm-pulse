import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Home, 
  Users, 
  FolderOpen, 
  FileText, 
  CheckSquare, 
  Clock,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Kanban,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfiguracionSistema {
  nombre_sistema: string;
  version: string;
  copyright: string;
}

const AppSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [config, setConfig] = useState<ConfiguracionSistema | null>(null);
  const location = useLocation();
  const { signOut, user } = useAuth();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracion_sistema')
        .select('nombre_sistema, version, copyright')
        .limit(1)
        .single();

      if (error) throw error;
      setConfig(data);
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Clientes', path: '/clientes' },
    { icon: FolderOpen, label: 'Proyectos', path: '/proyectos' },
    { icon: FileText, label: 'Propuestas', path: '/propuestas' },
    { icon: CheckSquare, label: 'Tareas', path: '/tareas' },
    { icon: Kanban, label: 'Kanban', path: '/kanban' },
    { icon: Clock, label: 'Time Tracker', path: '/time-tracker' },
    { icon: BarChart3, label: 'Reportes', path: '/reportes' },
    { icon: MessageSquare, label: 'Sugerencias', path: '/sugerencias' },
    { icon: Settings, label: 'Configuración', path: '/configuracion' },
  ];

  return (
    <div className={`bg-black border-r-4 border-white transition-all duration-300 flex flex-col ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-8">
          {!isCollapsed && config && (
            <div>
              <h1 className="text-yellow-400 text-xl font-black">{config.nombre_sistema}</h1>
              <p className="text-white text-xs">{config.version}</p>
            </div>
          )}
          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="bg-yellow-400 hover:bg-yellow-300 text-black border-2 border-white p-2 shadow-[2px_2px_0px_0px_#ffffff]"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </Button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-3 border-2 transition-all ${
                  isActive
                    ? 'bg-yellow-400 text-black border-white shadow-[4px_4px_0px_0px_#ffffff]'
                    : 'bg-white text-black border-black hover:bg-pink-400 hover:border-white hover:shadow-[2px_2px_0px_0px_#ffffff]'
                }`}
              >
                <Icon size={20} />
                {!isCollapsed && (
                  <span className="font-bold text-sm">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t-2 border-white">
        {!isCollapsed && user && (
          <div className="mb-4 p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
            <div className="flex items-center gap-2">
              <User size={16} className="text-black" />
              <div className="flex-1 min-w-0">
                <p className="text-black font-bold text-sm truncate">{user.email}</p>
                <p className="text-gray-600 text-xs">Usuario activo</p>
              </div>
            </div>
          </div>
        )}
        
        <Button
          onClick={signOut}
          className="w-full bg-red-500 hover:bg-red-400 text-white border-2 border-white shadow-[2px_2px_0px_0px_#ffffff] font-bold"
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="ml-2">SALIR</span>}
        </Button>
        
        {!isCollapsed && config && (
          <p className="text-gray-400 text-xs mt-2 text-center">{config.copyright}</p>
        )}
      </div>
    </div>
  );
};

export default AppSidebar;
