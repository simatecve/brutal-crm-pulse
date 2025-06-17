
-- Crear tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Crear tabla de clientes
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  empresa TEXT,
  direccion TEXT,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Crear tabla de proyectos
CREATE TABLE public.proyectos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  estado TEXT DEFAULT 'en_progreso' CHECK (estado IN ('planificacion', 'en_progreso', 'completado', 'cancelado')),
  fecha_inicio DATE,
  fecha_fin DATE,
  presupuesto DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Crear tabla de propuestas
CREATE TABLE public.propuestas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  monto DECIMAL(10,2),
  estado TEXT DEFAULT 'borrador' CHECK (estado IN ('borrador', 'enviada', 'aceptada', 'rechazada')),
  fecha_envio DATE,
  fecha_vencimiento DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Crear tabla de tareas
CREATE TABLE public.tareas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completada')),
  prioridad TEXT DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
  fecha_vencimiento DATE,
  tiempo_estimado INTEGER, -- en minutos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Crear tabla de time tracking
CREATE TABLE public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  tarea_id UUID REFERENCES public.tareas(id) ON DELETE CASCADE,
  proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE CASCADE,
  descripcion TEXT,
  tiempo_minutos INTEGER NOT NULL,
  fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_fin TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar Row Level Security en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para clientes
CREATE POLICY "Users can view their own clientes" ON public.clientes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own clientes" ON public.clientes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own clientes" ON public.clientes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own clientes" ON public.clientes
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para proyectos
CREATE POLICY "Users can view their own proyectos" ON public.proyectos
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own proyectos" ON public.proyectos
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own proyectos" ON public.proyectos
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own proyectos" ON public.proyectos
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para propuestas
CREATE POLICY "Users can view their own propuestas" ON public.propuestas
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own propuestas" ON public.propuestas
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own propuestas" ON public.propuestas
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own propuestas" ON public.propuestas
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para tareas
CREATE POLICY "Users can view their own tareas" ON public.tareas
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tareas" ON public.tareas
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tareas" ON public.tareas
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tareas" ON public.tareas
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para time_entries
CREATE POLICY "Users can view their own time_entries" ON public.time_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own time_entries" ON public.time_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own time_entries" ON public.time_entries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own time_entries" ON public.time_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
