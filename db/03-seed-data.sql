-- Datos iniciales del sistema

-- Insertar permisos por rol
INSERT INTO public.permisos (rol, modulo, lectura, escritura, eliminacion) VALUES
-- Generador
('generador', 'residuos', true, true, false),
('generador', 'etiquetas', true, true, false),
('generador', 'incidencias', true, true, false),
('generador', 'capacitaciones', true, false, false),
('generador', 'normativas', true, false, false),

-- Supervisor
('supervisor', 'residuos', true, true, true),
('supervisor', 'etiquetas', true, true, true),
('supervisor', 'pesajes', true, true, false),
('supervisor', 'entregas', true, true, false),
('supervisor', 'incidencias', true, true, true),
('supervisor', 'reportes', true, true, false),
('supervisor', 'capacitaciones', true, true, true),
('supervisor', 'normativas', true, true, false),

-- Transportista
('transportista', 'residuos', true, false, false),
('transportista', 'pesajes', true, true, false),
('transportista', 'entregas', true, true, false),
('transportista', 'incidencias', true, true, false),

-- Gestor externo
('gestor_externo', 'entregas', true, true, false),
('gestor_externo', 'reportes', true, false, false),
('gestor_externo', 'incidencias', true, true, false),

-- Admin
('admin', 'usuarios', true, true, true),
('admin', 'residuos', true, true, true),
('admin', 'etiquetas', true, true, true),
('admin', 'pesajes', true, true, true),
('admin', 'entregas', true, true, true),
('admin', 'incidencias', true, true, true),
('admin', 'reportes', true, true, true),
('admin', 'capacitaciones', true, true, true),
('admin', 'normativas', true, true, true),
('admin', 'permisos', true, true, true);

-- Insertar gestores externos de ejemplo
INSERT INTO public.gestores_externos (nombre, licencia, contacto) VALUES
('EcoMedical S.A.', 'LIC-001-2024', 'contacto@ecomedical.com'),
('Residuos Hospitalarios Ltda.', 'LIC-002-2024', 'info@residuoshospitalarios.com'),
('BioWaste Solutions', 'LIC-003-2024', 'ventas@biowaste.com');

-- Insertar normativas básicas
INSERT INTO public.normativas (titulo, fecha_publicacion, categoria) VALUES
('Decreto 2676 de 2000 - Gestión integral de residuos hospitalarios', '2000-12-22', 'Normativa Nacional'),
('Resolución 1164 de 2002 - Manual de procedimientos', '2002-09-06', 'Procedimientos'),
('NTC 3969 - Clasificación de residuos peligrosos', '2019-03-15', 'Técnica'),
('ISO 14001 - Sistemas de gestión ambiental', '2015-09-15', 'Internacional');

-- Insertar tipos de residuos comunes
-- Nota: Esto se manejará desde la aplicación con una lista predefinida
