
-- Eliminar la tabla existente si existe
DROP TABLE IF EXISTS public.sugerencias CASCADE;

-- Crear la tabla sugerencias correctamente
CREATE TABLE public.sugerencias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'general' 
    CHECK (categoria IN ('bug', 'mejora', 'nueva_funcionalidad', 'general')),
  estado TEXT NOT NULL DEFAULT 'pendiente' 
    CHECK (estado IN ('pendiente', 'en_revision', 'implementada', 'rechazada')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE public.sugerencias ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para sugerencias
CREATE POLICY "Users can view their own sugerencias" ON public.sugerencias
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sugerencias" ON public.sugerencias
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sugerencias" ON public.sugerencias
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sugerencias" ON public.sugerencias
  FOR DELETE USING (auth.uid() = user_id);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_sugerencias_user_id ON public.sugerencias(user_id);
CREATE INDEX idx_sugerencias_estado ON public.sugerencias(estado);
CREATE INDEX idx_sugerencias_categoria ON public.sugerencias(categoria);
CREATE INDEX idx_sugerencias_created_at ON public.sugerencias(created_at DESC);
