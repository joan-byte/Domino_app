-- Agregar campo gb_valor a la tabla campeonatos
ALTER TABLE campeonatos
ADD COLUMN IF NOT EXISTS gb_valor INTEGER; 