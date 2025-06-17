
import { Card } from '@/components/ui/card';
import { CheckSquare } from 'lucide-react';

const TareasEmptyState = () => {
  return (
    <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-8 text-center">
      <CheckSquare size={64} className="mx-auto mb-4 text-gray-400" />
      <h3 className="text-2xl font-black text-black mb-2">NO HAY TAREAS</h3>
      <p className="text-gray-600 font-bold">Crea tu primera tarea</p>
    </Card>
  );
};

export default TareasEmptyState;
