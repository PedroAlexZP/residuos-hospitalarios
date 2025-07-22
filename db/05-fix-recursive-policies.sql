-- Fix infinite recursion in RLS policies

-- First, disable RLS on users table to clean up
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- Allow authenticated users to insert their own profile during signup
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create a separate table for admin roles to avoid recursion
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy for admin_users table
CREATE POLICY "admin_users_select" ON public.admin_users
  FOR SELECT TO authenticated
  USING (true);

-- Insert initial admin (you'll need to update this with actual admin user ID)
-- This will be done after user registration

-- Now fix other tables to use the admin_users table instead of checking users.rol

-- Fix residuos policies
DROP POLICY IF EXISTS "Users can view residuos based on role" ON public.residuos;
DROP POLICY IF EXISTS "Generadores can create residuos" ON public.residuos;
DROP POLICY IF EXISTS "Users can update own residuos or supervisors can update all" ON public.residuos;

CREATE POLICY "residuos_select" ON public.residuos
  FOR SELECT TO authenticated
  USING (
    usuario_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "residuos_insert" ON public.residuos
  FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "residuos_update" ON public.residuos
  FOR UPDATE TO authenticated
  USING (
    usuario_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  )
  WITH CHECK (
    usuario_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- Fix etiquetas policies
DROP POLICY IF EXISTS "Users can view etiquetas based on residuo access" ON public.etiquetas;
DROP POLICY IF EXISTS "Users can create etiquetas for accessible residuos" ON public.etiquetas;
DROP POLICY IF EXISTS "Users can update etiquetas for accessible residuos" ON public.etiquetas;

CREATE POLICY "etiquetas_select" ON public.etiquetas
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.residuos r 
      WHERE r.id = residuo_id 
      AND (r.usuario_id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
    )
  );

CREATE POLICY "etiquetas_insert" ON public.etiquetas
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.residuos r 
      WHERE r.id = residuo_id 
      AND (r.usuario_id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
    )
  );

CREATE POLICY "etiquetas_update" ON public.etiquetas
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.residuos r 
      WHERE r.id = residuo_id 
      AND (r.usuario_id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
    )
  );

-- Fix incidencias policies
DROP POLICY IF EXISTS "Users can view own incidencias or all if supervisor/admin" ON public.incidencias;
DROP POLICY IF EXISTS "All users can create incidencias" ON public.incidencias;
DROP POLICY IF EXISTS "Users can update own incidencias or supervisors can update all" ON public.incidencias;

CREATE POLICY "incidencias_select" ON public.incidencias
  FOR SELECT TO authenticated
  USING (
    usuario_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "incidencias_insert" ON public.incidencias
  FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "incidencias_update" ON public.incidencias
  FOR UPDATE TO authenticated
  USING (
    usuario_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- Fix pesajes policies
DROP POLICY IF EXISTS "Users can view pesajes based on role" ON public.pesajes;
DROP POLICY IF EXISTS "Authorized users can create pesajes" ON public.pesajes;

CREATE POLICY "pesajes_select" ON public.pesajes
  FOR SELECT TO authenticated
  USING (
    responsable_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "pesajes_insert" ON public.pesajes
  FOR INSERT TO authenticated
  WITH CHECK (responsable_id = auth.uid());

-- Fix entregas policies
DROP POLICY IF EXISTS "Users can view entregas based on role" ON public.entregas;
DROP POLICY IF EXISTS "Authorized users can create entregas" ON public.entregas;
DROP POLICY IF EXISTS "Users can update own entregas or supervisors can update all" ON public.entregas;

CREATE POLICY "entregas_select" ON public.entregas
  FOR SELECT TO authenticated
  USING (
    usuario_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "entregas_insert" ON public.entregas
  FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "entregas_update" ON public.entregas
  FOR UPDATE TO authenticated
  USING (
    usuario_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- Fix entrega_residuos policies
DROP POLICY IF EXISTS "Users can view entrega_residuos based on entrega access" ON public.entrega_residuos;
DROP POLICY IF EXISTS "Users can create entrega_residuos for accessible entregas" ON public.entrega_residuos;

CREATE POLICY "entrega_residuos_select" ON public.entrega_residuos
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.entregas e 
      WHERE e.id = entrega_id 
      AND (e.usuario_id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
    )
  );

CREATE POLICY "entrega_residuos_insert" ON public.entrega_residuos
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.entregas e 
      WHERE e.id = entrega_id 
      AND (e.usuario_id = auth.uid() OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
    )
  );

-- Fix reportes policies
DROP POLICY IF EXISTS "Users can view own reportes or all if supervisor/admin" ON public.reportes;
DROP POLICY IF EXISTS "Authorized users can create reportes" ON public.reportes;

CREATE POLICY "reportes_select" ON public.reportes
  FOR SELECT TO authenticated
  USING (
    usuario_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "reportes_insert" ON public.reportes
  FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());

-- Fix capacitaciones policies
DROP POLICY IF EXISTS "All users can view capacitaciones" ON public.capacitaciones;
DROP POLICY IF EXISTS "Authorized users can create capacitaciones" ON public.capacitaciones;
DROP POLICY IF EXISTS "Responsables can update own capacitaciones or admins can update all" ON public.capacitaciones;

CREATE POLICY "capacitaciones_select" ON public.capacitaciones
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "capacitaciones_insert" ON public.capacitaciones
  FOR INSERT TO authenticated
  WITH CHECK (responsable_id = auth.uid());

CREATE POLICY "capacitaciones_update" ON public.capacitaciones
  FOR UPDATE TO authenticated
  USING (
    responsable_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- Fix capacitacion_participantes policies
DROP POLICY IF EXISTS "Users can view own participaciones or all if supervisor/admin" ON public.capacitacion_participantes;
DROP POLICY IF EXISTS "Authorized users can manage participaciones" ON public.capacitacion_participantes;

CREATE POLICY "capacitacion_participantes_select" ON public.capacitacion_participantes
  FOR SELECT TO authenticated
  USING (
    usuario_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "capacitacion_participantes_insert" ON public.capacitacion_participantes
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "capacitacion_participantes_update" ON public.capacitacion_participantes
  FOR UPDATE TO authenticated
  USING (
    usuario_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- Fix gestores_externos policies
DROP POLICY IF EXISTS "All authenticated users can view gestores_externos" ON public.gestores_externos;
DROP POLICY IF EXISTS "Only admins can manage gestores_externos" ON public.gestores_externos;

CREATE POLICY "gestores_externos_select" ON public.gestores_externos
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "gestores_externos_manage" ON public.gestores_externos
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Fix normativas policies
DROP POLICY IF EXISTS "All authenticated users can view normativas" ON public.normativas;
DROP POLICY IF EXISTS "Only admins can manage normativas" ON public.normativas;

CREATE POLICY "normativas_select" ON public.normativas
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "normativas_manage" ON public.normativas
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Fix permisos policies
DROP POLICY IF EXISTS "Only admins can manage permisos" ON public.permisos;

CREATE POLICY "permisos_manage" ON public.permisos
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Drop the function that might cause recursion
DROP FUNCTION IF EXISTS can_access_residuo(UUID, UUID);
