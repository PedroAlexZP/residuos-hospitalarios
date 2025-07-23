-- Verificar estructura actual de la tabla reportes
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

-- Verificar constraints
SELECT 
    constraint_name,
    constraint_type,
    check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'reportes' 
AND tc.table_schema = 'public';

-- Verificar si hay datos problemáticos en la tabla
SELECT id, tipo, descripcion, estado, usuario_id 
FROM public.reportes 
LIMIT 5;
