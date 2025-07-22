-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Políticas corregidas para users
-- Permitir que los usuarios autenticados puedan insertar su propio perfil
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Permitir que los usuarios vean su propio perfil
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Permitir que los usuarios actualicen su propio perfil
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Permitir que los admins vean todos los usuarios
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Permitir que los admins gestionen todos los usuarios
CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Políticas para residuos (corregidas)
DROP POLICY IF EXISTS "Users can view residuos based on role" ON public.residuos;
DROP POLICY IF EXISTS "Generadores can create residuos" ON public.residuos;

CREATE POLICY "Users can view residuos based on role" ON public.residuos
  FOR SELECT USING (
    usuario_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol IN ('supervisor', 'admin')
    )
  );

CREATE POLICY "Generadores can create residuos" ON public.residuos
  FOR INSERT WITH CHECK (
    usuario_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol IN ('generador', 'admin')
    )
  );

CREATE POLICY "Users can update own residuos or supervisors can update all" ON public.residuos
  FOR UPDATE USING (
    usuario_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol IN ('supervisor', 'admin')
    )
  );

-- Políticas para etiquetas (corregidas)
DROP POLICY IF EXISTS "Users can view etiquetas based on residuo access" ON public.etiquetas;

CREATE POLICY "Users can view etiquetas based on residuo access" ON public.etiquetas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.residuos r
      WHERE r.id = residuo_id AND (
        r.usuario_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND rol IN ('supervisor', 'admin')
        )
      )
    )
  );

CREATE POLICY "Users can create etiquetas for accessible residuos" ON public.etiquetas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.residuos r
      WHERE r.id = residuo_id AND (
        r.usuario_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND rol IN ('supervisor', 'admin')
        )
      )
    )
  );

-- Políticas para pesajes
CREATE POLICY "Users can view pesajes based on role" ON public.pesajes
  FOR SELECT USING (
    responsable_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol IN ('supervisor', 'admin')
    )
  );

CREATE POLICY "Authorized users can create pesajes" ON public.pesajes
  FOR INSERT WITH CHECK (
    responsable_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol IN ('supervisor', 'transportista', 'admin')
    )
  );

-- Políticas para entregas
CREATE POLICY "Users can view entregas based on role" ON public.entregas
  FOR SELECT USING (
    usuario_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol IN ('supervisor', 'transportista', 'gestor_externo', 'admin')
    )
  );

CREATE POLICY "Authorized users can create entregas" ON public.entregas
  FOR INSERT WITH CHECK (
    usuario_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol IN ('supervisor', 'transportista', 'admin')
    )
  );

CREATE POLICY "Users can update own entregas or supervisors can update all" ON public.entregas
  FOR UPDATE USING (
    usuario_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol IN ('supervisor', 'admin')
    )
  );

-- Políticas para entrega_residuos
CREATE POLICY "Users can view entrega_residuos based on entrega access" ON public.entrega_residuos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.entregas e
      WHERE e.id = entrega_id AND (
        e.usuario_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND rol IN ('supervisor', 'transportista', 'gestor_externo', 'admin')
        )
      )
    )
  );

CREATE POLICY "Users can create entrega_residuos for accessible entregas" ON public.entrega_residuos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.entregas e
      WHERE e.id = entrega_id AND (
        e.usuario_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND rol IN ('supervisor', 'transportista', 'admin')
        )
      )
    )
  );

-- Políticas para incidencias (corregidas)
DROP POLICY IF EXISTS "Users can view own incidencias or all if supervisor/admin" ON public.incidencias;
DROP POLICY IF EXISTS "All users can create incidencias" ON public.incidencias;

CREATE POLICY "Users can view own incidencias or all if supervisor/admin" ON public.incidencias
  FOR SELECT USING (
    usuario_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol IN ('supervisor', 'admin')
    )
  );

CREATE POLICY "All users can create incidencias" ON public.incidencias
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Users can update own incidencias or supervisors can update all" ON public.incidencias
  FOR UPDATE USING (
    usuario_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol IN ('supervisor', 'admin')
    )
  );

-- Políticas para reportes
CREATE POLICY "Users can view own reportes or all if supervisor/admin" ON public.reportes
  FOR SELECT USING (
    usuario_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol IN ('supervisor', 'admin')
    )
  );

CREATE POLICY "Authorized users can create reportes" ON public.reportes
  FOR INSERT WITH CHECK (
    usuario_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol IN ('supervisor', 'admin')
    )
  );

-- Políticas para capacitaciones
CREATE POLICY "All users can view capacitaciones" ON public.capacitaciones
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authorized users can create capacitaciones" ON public.capacitaciones
  FOR INSERT WITH CHECK (
    responsable_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol IN ('supervisor', 'admin')
    )
  );

CREATE POLICY "Responsables can update own capacitaciones or admins can update all" ON public.capacitaciones
  FOR UPDATE USING (
    responsable_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Políticas para capacitacion_participantes
CREATE POLICY "Users can view own participaciones or all if supervisor/admin" ON public.capacitacion_participantes
  FOR SELECT USING (
    usuario_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol IN ('supervisor', 'admin')
    )
  );

CREATE POLICY "Authorized users can manage participaciones" ON public.capacitacion_participantes
  FOR ALL USING (
    usuario_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol IN ('supervisor', 'admin')
    )
  );

-- Políticas para gestores_externos
CREATE POLICY "All authenticated users can view gestores_externos" ON public.gestores_externos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage gestores_externos" ON public.gestores_externos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Políticas para normativas (lectura pública corregida)
DROP POLICY IF EXISTS "All authenticated users can view normativas" ON public.normativas;

CREATE POLICY "All authenticated users can view normativas" ON public.normativas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage normativas" ON public.normativas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Políticas para permisos (solo admin corregida)
DROP POLICY IF EXISTS "Only admins can manage permisos" ON public.permisos;

CREATE POLICY "Only admins can manage permisos" ON public.permisos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );
