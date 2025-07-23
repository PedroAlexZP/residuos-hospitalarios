-- Datos de prueba para la aplicación de residuos hospitalarios
-- Ejecutar en Supabase SQL Editor

-- Insertar algunos residuos de ejemplo usando el ID de un usuario existente
-- Primero obtenemos un usuario admin para usar como referencia
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Buscar un usuario admin
    SELECT id INTO admin_user_id FROM public.users WHERE rol = 'admin' LIMIT 1;
    
    -- Si encontramos un admin, insertar residuos de ejemplo
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.residuos (tipo, cantidad, ubicacion, fecha_generacion, usuario_id, estado) VALUES
        ('anatomopatologicos', 2.5, 'Quirófano 1', NOW() - INTERVAL '2 hours', admin_user_id, 'generado'),
        ('cortopunzantes', 1.2, 'Laboratorio Central', NOW() - INTERVAL '1 hour', admin_user_id, 'generado'),
        ('farmaceuticos', 3.8, 'Farmacia Principal', NOW() - INTERVAL '30 minutes', admin_user_id, 'generado'),
        ('citotoxicos', 0.8, 'Oncología', NOW() - INTERVAL '45 minutes', admin_user_id, 'generado'),
        ('patologicos', 4.2, 'Cirugía General', NOW() - INTERVAL '3 hours', admin_user_id, 'generado'),
        ('quimioterapicos', 1.5, 'Quimioterapia', NOW() - INTERVAL '90 minutes', admin_user_id, 'generado');
        
        RAISE NOTICE 'Residuos de ejemplo insertados exitosamente para el usuario: %', admin_user_id;
    ELSE
        RAISE NOTICE 'No se encontró ningún usuario admin. Primero crea un usuario admin.';
    END IF;
END $$;

-- Verificar los residuos insertados
SELECT 
    r.id,
    r.tipo,
    r.cantidad,
    r.ubicacion,
    r.fecha_generacion,
    r.estado,
    u.nombre_completo as usuario
FROM public.residuos r
JOIN public.users u ON r.usuario_id = u.id
ORDER BY r.fecha_generacion DESC;
