-- Script para corregir las políticas RLS y permitir el registro de usuarios

-- Deshabilitar RLS temporalmente para configuración inicial
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes de users
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

-- Habilitar RLS nuevamente
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Crear políticas más permisivas para el registro inicial
CREATE POLICY "Enable insert for authenticated users during signup" ON public.users
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política especial para admins
CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Asegurar que las otras tablas tengan políticas correctas
-- Política más permisiva para gestores_externos (lectura para todos los autenticados)
DROP POLICY IF EXISTS "All authenticated users can view gestores_externos" ON public.gestores_externos;
DROP POLICY IF EXISTS "Only admins can manage gestores_externos" ON public.gestores_externos;

CREATE POLICY "All authenticated users can view gestores_externos" ON public.gestores_externos
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage gestores_externos" ON public.gestores_externos
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Política más permisiva para normativas
DROP POLICY IF EXISTS "All authenticated users can view normativas" ON public.normativas;
DROP POLICY IF EXISTS "Only admins can manage normativas" ON public.normativas;

CREATE POLICY "All authenticated users can view normativas" ON public.normativas
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage normativas" ON public.normativas
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Crear función para verificar si un usuario puede acceder a un residuo
CREATE OR REPLACE FUNCTION can_access_residuo(residuo_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.residuos r
    JOIN public.users u ON u.id = user_id
    WHERE r.id = residuo_id 
    AND (r.usuario_id = user_id OR u.rol IN ('supervisor', 'admin'))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Actualizar política de etiquetas usando la función
DROP POLICY IF EXISTS "Users can view etiquetas based on residuo access" ON public.etiquetas;
DROP POLICY IF EXISTS "Users can create etiquetas for accessible residuos" ON public.etiquetas;

CREATE POLICY "Users can view etiquetas based on residuo access" ON public.etiquetas
  FOR SELECT 
  TO authenticated
  USING (can_access_residuo(residuo_id, auth.uid()));

CREATE POLICY "Users can create etiquetas for accessible residuos" ON public.etiquetas
  FOR INSERT 
  TO authenticated
  WITH CHECK (can_access_residuo(residuo_id, auth.uid()));

-- Política para permitir actualizaciones de etiquetas
CREATE POLICY "Users can update etiquetas for accessible residuos" ON public.etiquetas
  FOR UPDATE 
  TO authenticated
  USING (can_access_residuo(residuo_id, auth.uid()))
  WITH CHECK (can_access_residuo(residuo_id, auth.uid()));
