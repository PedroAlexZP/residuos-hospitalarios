-- Migración para agregar el campo descripcion a la tabla reportes
-- Este archivo debe ejecutarse si la tabla reportes ya existe

-- Agregar la columna descripcion si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reportes' 
        AND column_name = 'descripcion'
    ) THEN
        ALTER TABLE public.reportes ADD COLUMN descripcion TEXT;
    END IF;
END $$;

-- Actualizar la columna descripcion para que sea NOT NULL después de agregar datos por defecto
DO $$
BEGIN
    -- Primero, llenar los valores nulos con un valor por defecto
    UPDATE public.reportes 
    SET descripcion = 'Descripción no especificada' 
    WHERE descripcion IS NULL OR descripcion = '';
    
    -- Luego, hacer la columna NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reportes' 
        AND column_name = 'descripcion'
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE public.reportes ALTER COLUMN descripcion SET NOT NULL;
    END IF;
END $$;

-- Actualizar el constraint del estado para incluir 'pendiente'
DO $$
BEGIN
    -- Eliminar el constraint existente si existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'reportes' 
        AND constraint_name = 'reportes_estado_check'
    ) THEN
        ALTER TABLE public.reportes DROP CONSTRAINT reportes_estado_check;
    END IF;
    
    -- Agregar el nuevo constraint
    ALTER TABLE public.reportes ADD CONSTRAINT reportes_estado_check 
    CHECK (estado IN ('generando', 'completado', 'error', 'pendiente'));
END $$;

-- Crear índice para reportes por usuario si no existe
CREATE INDEX IF NOT EXISTS idx_reportes_usuario ON public.reportes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reportes_fecha ON public.reportes(fecha_generacion);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON public.reportes(estado);
