-- Añadir columna gb a la tabla parejas
ALTER TABLE parejas ADD COLUMN gb BOOLEAN DEFAULT FALSE;

-- Actualizar las parejas existentes con gb = FALSE
UPDATE parejas SET gb = FALSE WHERE gb IS NULL; 