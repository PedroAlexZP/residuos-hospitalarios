-- Verificar y corregir el constraint del estado en reportes

-- Primero, verificar la estructura actual
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'reportes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar constraints existentes
SELECT 
    constraint_name,
    constraint_type,
    check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'reportes' 
AND tc.table_schema = 'public';

-- Eliminar cualquier constraint problemático del estado
DO $$
BEGIN
    -- Eliminar todos los constraints de estado que puedan estar causando problemas
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'reportes' 
        AND constraint_name LIKE '%estado%'
        AND table_schema = 'public'
    ) THEN
        EXECUTE 'ALTER TABLE public.reportes DROP CONSTRAINT IF EXISTS reportes_estado_check';
        EXECUTE 'ALTER TABLE public.reportes DROP CONSTRAINT IF EXISTS estado_check';
        EXECUTE 'ALTER TABLE public.reportes DROP CONSTRAINT IF EXISTS check_estado';
        RAISE NOTICE 'Constraints de estado eliminados';
    END IF;
END $$;

-- Verificar valores actuales en la columna estado
SELECT DISTINCT estado FROM public.reportes;

-- Crear el constraint correcto
ALTER TABLE public.reportes ADD CONSTRAINT reportes_estado_check 
CHECK (estado IN ('generando', 'completado', 'error', 'pendiente'));

-- Verificar que el constraint se creó correctamente
SELECT 
    constraint_name,
    constraint_type,
    check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'reportes' 
AND tc.table_schema = 'public'
AND constraint_type = 'CHECK';

-- Probar insertar un registro de prueba para verificar que funciona
INSERT INTO public.reportes (tipo, descripcion, estado, usuario_id, filtros_aplicados) 
VALUES (
    'test', 
    'Test de inserción', 
    'generando', 
    (SELECT id FROM public.users LIMIT 1),
    '{}'::jsonb
);

-- Eliminar el registro de prueba
DELETE FROM public.reportes WHERE tipo = 'test' AND descripcion = 'Test de inserción';
