🔧 SOLUCIÓN PARA "Usuario no disponible"

El problema se debe a que las políticas RLS (Row Level Security) de Supabase están bloqueando 
los JOINs entre las tablas users y otras tablas.

📋 PASOS PARA SOLUCIONARLO:

1. **Ejecutar Script SQL en Supabase:**
   - Ve a: https://supabase.com/dashboard
   - Selecciona tu proyecto
   - Ve a "SQL Editor" 
   - Crea una nueva query
   - Copia y pega TODO el contenido del archivo "fix_users_rls.sql"
   - Ejecuta el script

2. **¿Qué hace el script?**
   - Crea 4 funciones SQL con SECURITY DEFINER que bypasean RLS
   - `get_all_users_public()` - Obtiene todos los usuarios
   - `get_residuos_with_users()` - Residuos con información de usuario
   - `get_capacitaciones_with_responsables()` - Capacitaciones con responsables
   - `get_entregas_with_users()` - Entregas con usuarios

3. **Después de ejecutar el script:**
   - Refresca las páginas web
   - Deberías ver los nombres de usuarios en lugar de "Usuario no disponible"
   - El sistema de fallbacks ya está implementado en el código

4. **¿Qué páginas se corrigen?**
   ✅ Residuos - Mostrará nombres reales de usuarios
   ✅ Capacitaciones - Mostrará responsables correctos
   ✅ Entregas - Mostrará información de usuarios
   ✅ Usuarios - Lista completa para admins
   ✅ Formularios - Listas completas de usuarios

⚠️ **IMPORTANTE:**
- Ejecuta el script COMPLETO de una vez
- Si hay errores, avísame para dividirlo en partes más pequeñas
- Las funciones usan SECURITY DEFINER para bypasear las restricciones RLS

🎯 **Resultado esperado:**
En lugar de "Usuario no disponible" verás los nombres reales de los usuarios 
en todas las páginas del sistema.
