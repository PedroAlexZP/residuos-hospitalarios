-- Debug script para verificar políticas RLS y datos de usuarios

-- 1. Verificar si RLS está habilitado en la tabla users
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- 2. Listar todas las políticas en la tabla users
SELECT 
    pol.policyname,
    pol.permissive,
    pol.roles,
    pol.cmd,
    pol.qual,
    pol.with_check
FROM pg_policy pol
JOIN pg_class pc ON pol.polrelid = pc.oid
JOIN pg_namespace pn ON pc.relnamespace = pn.oid
WHERE pc.relname = 'users' AND pn.nspname = 'public';

-- 3. Contar usuarios en la tabla
SELECT COUNT(*) as total_users FROM public.users;

-- 4. Mostrar algunos usuarios de ejemplo (sin datos sensibles)
SELECT 
    id,
    nombre_completo,
    rol,
    departamento,
    activo,
    created_at
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Verificar usuarios por rol
SELECT rol, COUNT(*) as cantidad 
FROM public.users 
GROUP BY rol 
ORDER BY cantidad DESC;

-- 6. Función temporal para verificar acceso con diferentes roles
-- Esta función puede ejecutarse para testing
CREATE OR REPLACE FUNCTION debug_user_access()
RETURNS TABLE(
    user_id UUID,
    nombre TEXT,
    rol TEXT,
    can_see_others BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.nombre_completo,
        u.rol,
        CASE 
            WHEN u.rol IN ('admin', 'supervisor') THEN true
            ELSE false
        END as can_see_others
    FROM public.users u
    WHERE u.activo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Para ejecutar el debug:
-- SELECT * FROM debug_user_access();
