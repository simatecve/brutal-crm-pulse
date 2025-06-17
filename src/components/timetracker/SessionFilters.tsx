
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface Proyecto {
  id: string;
  nombre: string;
}

interface SessionFiltersProps {
  filtroFecha: string;
  setFiltroFecha: (fecha: string) => void;
  filtroProyecto: string;
  setFiltroProyecto: (proyecto: string) => void;
  proyectos: Proyecto[];
  onLimpiarFiltros: () => void;
}

const SessionFilters = ({
  filtroFecha,
  setFiltroFecha,
  filtroProyecto,
  setFiltroProyecto,
  proyectos,
  onLimpiarFiltros
}: SessionFiltersProps) => {
  return (
    <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-4">
      <div className="flex items-center gap-4 flex-wrap">
        <Filter size={20} className="text-black" />
        <span className="font-black text-black">FILTROS:</span>
        <input
          type="date"
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
          className="border-2 border-black px-3 py-1 font-bold"
        />
        <Select value={filtroProyecto} onValueChange={setFiltroProyecto}>
          <SelectTrigger className="w-48 border-2 border-black">
            <SelectValue placeholder="Filtrar por proyecto" />
          </SelectTrigger>
          <SelectContent>
            {proyectos.map((proyecto) => (
              <SelectItem key={proyecto.id} value={proyecto.id}>
                {proyecto.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={onLimpiarFiltros}
          className="bg-gray-400 hover:bg-gray-300 text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] px-4 py-1"
        >
          LIMPIAR
        </Button>
      </div>
    </Card>
  );
};

export default SessionFilters;
