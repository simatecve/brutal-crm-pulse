
-- Crear tabla de comentarios para tareas
CREATE TABLE public.comentarios_tareas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  tarea_id UUID REFERENCES public.tareas(id) ON DELETE CASCADE,
  comentario TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE public.comentarios_tareas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para comentarios_tareas
CREATE POLICY "Users can view their own comentarios_tareas" ON public.comentarios_tareas
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own comentarios_tareas" ON public.comentarios_tareas
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comentarios_tareas" ON public.comentarios_tareas
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comentarios_tareas" ON public.comentarios_tareas
  FOR DELETE USING (auth.uid() = user_id);

-- Agregar columna de tiempo activo a tareas (tiempo total registrado en minutos)
ALTER TABLE public.tareas ADD COLUMN tiempo_registrado INTEGER DEFAULT 0;

-- Crear tabla para sesiones de tiempo activas
CREATE TABLE public.sesiones_tiempo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  tarea_id UUID REFERENCES public.tareas(id) ON DELETE CASCADE,
  inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  fin TIMESTAMP WITH TIME ZONE,
  tiempo_transcurrido INTEGER DEFAULT 0, -- en segundos
  estado TEXT DEFAULT 'activa' CHECK (estado IN ('activa', 'pausada', 'finalizada')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE public.sesiones_tiempo ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para sesiones_tiempo
CREATE POLICY "Users can view their own sesiones_tiempo" ON public.sesiones_tiempo
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sesiones_tiempo" ON public.sesiones_tiempo
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sesiones_tiempo" ON public.sesiones_tiempo
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sesiones_tiempo" ON public.sesiones_tiempo
  FOR DELETE USING (auth.uid() = user_id);
