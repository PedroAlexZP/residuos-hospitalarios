-- Datos de ejemplo para incidencias
-- Ejecutar en Supabase SQL Editor

-- Insertar algunos usuarios de ejemplo si no existen
INSERT INTO users (id, email, nombre_completo, departamento, rol, activo) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@hospital.com', 'Dr. Carlos Administrador', 'Administración', 'admin', true),
('550e8400-e29b-41d4-a716-446655440001', 'supervisor@hospital.com', 'Dra. Ana Supervisora', 'Gerencia', 'supervisor', true),
('550e8400-e29b-41d4-a716-446655440002', 'enfermera@hospital.com', 'Enfermera María González', 'Enfermería', 'generador', true),
('550e8400-e29b-41d4-a716-446655440003', 'doctor@hospital.com', 'Dr. Luis Pérez', 'Cirugía', 'generador', true)
ON CONFLICT (id) DO NOTHING;

-- Insertar algunos residuos de ejemplo si no existen
INSERT INTO residuos (id, tipo, cantidad, ubicacion, fecha_generacion, estado) VALUES
('660e8400-e29b-41d4-a716-446655440000', 'anatomopatologico', 5.5, 'Sala de Cirugía 1', '2024-01-15 08:30:00', 'generado'),
('660e8400-e29b-41d4-a716-446655440001', 'cortopunzante', 2.1, 'Laboratorio Central', '2024-01-16 14:20:00', 'generado'),
('660e8400-e29b-41d4-a716-446655440002', 'farmaceutico', 1.8, 'Farmacia', '2024-01-17 10:15:00', 'generado'),
('660e8400-e29b-41d4-a716-446655440003', 'quimioterapico', 3.2, 'Oncología', '2024-01-18 16:45:00', 'generado')
ON CONFLICT (id) DO NOTHING;

-- Insertar incidencias de ejemplo
INSERT INTO incidencias (id, tipo, descripcion, urgencia, estado, fecha, usuario_id, residuo_id) VALUES
(
  '770e8400-e29b-41d4-a716-446655440000',
  'contaminacion_cruzada',
  'Se detectó contaminación cruzada en el contenedor de residuos anatomopatológicos. Algunos residuos farmacéuticos fueron depositados incorrectamente en el contenedor rojo destinado a material anatomopatológico. Es necesario revisar los protocolos de separación.',
  'alta',
  'abierta',
  '2024-01-20 09:15:00',
  '550e8400-e29b-41d4-a716-446655440002',
  '660e8400-e29b-41d4-a716-446655440000'
),
(
  '770e8400-e29b-41d4-a716-446655440001',
  'derrame',
  'Derrame de líquidos en el área de recolección de residuos cortopunzantes. Aproximadamente 200ml de fluidos biológicos se derramaron durante el traslado. Se realizó limpieza inmediata pero se requiere inspección del contenedor.',
  'critica',
  'en_proceso',
  '2024-01-19 15:30:00',
  '550e8400-e29b-41d4-a716-446655440003',
  '660e8400-e29b-41d4-a716-446655440001'
),
(
  '770e8400-e29b-41d4-a716-446655440002',
  'contenedor_danado',
  'El contenedor amarillo para residuos farmacéuticos presenta una grieta en la parte inferior que podría comprometer la seguridad. Se solicita reemplazo inmediato antes de la próxima recolección.',
  'media',
  'resuelta',
  '2024-01-18 11:45:00',
  '550e8400-e29b-41d4-a716-446655440002',
  '660e8400-e29b-41d4-a716-446655440002'
),
(
  '770e8400-e29b-41d4-a716-446655440003',
  'recoleccion_tardía',
  'La recolección programada para las 14:00 hrs del área de Oncología no se realizó. Los contenedores están llegando al 90% de su capacidad y es necesario recolección urgente.',
  'alta',
  'abierta',
  '2024-01-21 16:00:00',
  '550e8400-e29b-41d4-a716-446655440001',
  '660e8400-e29b-41d4-a716-446655440003'
),
(
  '770e8400-e29b-41d4-a716-446655440004',
  'clasificacion_incorrecta',
  'Personal de limpieza depositó residuos comunes en contenedor de residuos peligrosos. Se requiere capacitación adicional sobre clasificación de residuos.',
  'baja',
  'cerrada',
  '2024-01-17 08:20:00',
  '550e8400-e29b-41d4-a716-446655440000',
  NULL
),
(
  '770e8400-e29b-41d4-a716-446655440005',
  'exceso_capacidad',
  'Contenedor de residuos anatomopatológicos superó su capacidad máxima en el turno nocturno. Se requiere ajuste en la frecuencia de recolección para este tipo de residuos.',
  'media',
  'en_proceso',
  '2024-01-22 02:30:00',
  '550e8400-e29b-41d4-a716-446655440002',
  '660e8400-e29b-41d4-a716-446655440000'
)
ON CONFLICT (id) DO NOTHING;

-- Verificar los datos insertados
SELECT 
  i.id,
  i.tipo,
  i.urgencia,
  i.estado,
  u.nombre_completo as usuario,
  r.tipo as tipo_residuo
FROM incidencias i
LEFT JOIN users u ON i.usuario_id = u.id
LEFT JOIN residuos r ON i.residuo_id = r.id
ORDER BY i.fecha DESC;
