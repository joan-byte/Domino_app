/**
 * Servicio para manejar el posicionamiento de elementos en las plantillas
 * Implementa posicionamiento exacto para garantizar precisión visual en formato A4 apaisado (842x595px)
 */

// Dimensiones de referencia para A4 apaisado
const ANCHO_A4 = 842; // px
const ALTO_A4 = 595;  // px
const MITAD_ANCHO = ANCHO_A4 / 2; // 421px - mitad de la página para diferenciar lados

// Función para obtener la posición personalizada del logo desde localStorage
const obtenerPosicionPersonalizadaLogo = (lado) => {
  try {
    const posGuardada = localStorage.getItem(`logo_posicion_${lado}`);
    if (posGuardada) {
      return JSON.parse(posGuardada);
    }
  } catch (e) {
    console.error(`Error al obtener posición personalizada para ${lado}:`, e);
  }
  
  // Valores predeterminados si no hay guardados - ajustados para A4 apaisado
  return lado === 'izquierda' 
    ? { top: 30, left: 60, width: 100, height: 60 } 
    : { top: 30, left: MITAD_ANCHO + 30, width: 100, height: 60 }; // 451px desde izquierda
};

// Obtener estilo para el elemento según la posición
const obtenerEstiloPosicionTexto = (tipo, index, lado, escala = 1) => {
  // Para los logos, usar posiciones personalizadas desde localStorage
  if (tipo === 'logo' || tipo === 'logoCampeonato') {
    const posicion = obtenerPosicionPersonalizadaLogo(lado);
    
    // Devolver posición exacta en píxeles
    return {
      position: 'absolute',
      top: `${posicion.top}px`,
      left: `${posicion.left}px`,
      width: `${posicion.width}px`,
      height: `${posicion.height}px`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10
    };
  }
  
  // Para la imagen del logo (dentro del contenedor)
  if (tipo === 'logoImagen') {
    // Calcular escala porcentual entre 50% y 100%
    const escalaAjustada = Math.max(0.5, Math.min(1.0, escala));
    
    return {
      maxWidth: `${escalaAjustada * 100}%`,
      maxHeight: `${escalaAjustada * 100}%`,
      width: 'auto !important',
      height: 'auto !important',
      objectFit: 'contain',
      objectPosition: 'center',
      display: 'block',
      margin: 'auto',
      zIndex: 10
    };
  }
  
  // Posiciones para otros elementos - valores exactos ajustados para A4 apaisado
  const posicionesElementos = {
    nombreCampeonato: {
      izquierda: { top: '40px', left: `${MITAD_ANCHO/2}px` },          // Centro del lado izquierdo
      derecha: { top: '40px', left: `${MITAD_ANCHO + MITAD_ANCHO/2}px` } // Centro del lado derecho
    },
    mesaNumero: {
      izquierda: { top: '90px', left: `${MITAD_ANCHO/3}px` },          // Tercio izquierdo
      derecha: { top: '90px', left: `${MITAD_ANCHO + MITAD_ANCHO/3}px` } // Tercio derecho
    },
    partidaNumero: {
      izquierda: { top: '90px', left: `${(MITAD_ANCHO/3) * 2}px` },     // Dos tercios izquierdo
      derecha: { top: '90px', left: `${MITAD_ANCHO + (MITAD_ANCHO/3) * 2}px` } // Dos tercios derecho
    }
  };
  
  // Devolver posición del elemento si existe
  if (posicionesElementos[tipo] && posicionesElementos[tipo][lado]) {
    return {
      position: 'absolute',
      ...posicionesElementos[tipo][lado],
      textAlign: 'center',
      zIndex: 20
    };
  }
  
  // Posición genérica si no hay configuración específica
  return {
    position: 'absolute',
    top: '15px',
    left: lado === 'derecha' ? `${MITAD_ANCHO + 50}px` : '150px',
    zIndex: 20
  };
};

// Convertir un objeto de estilo a texto CSS
const convertirEstiloATexto = (estilo) => {
  return Object.entries(estilo)
    .map(([propiedad, valor]) => `${propiedad}: ${valor}`)
    .join('; ');
};

// Actualizar configuraciones inmediatamente
const actualizarConfiguraciones = () => {
  // Forzar actualización de localStorage en tiempo real
  console.log('Configuraciones de logo actualizadas');
};

/**
 * Obtiene los estilos CSS necesarios para posicionar el logo del campeonato
 * @param {string} lado - 'izquierda' o 'derecha'
 * @returns {Object} Objeto con propiedades CSS
 */
function obtenerEstiloPosicionLogo(lado) {
  try {
    // Intentar obtener la posición personalizada
    const posicionGuardada = obtenerPosicionPersonalizadaLogo(lado);
    
    if (posicionGuardada) {
      // Usar posiciones exactas en píxeles
      return {
        'top': `${posicionGuardada.top}px`,
        'left': `${posicionGuardada.left}px`,
        'width': `${posicionGuardada.width}px`,
        'height': `${posicionGuardada.height}px`,
        'z-index': '50'
      };
    }
    
    // Valores por defecto en caso de que no haya posición guardada
    if (lado === 'izquierda') {
      return {
        'top': '30px',
        'left': '60px',
        'width': '100px',
        'height': '60px',
        'z-index': '50'
      };
    } else {
      // Para el lado derecho, valor por defecto actualizado
      return {
        'top': '30px',
        'left': '451px', // MITAD_ANCHO + 30, equivalente a 421 + 30
        'width': '100px',
        'height': '60px',
        'z-index': '50'
      };
    }
  } catch (error) {
    console.error('Error al obtener estilo para el logo:', error);
    // Valores de respaldo en caso de error
    return lado === 'izquierda' ? 
      { 'top': '30px', 'left': '60px', 'width': '100px', 'height': '60px', 'z-index': '50' } : 
      { 'top': '30px', 'left': '451px', 'width': '100px', 'height': '60px', 'z-index': '50' };
  }
}

/**
 * Guarda la posición personalizada del logo en localStorage
 * @param {string} lado - 'izquierda' o 'derecha'
 * @param {Object} posicion - Objeto con propiedades top, left, width, height
 * @returns {boolean} - true si se guardó correctamente, false en caso contrario
 */
const guardarPosicionPersonalizadaLogo = (lado, posicion) => {
  try {
    // Validar parámetros
    if (!lado || !posicion) {
      console.error('Se requiere lado y posición para guardar');
      return false;
    }
    
    // Validar propiedades requeridas en la posición
    const propiedadesRequeridas = ['top', 'left', 'width', 'height'];
    const todasLasPropiedades = propiedadesRequeridas.every(prop => 
      posicion.hasOwnProperty(prop) && posicion[prop] !== undefined
    );
    
    if (!todasLasPropiedades) {
      console.error('La posición debe incluir todas las propiedades: top, left, width, height');
      return false;
    }
    
    // Guardar en localStorage
    localStorage.setItem(`logo_posicion_${lado}`, JSON.stringify(posicion));
    console.log(`Posición del logo para ${lado} guardada:`, posicion);
    
    // Actualizar configuraciones
    actualizarConfiguraciones();
    
    return true;
  } catch (error) {
    console.error('Error al guardar posición personalizada:', error);
    return false;
  }
};

// Exportar las funciones y objetos
export default {
  obtenerEstiloPosicionTexto,
  convertirEstiloATexto,
  obtenerPosicionPersonalizadaLogo,
  guardarPosicionPersonalizadaLogo,
  actualizarConfiguraciones,
  obtenerEstiloPosicionLogo
}; 