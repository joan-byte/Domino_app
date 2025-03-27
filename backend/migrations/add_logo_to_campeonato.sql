-- Agregar campo logo a la tabla campeonatos
ALTER TABLE campeonatos
ADD COLUMN logo VARCHAR DEFAULT NULL;

-- Comentario para la columna
COMMENT ON COLUMN campeonatos.logo IS 'URL o path a la imagen del logo del campeonato'; 