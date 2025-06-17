
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, 
  Users, 
  FolderOpen, 
  FileText, 
  CheckSquare, 
  Clock,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const AppSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Clientes', path: '/clientes' },
    { icon: FolderOpen, label: 'Proyectos', path: '/proyectos' },
    { icon: FileText, label: 'Propuestas', path: '/propuestas' },
    { icon: CheckSquare, label: 'Tareas', path: '/tareas' },
    { icon: Clock, label: 'Time Tracker', path: '/time-tracker' },
  ];

  return (
    <div className={`bg-black border-r-4 border-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          {!isCollapsed && (
            <h1 className="text-yellow-400 text-xl font-black">CRM BRUTAL</h1>
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

        <div className="mt-8">
          <Button
            onClick={signOut}
            className="w-full bg-red-500 hover:bg-red-400 text-white border-2 border-white shadow-[2px_2px_0px_0px_#ffffff] font-bold"
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="ml-2">SALIR</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppSidebar;
