
-- Crear tabla para configuración del sistema
CREATE TABLE public.configuracion_sistema (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_sistema TEXT NOT NULL DEFAULT 'CRM BRUTAL',
  version TEXT NOT NULL DEFAULT '1.0.0',
  copyright TEXT NOT NULL DEFAULT '© 2024 CRM BRUTAL. Todos los derechos reservados.',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Insertar datos iniciales
INSERT INTO public.configuracion_sistema (nombre_sistema, version, copyright) 
VALUES ('CRM BRUTAL', '1.0.0', '© 2024 CRM BRUTAL. Todos los derechos reservados.');

-- Habilitar Row Level Security
ALTER TABLE public.configuracion_sistema ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos puedan leer la configuración
CREATE POLICY "Anyone can view configuracion_sistema" ON public.configuracion_sistema
  FOR SELECT USING (true);
