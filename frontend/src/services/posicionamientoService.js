/**
 * Servicio para gestionar el posicionamiento de elementos en la plantilla de impresión.
 * Este servicio centraliza la lógica de posicionamiento que antes estaba en App.vue.
 */

/**
 * Obtiene los estilos de posición para un elemento en la plantilla de impresión.
 * @param {string} tipo - Tipo de elemento (nombreCampeonato, logoCampeonato, etc.)
 * @param {number} indice - Índice de la mesa
 * @param {string} lado - Lado de la plantilla ('izquierda' o 'derecha')
 * @returns {Object} - Objeto con propiedades CSS para el posicionamiento
 */
const obtenerEstiloPosicionTexto = (tipo, indice, lado) => {
  // Mapeo de posiciones para los diferentes elementos de texto
  // Estas posiciones están calibradas para una imagen A4 en modo paisaje (297mm x 210mm)
  const posiciones = {
    // Para el nombre del campeonato
    nombreCampeonato: {
      izquierda: { top: '158px', left: '450px', width: '140px', textAlign: 'center', fontSize: '12pt' },
      derecha: { top: '158px', left: '1120px', width: '140px', textAlign: 'center', fontSize: '12pt' }
    },
    // Para el logo del campeonato (si existe)
    logoCampeonato: {
      izquierda: { position: 'absolute', top: '180px', left: '230px', width: '50px', height: '50px', padding: '0', margin: '0' },
      derecha: { position: 'absolute', top: '180px', left: '900px', width: '50px', height: '50px', padding: '0', margin: '0' }
    },
    // Para el número de mesa
    mesaNumero: {
      izquierda: { top: '135px', left: '390px', width: '40px', textAlign: 'center' },
      derecha: { top: '135px', left: '1070px', width: '40px', textAlign: 'center' }
    },
    // Para el número de partida
    partidaNumero: {
      izquierda: { top: '135px', left: '560px', width: '40px', textAlign: 'center' },
      derecha: { top: '135px', left: '1240px', width: '40px', textAlign: 'center' }
    },
    // Para la posición de la pareja izquierda
    posicion: {
      izquierda: { top: '213px', left: '81px', width: '25px', textAlign: 'center' },
      derecha: { top: '213px', left: '760px', width: '25px', textAlign: 'center' }
    },
    // Para las partidas ganadas de la pareja izquierda
    pg: {
      izquierda: { top: '213px', left: '155px', width: '25px', textAlign: 'center' },
      derecha: { top: '213px', left: '835px', width: '25px', textAlign: 'center' }
    },
    // Para la diferencia de la pareja izquierda
    diferencia: {
      izquierda: { top: '213px', left: '228px', width: '40px', textAlign: 'center' },
      derecha: { top: '213px', left: '908px', width: '40px', textAlign: 'center' }
    },
    // Para la posición de la pareja derecha
    posicionOponente: {
      izquierda: { top: '213px', left: '410px', width: '25px', textAlign: 'center' },
      derecha: { top: '213px', left: '1090px', width: '25px', textAlign: 'center' }
    },
    // Para las partidas ganadas de la pareja derecha
    pgOponente: {
      izquierda: { top: '213px', left: '485px', width: '25px', textAlign: 'center' },
      derecha: { top: '213px', left: '1165px', width: '25px', textAlign: 'center' }
    },
    // Para la diferencia de la pareja derecha
    diferenciaOponente: {
      izquierda: { top: '213px', left: '560px', width: '40px', textAlign: 'center' },
      derecha: { top: '213px', left: '1240px', width: '40px', textAlign: 'center' }
    }
  };

  // Caso especial para el logo - obsoleto, ahora usa el objeto posiciones
  // if (tipo === 'logoCampeonato') {
  //   if (lado === 'izquierda') {
  //     return { position: 'absolute', top: '140px', left: '373px', width: '25px', height: '25px', padding: '0', margin: '0' };
  //   } else {
  //     return { position: 'absolute', top: '140px', left: '1050px', width: '25px', height: '25px', padding: '0', margin: '0' };
  //   }
  // }

  // Retornar el estilo CSS con la posición para los demás casos
  return posiciones[tipo]?.[lado] || {};
};

/**
 * Convierte un objeto de estilo a texto CSS
 * @param {Object} estiloObj - Objeto con propiedades CSS
 * @returns {String} Cadena de texto con estilos CSS
 */
const convertirEstiloATexto = (estiloObj) => {
  if (!estiloObj || typeof estiloObj !== 'object') return '';
  
  return Object.entries(estiloObj)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
};

export default {
  obtenerEstiloPosicionTexto,
  convertirEstiloATexto
}; 