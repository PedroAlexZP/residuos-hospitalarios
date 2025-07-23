-- Script de migración para corregir la tabla reportes
-- Ejecutar en Supabase SQL Editor

-- Agregar la columna descripcion si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reportes' 
        AND column_name = 'descripcion'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.reportes ADD COLUMN descripcion TEXT;
        RAISE NOTICE 'Columna descripcion agregada';
    ELSE
        RAISE NOTICE 'Columna descripcion ya existe';
    END IF;
END $$;

-- Actualizar registros existentes con valores por defecto
UPDATE public.reportes 
SET descripcion = 'Descripción no especificada' 
WHERE descripcion IS NULL OR descripcion = '';

-- Hacer la columna NOT NULL
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reportes' 
        AND column_name = 'descripcion'
        AND is_nullable = 'YES'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.reportes ALTER COLUMN descripcion SET NOT NULL;
        RAISE NOTICE 'Columna descripcion configurada como NOT NULL';
    END IF;
END $$;

-- Actualizar el constraint del estado
DO $$
BEGIN
    -- Eliminar constraint existente si existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'reportes' 
        AND constraint_name = 'reportes_estado_check'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.reportes DROP CONSTRAINT reportes_estado_check;
        RAISE NOTICE 'Constraint anterior eliminado';
    END IF;
    
    -- Agregar nuevo constraint
    ALTER TABLE public.reportes ADD CONSTRAINT reportes_estado_check 
    CHECK (estado IN ('generando', 'completado', 'error', 'pendiente'));
    RAISE NOTICE 'Nuevo constraint agregado';
END $$;

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_reportes_usuario ON public.reportes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reportes_fecha ON public.reportes(fecha_generacion);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON public.reportes(estado);

-- Verificar la estructura final
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'reportes' 
AND table_schema = 'public'
ORDER BY ordinal_position;
