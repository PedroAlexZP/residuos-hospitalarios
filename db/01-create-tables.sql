-- Crear tablas para el sistema de gestión de residuos hospitalarios

-- Tabla de usuarios (extendida de auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('generador', 'supervisor', 'transportista', 'gestor_externo', 'admin')),
  departamento TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de residuos
CREATE TABLE IF NOT EXISTS public.residuos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL CHECK (cantidad > 0),
  ubicacion TEXT NOT NULL,
  fecha_generacion TIMESTAMP WITH TIME ZONE NOT NULL,
  usuario_id UUID REFERENCES public.users(id) NOT NULL,
  estado TEXT DEFAULT 'generado' CHECK (estado IN ('generado', 'etiquetado', 'pesado', 'almacenado', 'entregado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de etiquetas
CREATE TABLE IF NOT EXISTS public.etiquetas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  residuo_id UUID REFERENCES public.residuos(id) NOT NULL,
  tipo_etiqueta TEXT NOT NULL CHECK (tipo_etiqueta IN ('QR', 'codigo_barras')),
  codigo_qr TEXT UNIQUE NOT NULL,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  impresa BOOLEAN DEFAULT false
);

-- Tabla de pesajes
CREATE TABLE IF NOT EXISTS public.pesajes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  residuo_id UUID REFERENCES public.residuos(id) NOT NULL,
  peso DECIMAL(10,2) NOT NULL CHECK (peso > 0),
  fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responsable_id UUID REFERENCES public.users(id) NOT NULL,
  codigo_escaneado TEXT NOT NULL,
  observaciones TEXT
);

-- Tabla de gestores externos
CREATE TABLE IF NOT EXISTS public.gestores_externos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  licencia TEXT UNIQUE NOT NULL,
  contacto TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de entregas
CREATE TABLE IF NOT EXISTS public.entregas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gestor_externo_id UUID REFERENCES public.gestores_externos(id) NOT NULL,
  fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  certificado_pdf TEXT,
  usuario_id UUID REFERENCES public.users(id) NOT NULL,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'tratada')),
  numero_seguimiento TEXT UNIQUE
);

-- Tabla de detalle de entregas (relación muchos a muchos con residuos)
CREATE TABLE IF NOT EXISTS public.entrega_residuos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entrega_id UUID REFERENCES public.entregas(id) NOT NULL,
  residuo_id UUID REFERENCES public.residuos(id) NOT NULL,
  UNIQUE(entrega_id, residuo_id)
);

-- Tabla de incidencias
CREATE TABLE IF NOT EXISTS public.incidencias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  urgencia TEXT NOT NULL CHECK (urgencia IN ('baja', 'media', 'alta', 'critica')),
  residuo_id UUID REFERENCES public.residuos(id),
  evidencias JSONB,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usuario_id UUID REFERENCES public.users(id) NOT NULL,
  estado TEXT DEFAULT 'abierta' CHECK (estado IN ('abierta', 'en_proceso', 'resuelta', 'cerrada'))
);

-- Tabla de reportes
CREATE TABLE IF NOT EXISTS public.reportes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  fecha_generacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  filtros_aplicados JSONB,
  usuario_id UUID REFERENCES public.users(id) NOT NULL,
  archivo_url TEXT,
  estado TEXT DEFAULT 'generando' CHECK (estado IN ('generando', 'completado', 'error', 'pendiente'))
);

-- Tabla de capacitaciones
CREATE TABLE IF NOT EXISTS public.capacitaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tema TEXT NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  responsable_id UUID REFERENCES public.users(id) NOT NULL,
  material_pdf TEXT,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de participantes en capacitaciones
CREATE TABLE IF NOT EXISTS public.capacitacion_participantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  capacitacion_id UUID REFERENCES public.capacitaciones(id) NOT NULL,
  usuario_id UUID REFERENCES public.users(id) NOT NULL,
  asistio BOOLEAN DEFAULT false,
  calificacion INTEGER CHECK (calificacion >= 0 AND calificacion <= 100),
  UNIQUE(capacitacion_id, usuario_id)
);

-- Tabla de normativas
CREATE TABLE IF NOT EXISTS public.normativas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  documento_pdf TEXT,
  fecha_publicacion DATE NOT NULL,
  vigente BOOLEAN DEFAULT true,
  categoria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de permisos
CREATE TABLE IF NOT EXISTS public.permisos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rol TEXT NOT NULL,
  modulo TEXT NOT NULL,
  lectura BOOLEAN DEFAULT false,
  escritura BOOLEAN DEFAULT false,
  eliminacion BOOLEAN DEFAULT false,
  UNIQUE(rol, modulo)
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_residuos_usuario ON public.residuos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_residuos_fecha ON public.residuos(fecha_generacion);
CREATE INDEX IF NOT EXISTS idx_etiquetas_residuo ON public.etiquetas(residuo_id);
CREATE INDEX IF NOT EXISTS idx_pesajes_residuo ON public.pesajes(residuo_id);
CREATE INDEX IF NOT EXISTS idx_incidencias_usuario ON public.incidencias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_incidencias_fecha ON public.incidencias(fecha);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residuos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etiquetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entregas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capacitaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.normativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permisos ENABLE ROW LEVEL SECURITY;
