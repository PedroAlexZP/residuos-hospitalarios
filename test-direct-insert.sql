-- Prueba de inserción directa para diagnosticar el problema

-- Primero, verificar si hay usuarios válidos
SELECT id, nombre_completo, email FROM public.users LIMIT 3;

-- Intentar inserción directa con valores estáticos
INSERT INTO public.reportes (
    tipo, 
    descripcion, 
    fecha_generacion, 
    filtros_aplicados, 
    usuario_id, 
    archivo_url, 
    estado
) VALUES (
    'residuos_generados',
    'Test de inserción directa desde SQL',
    NOW(),
    '{}'::jsonb,
    (SELECT id FROM public.users LIMIT 1),
    NULL,
    'generando'
);

-- Verificar si la inserción funcionó
SELECT * FROM public.reportes WHERE descripcion = 'Test de inserción directa desde SQL';

-- Eliminar el registro de prueba
DELETE FROM public.reportes WHERE descripcion = 'Test de inserción directa desde SQL';
