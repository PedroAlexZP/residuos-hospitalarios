-- Script para corregir problemas de acceso a usuarios
-- Ejecutar en Supabase SQL Editor

-- 1. Función para obtener todos los usuarios (SECURITY DEFINER bypass RLS)
CREATE OR REPLACE FUNCTION get_all_users_public()
RETURNS TABLE (
  id uuid,
  nombre_completo text,
  email text,
  rol text,
  departamento text,
  activo boolean,
  created_at timestamptz
)
SECURITY DEFINER
LANGUAGE sql
AS $$
  SELECT 
    u.id,
    u.nombre_completo,
    u.email,
    u.rol,
    u.departamento,
    u.activo,
    u.created_at
  FROM users u
  WHERE u.activo = true
  ORDER BY u.nombre_completo;
$$;

-- 2. Función para obtener residuos con información de usuario
CREATE OR REPLACE FUNCTION get_residuos_with_users()
RETURNS TABLE (
  id uuid,
  tipo text,
  cantidad numeric,
  ubicacion text,
  estado text,
  fecha_generacion timestamptz,
  usuario_id uuid,
  usuario_nombre text,
  usuario_departamento text,
  created_at timestamptz
)
SECURITY DEFINER
LANGUAGE sql
AS $$
  SELECT 
    r.id,
    r.tipo,
    r.cantidad,
    r.ubicacion,
    r.estado,
    r.fecha_generacion,
    r.usuario_id,
    u.nombre_completo as usuario_nombre,
    u.departamento as usuario_departamento,
    r.created_at
  FROM residuos r
  LEFT JOIN users u ON r.usuario_id = u.id
  ORDER BY r.created_at DESC;
$$;

-- 3. Función para obtener capacitaciones con responsables
CREATE OR REPLACE FUNCTION get_capacitaciones_with_responsables()
RETURNS TABLE (
  id uuid,
  tema text,
  fecha timestamptz,
  descripcion text,
  material_pdf text,
  responsable_id uuid,
  responsable_nombre text,
  responsable_departamento text,
  created_at timestamptz
)
SECURITY DEFINER
LANGUAGE sql
AS $$
  SELECT 
    c.id,
    c.tema,
    c.fecha,
    c.descripcion,
    c.material_pdf,
    c.responsable_id,
    u.nombre_completo as responsable_nombre,
    u.departamento as responsable_departamento,
    c.created_at
  FROM capacitaciones c
  LEFT JOIN users u ON c.responsable_id = u.id
  ORDER BY c.fecha DESC;
$$;

-- 4. Función para obtener entregas con usuarios
CREATE OR REPLACE FUNCTION get_entregas_with_users()
RETURNS TABLE (
  id uuid,
  fecha_hora timestamptz,
  certificado_pdf text,
  estado text,
  numero_seguimiento text,
  usuario_id uuid,
  usuario_nombre text,
  usuario_departamento text,
  gestor_externo_id uuid
)
SECURITY DEFINER
LANGUAGE sql
AS $$
  SELECT 
    e.id,
    e.fecha_hora,
    e.certificado_pdf,
    e.estado,
    e.numero_seguimiento,
    e.usuario_id,
    u.nombre_completo as usuario_nombre,
    u.departamento as usuario_departamento,
    e.gestor_externo_id
  FROM entregas e
  LEFT JOIN users u ON e.usuario_id = u.id
  ORDER BY e.fecha_hora DESC;
$$;

-- 5. Dar permisos públicos a estas funciones
GRANT EXECUTE ON FUNCTION get_all_users_public() TO authenticated;
GRANT EXECUTE ON FUNCTION get_residuos_with_users() TO authenticated;
GRANT EXECUTE ON FUNCTION get_capacitaciones_with_responsables() TO authenticated;
GRANT EXECUTE ON FUNCTION get_entregas_with_users() TO authenticated;

-- 6. Verificar que las funciones funcionan
SELECT 'Users count:' as info, count(*) as count FROM get_all_users_public();
SELECT 'Residuos count:' as info, count(*) as count FROM get_residuos_with_users();
SELECT 'Capacitaciones count:' as info, count(*) as count FROM get_capacitaciones_with_responsables();
SELECT 'Entregas count:' as info, count(*) as count FROM get_entregas_with_users();
