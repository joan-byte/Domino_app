-- Agregar campo pm a la tabla campeonatos
ALTER TABLE campeonatos
ADD COLUMN IF NOT EXISTS pm INTEGER DEFAULT 300 CHECK (pm >= 0 AND pm <= 500);

-- Actualizar registros existentes
UPDATE campeonatos SET pm = 300 WHERE pm IS NULL; 