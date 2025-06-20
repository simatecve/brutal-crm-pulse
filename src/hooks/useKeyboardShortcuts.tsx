
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from './useTimer';
import { useToast } from './use-toast';

interface UseKeyboardShortcutsProps {
  enabled: boolean;
  onSave?: () => void;
  onNew?: () => void;
  onClose?: () => void;
}

export const useKeyboardShortcuts = ({
  enabled,
  onSave,
  onNew,
  onClose
}: UseKeyboardShortcutsProps) => {
  const navigate = useNavigate();
  const { isRunning, startTimer, pauseTimer } = useTimer();
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorar atajos si estamos en un input, textarea o elemento editable
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      // Atajos de navegación
      if (isCtrlOrCmd) {
        switch (event.key.toLowerCase()) {
          case 'd':
            event.preventDefault();
            navigate('/');
            toast({
              title: "Navegación",
              description: "Dashboard abierto (Ctrl+D)",
              duration: 2000
            });
            break;
          case 't':
            event.preventDefault();
            navigate('/tareas');
            toast({
              title: "Navegación",
              description: "Tareas abiertas (Ctrl+T)",
              duration: 2000
            });
            break;
          case 'k':
            event.preventDefault();
            navigate('/kanban');
            toast({
              title: "Navegación",
              description: "Kanban abierto (Ctrl+K)",
              duration: 2000
            });
            break;
          case 'r':
            event.preventDefault();
            navigate('/reportes');
            toast({
              title: "Navegación",
              description: "Reportes abiertos (Ctrl+R)",
              duration: 2000
            });
            break;
          case 'p':
            event.preventDefault();
            navigate('/proyectos');
            toast({
              title: "Navegación",
              description: "Proyectos abiertos (Ctrl+P)",
              duration: 2000
            });
            break;
          case 'c':
            event.preventDefault();
            navigate('/clientes');
            toast({
              title: "Navegación",
              description: "Clientes abiertos (Ctrl+C)",
              duration: 2000
            });
            break;
          case 's':
            event.preventDefault();
            if (onSave) {
              onSave();
              toast({
                title: "Guardado",
                description: "Cambios guardados (Ctrl+S)",
                duration: 2000
              });
            }
            break;
          case 'n':
            event.preventDefault();
            if (onNew) {
              onNew();
              toast({
                title: "Nuevo",
                description: "Nuevo elemento creado (Ctrl+N)",
                duration: 2000
              });
            }
            break;
        }
      }

      // Atajos sin modificadores
      switch (event.key) {
        case ' ':
          // Solo si no estamos en un input
          if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
            event.preventDefault();
            if (isRunning) {
              pauseTimer();
              toast({
                title: "Timer",
                description: "Timer pausado (Espacio)",
                duration: 2000
              });
            } else {
              startTimer();
              toast({
                title: "Timer",
                description: "Timer iniciado (Espacio)",
                duration: 2000
              });
            }
          }
          break;
        case 'Escape':
          event.preventDefault();
          if (onClose) {
            onClose();
            toast({
              title: "Cerrar",
              description: "Modal cerrado (Escape)",
              duration: 2000
            });
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, navigate, isRunning, startTimer, pauseTimer, onSave, onNew, onClose, toast]);

  return null;
};

export const keyboardShortcuts = [
  { key: 'Ctrl/Cmd + D', description: 'Ir al Dashboard', category: 'Navegación' },
  { key: 'Ctrl/Cmd + T', description: 'Ir a Tareas', category: 'Navegación' },
  { key: 'Ctrl/Cmd + K', description: 'Ir a Kanban', category: 'Navegación' },
  { key: 'Ctrl/Cmd + R', description: 'Ir a Reportes', category: 'Navegación' },
  { key: 'Ctrl/Cmd + P', description: 'Ir a Proyectos', category: 'Navegación' },
  { key: 'Ctrl/Cmd + C', description: 'Ir a Clientes', category: 'Navegación' },
  { key: 'Ctrl/Cmd + B', description: 'Abrir/Cerrar Sidebar', category: 'Interfaz' },
  { key: 'Ctrl/Cmd + S', description: 'Guardar cambios', category: 'Acciones' },
  { key: 'Ctrl/Cmd + N', description: 'Crear nuevo elemento', category: 'Acciones' },
  { key: 'Espacio', description: 'Iniciar/Pausar Timer', category: 'Timer' },
  { key: 'Escape', description: 'Cerrar modales', category: 'Interfaz' }
];
