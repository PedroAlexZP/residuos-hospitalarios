-- Script para actualizar tabla reportes existente
-- Solo actualiza la estructura, no intenta crear la tabla

-- Verificar estructura actual
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'reportes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

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
        RAISE NOTICE 'Columna descripcion agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna descripcion ya existe';
    END IF;
END $$;

-- Actualizar registros existentes con un valor por defecto
UPDATE public.reportes 
SET descripcion = CASE 
    WHEN descripcion IS NULL OR descripcion = '' THEN 'Descripción no especificada'
    ELSE descripcion
END;

-- Hacer la columna NOT NULL después de llenar los valores
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
    ELSE
        RAISE NOTICE 'La columna descripcion ya es NOT NULL';
    END IF;
END $$;

-- Actualizar el constraint del estado para incluir 'pendiente'
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
    RAISE NOTICE 'Nuevo constraint de estado agregado';
END $$;

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_reportes_usuario ON public.reportes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reportes_fecha ON public.reportes(fecha_generacion);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON public.reportes(estado);

-- Verificar la estructura final después de los cambios
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'reportes' 
AND table_schema = 'public'
ORDER BY ordinal_position;
