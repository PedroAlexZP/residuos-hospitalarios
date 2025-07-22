-- Datos de ejemplo para probar la funcionalidad
-- Este archivo debe ejecutarse después de tener al menos un usuario registrado

-- Primero, vamos a insertar algunos residuos de ejemplo
-- Nota: Reemplaza los UUIDs con IDs reales de usuarios existentes en tu base de datos

-- Ejemplo de inserción (comenta/descomenta según necesites)
/*
INSERT INTO public.residuos (tipo, cantidad, ubicacion, fecha_generacion, usuario_id, estado) VALUES
('anatomopatologicos', 2.5, 'Quirófano 1', NOW() - INTERVAL '2 hours', 'TU_USER_ID_AQUI', 'generado'),
('cortopunzantes', 1.2, 'Laboratorio', NOW() - INTERVAL '1 hour', 'TU_USER_ID_AQUI', 'generado'),
('farmaceuticos', 3.8, 'Farmacia', NOW() - INTERVAL '30 minutes', 'TU_USER_ID_AQUI', 'generado'),
('citotoxicos', 0.8, 'Oncología', NOW() - INTERVAL '45 minutes', 'TU_USER_ID_AQUI', 'generado');
*/

-- Para obtener tu user ID, ejecuta:
-- SELECT id FROM auth.users WHERE email = 'tu-email@ejemplo.com';

-- O para usar el primer usuario disponible:
-- INSERT INTO public.residuos (tipo, cantidad, ubicacion, fecha_generacion, usuario_id, estado) 
-- SELECT 'anatomopatologicos', 2.5, 'Quirófano 1', NOW(), id, 'generado' 
-- FROM public.users LIMIT 1;
