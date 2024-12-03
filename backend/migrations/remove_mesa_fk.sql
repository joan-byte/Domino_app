-- Eliminar la restricción de clave foránea existente
ALTER TABLE resultados DROP CONSTRAINT IF EXISTS resultados_mesa_id_fkey;

-- Asegurarnos de que mesa_id puede ser NULL
ALTER TABLE resultados ALTER COLUMN mesa_id DROP NOT NULL; 