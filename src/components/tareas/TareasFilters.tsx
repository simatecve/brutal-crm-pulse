
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Filter, ArrowUpDown } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface TareasFiltersProps {
  filtroEstado: string;
  filtroPrioridad: string;
  ordenarPor: string;
  direccionOrden: 'asc' | 'desc';
  onFiltroEstadoChange: (value: string) => void;
  onFiltroPrioridadChange: (value: string) => void;
  onOrdenarPorChange: (value: string) => void;
  onDireccionOrdenChange: (value: 'asc' | 'desc') => void;
}

const TareasFilters = ({
  filtroEstado,
  filtroPrioridad,
  ordenarPor,
  direccionOrden,
  onFiltroEstadoChange,
  onFiltroPrioridadChange,
  onOrdenarPorChange,
  onDireccionOrdenChange,
}: TareasFiltersProps) => {
  return (
    <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-4 mb-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="text-black" size={20} />
          <span className="font-black text-black">FILTROS:</span>
        </div>

        {/* Filtro por Estado */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-black">ESTADO</label>
          <Select value={filtroEstado} onValueChange={onFiltroEstadoChange}>
            <SelectTrigger className="bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] w-32 h-8 font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000000] z-50">
              <SelectItem value="todos">TODOS</SelectItem>
              <SelectItem value="pendiente">PENDIENTE</SelectItem>
              <SelectItem value="en_progreso">EN PROGRESO</SelectItem>
              <SelectItem value="completada">COMPLETADA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por Prioridad */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-black">PRIORIDAD</label>
          <Select value={filtroPrioridad} onValueChange={onFiltroPrioridadChange}>
            <SelectTrigger className="bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] w-32 h-8 font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000000] z-50">
              <SelectItem value="todos">TODOS</SelectItem>
              <SelectItem value="baja">BAJA</SelectItem>
              <SelectItem value="media">MEDIA</SelectItem>
              <SelectItem value="alta">ALTA</SelectItem>
              <SelectItem value="urgente">URGENTE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ordenar por */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-black">ORDENAR POR</label>
          <Select value={ordenarPor} onValueChange={onOrdenarPorChange}>
            <SelectTrigger className="bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] w-40 h-8 font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000000] z-50">
              <SelectItem value="created_at">FECHA CREACIÓN</SelectItem>
              <SelectItem value="fecha_vencimiento">FECHA VENCIMIENTO</SelectItem>
              <SelectItem value="prioridad">PRIORIDAD</SelectItem>
              <SelectItem value="estado">ESTADO</SelectItem>
              <SelectItem value="tiempo_total">TIEMPO USADO</SelectItem>
              <SelectItem value="titulo">NOMBRE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dirección de orden */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-black">DIRECCIÓN</label>
          <ToggleGroup 
            type="single" 
            value={direccionOrden} 
            onValueChange={(value) => value && onDireccionOrdenChange(value as 'asc' | 'desc')}
            className="bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_#000000] rounded-md p-1"
          >
            <ToggleGroupItem 
              value="asc" 
              className="text-black font-bold data-[state=on]:bg-green-400 data-[state=on]:text-black"
              size="sm"
            >
              ↑ ASC
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="desc" 
              className="text-black font-bold data-[state=on]:bg-green-400 data-[state=on]:text-black"
              size="sm"
            >
              ↓ DESC
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </Card>
  );
};

export default TareasFilters;
