-- Agregar política para que admins puedan ver todos los usuarios

-- Eliminar política existente si existe
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Crear nueva política para admins
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol IN ('admin', 'supervisor')
    )
  );

-- También asegurar que admins puedan actualizar estados de usuarios
DROP POLICY IF EXISTS "Admins can update user status" ON public.users;

CREATE POLICY "Admins can update user status" ON public.users
  FOR UPDATE 
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
