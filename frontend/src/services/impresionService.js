/**
 * Servicio unificado para gestionar e implementar la impresión de mesas.
 * Enfoque simplificado para evitar problemas con múltiples diálogos.
 */
import { campeonatoService, mesaService, parejaService, resultadoService } from './api';

// Inicializar controlador global en memoria
if (typeof window !== 'undefined') {
  window.__dominoPrintControl = window.__dominoPrintControl || {
    lastPrintTimestamp: 0,
    isCurrentlyPrinting: false
  };
}

/**
 * Genera HTML para la impresión de mesas
 * @param {Array} mesas - Lista de mesas a imprimir
 * @param {Object} campeonato - Datos del campeonato actual
 * @param {String} plantillaImagenUrl - URL de la imagen de plantilla
 * @param {Object} posicionesGuardadas - Posiciones guardadas para la impresión
 * @returns {String} HTML para imprimir
 */
const generarHTMLImpresion = (mesas, campeonato, plantillaImagenUrl, posicionesGuardadas) => {
  // Verificar que mesas sea un array
  const mesasArray = Array.isArray(mesas) ? mesas : [];
  
  console.log('%c 📄 Generando HTML para impresión:', 'background: #f39c12; color: white; padding: 3px; border-radius: 3px;');
  console.log('- Mesas disponibles:', mesasArray.length);
  console.log('- Posiciones guardadas:', posicionesGuardadas ? 'Sí ✅' : 'No ❌');
  
  // Hacer log detallado de las posiciones para depuración
  console.log('Posiciones que se están usando:');
  console.log('%c Título (izquierda):', 'font-weight: bold;', posicionesGuardadas?.titulo?.izquierda);
  console.log('%c Logo (izquierda):', 'font-weight: bold;', posicionesGuardadas?.logo?.izquierda);
  console.log('%c Mesa (izquierda):', 'font-weight: bold;', posicionesGuardadas?.mesa?.izquierda);
  console.log('%c Partida (izquierda):', 'font-weight: bold;', posicionesGuardadas?.partida?.izquierda);
  
  // Verificar que posicionesGuardadas sea un objeto válido
  if (!posicionesGuardadas || typeof posicionesGuardadas !== 'object') {
    console.warn('%c ⚠️ Posiciones guardadas no válidas, usando valores por defecto', 'color: orange; font-weight: bold;');
    posicionesGuardadas = {
      logo: {
        izquierda: { top: 15, left: 20, width: 120, height: 70 },
        derecha: { top: 15, left: 690, width: 120, height: 70 }
      },
      titulo: {
        izquierda: { top: 30, left: 150, width: 400, height: 40 },
        derecha: { top: 30, left: 820, width: 400, height: 40 }
      },
      mesa: {
        izquierda: { top: 79, left: 112, width: 50, height: 20 },
        derecha: { top: 79, left: 570, width: 50, height: 20 }
      },
      partida: {
        izquierda: { top: 79, left: 162, width: 50, height: 20 },
        derecha: { top: 79, left: 620, width: 50, height: 20 }
      },
      pareja1: {
        izquierda: {
          nombre: { top: 142, left: 112, width: 300, height: 20 },
          pos: { top: 142, left: 412, width: 10, height: 20 },
          pg: { top: 142, left: 442, width: 15, height: 20 },
          dif: { top: 142, left: 472, width: 20, height: 20 }
        },
        derecha: {
          nombre: { top: 142, left: 570, width: 300, height: 20 },
          pos: { top: 142, left: 870, width: 10, height: 20 },
          pg: { top: 142, left: 900, width: 15, height: 20 },
          dif: { top: 142, left: 930, width: 20, height: 20 }
        }
      },
      pareja2: {
        izquierda: {
          nombre: { top: 169, left: 112, width: 300, height: 20 },
          pos: { top: 169, left: 412, width: 10, height: 20 },
          pg: { top: 169, left: 442, width: 15, height: 20 },
          dif: { top: 169, left: 472, width: 20, height: 20 }
        },
        derecha: {
          nombre: { top: 169, left: 570, width: 300, height: 20 },
          pos: { top: 169, left: 870, width: 10, height: 20 },
          pg: { top: 169, left: 900, width: 15, height: 20 },
          dif: { top: 169, left: 930, width: 20, height: 20 }
        }
      }
    };
  }
  
  // Crear HTML para las mesas
  let contenidoHTML = '';
  
  // Estilo básico para imprimir con un enfoque simplificado
  const estiloCSS = `
    @page {
      size: A4 landscape;
      margin: 0;
    }
    
    body, html {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: white;
      width: 100%;
      height: 100%;
    }
    
    .pagina {
      position: relative;
      width: 842px;
      height: 595px;
      page-break-after: always;
      overflow: hidden;
      box-sizing: border-box;
      transform-origin: top left;
      margin: 0 auto;
    }
    
    .pagina:last-child {
      page-break-after: auto;
    }
    
    .plantilla-img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      object-fit: cover;
    }
    
    .elemento-posicionado {
      position: absolute !important;
      z-index: 10;
      box-sizing: border-box;
    }
    
    .debugLogo {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      overflow: hidden;
    }
    
    .debugLogo img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      object-position: left center;
      width: auto;
      height: auto;
      display: block;
    }
    
    .texto-mesa {
      font-weight: bold;
      font-size: 14px;
    }
    
    .debugInfo {
      position: fixed;
      top: 5px;
      left: 5px;
      background-color: #ffefef;
      padding: 10px;
      border: 1px solid red;
      z-index: 999;
      font-size: 12px;
      display: block; /* Mostrar por defecto para debugging */
    }

    .posiciones-debug {
      position: fixed;
      top: 5px;
      right: 5px;
      background-color: rgba(255, 255, 255, 0.95);
      border: 1px solid blue;
      padding: 10px;
      z-index: 999;
      font-size: 10px;
      max-height: 200px;
      overflow-y: auto;
      max-width: 300px;
    }
    
    @media print {
      body { 
        margin: 0; 
        padding: 0; 
      }
      .debugInfo,
      .posiciones-debug { 
        display: none !important; 
      }
      .pagina {
        margin: 0 auto;
      }
    }

    /* Regla CSS para los títulos de campeonato */
    .debugTitulo {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      white-space: nowrap; /* Evitar salto de línea */
      overflow: hidden;    /* Ocultar texto que sobresale */
      text-overflow: ellipsis; /* Mostrar puntos suspensivos si no cabe */
      font-weight: bold;
    }

    /* Regla CSS para los campos de mesa */
    .debugMesa {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      white-space: nowrap; /* Evitar salto de línea */
      overflow: hidden;    /* Ocultar texto que sobresale */
      text-overflow: ellipsis; /* Mostrar puntos suspensivos si no cabe */
      font-weight: bold;
      min-width: 15px !important; /* Permitir un ancho mínimo mucho menor */
    }

    /* Regla CSS para los campos de partida */
    .debugPartida {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      white-space: nowrap; /* Evitar salto de línea */
      overflow: hidden;    /* Ocultar texto que sobresale */
      text-overflow: ellipsis; /* Mostrar puntos suspensivos si no cabe */
      font-weight: bold;
      min-width: 15px !important; /* Permitir un ancho mínimo mucho menor */
    }

    /* Regla CSS para los nombres de pareja */
    .debugParejaName {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      text-align: left;
      white-space: nowrap; /* Evitar salto de línea */
      overflow: hidden;    /* Ocultar texto que sobresale */
      text-overflow: ellipsis; /* Mostrar puntos suspensivos si no cabe */
      font-weight: bold;
      font-size: 12px; /* Tamaño base inicial más pequeño */
    }

    /* Regla CSS para los elementos Pos, PG y Dif */
    .debugParejaPos, .debugParejaPg, .debugParejaDif {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      white-space: nowrap; /* Evitar salto de línea */
      overflow: hidden;    /* Ocultar texto que sobresale */
      text-overflow: ellipsis; /* Mostrar puntos suspensivos si no cabe */
      font-weight: bold;
      font-size: 12px; /* Tamaño base inicial más pequeño */
      min-width: auto !important; /* Sin restricción de ancho mínimo */
      width: auto !important; /* Permitir cualquier ancho, incluso muy estrecho */
      box-sizing: border-box !important;
    }

    /* Regla CSS específica para los elementos Pos */
    .debugParejaPos {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: bold;
      font-size: 11px !important; /* Letra ligeramente más pequeña para números de 3 dígitos */
      min-width: auto !important;
      width: auto !important;
      box-sizing: border-box !important;
      padding: 0 1px !important; /* Padding horizontal mínimo */
    }
  `;
  
  // Información de depuración (visible por defecto para debugging)
  contenidoHTML += '<div class="debugInfo">';
  contenidoHTML += '<p>Información de depuración:</p>';
  contenidoHTML += '<p>Número de mesas: ' + mesasArray.length + '</p>';
  contenidoHTML += '<p>Campeonato: ' + (campeonato ? campeonato.nombre : 'No disponible') + '</p>';
  contenidoHTML += '<p>URL plantilla: ' + (plantillaImagenUrl ? 'Disponible' : 'No disponible') + '</p>';
  contenidoHTML += '<p>Posiciones guardadas: ' + (posicionesGuardadas ? 'Sí' : 'No') + '</p>';
  contenidoHTML += '</div>';

  // Panel de depuración de posiciones
  contenidoHTML += '<div class="posiciones-debug">';
  contenidoHTML += '<h4>Posiciones aplicadas:</h4>';
  contenidoHTML += '<p>Título (izq): ' + JSON.stringify(posicionesGuardadas?.titulo?.izquierda) + '</p>';
  contenidoHTML += '<p>Mesa (izq): ' + JSON.stringify(posicionesGuardadas?.mesa?.izquierda) + '</p>';
  contenidoHTML += '<p>Partida (izq): ' + JSON.stringify(posicionesGuardadas?.partida?.izquierda) + '</p>';
  contenidoHTML += '<p>Logo (izq): ' + JSON.stringify(posicionesGuardadas?.logo?.izquierda) + '</p>';
  contenidoHTML += '</div>';
  
  // Función auxiliar para crear estilo posicionamiento exacto
  const crearEstiloPosicion = (pos) => {
    if (!pos) return '';
    let estilo = '';
    if (pos.top !== undefined) estilo += `top: ${pos.top}px !important; `;
    if (pos.left !== undefined) estilo += `left: ${pos.left}px !important; `;
    if (pos.width !== undefined) estilo += `width: ${pos.width}px !important; `;
    if (pos.height !== undefined) estilo += `height: ${pos.height}px !important; `;
    return estilo;
  };
  
  // Si no hay mesas, mostrar mensaje
  if (mesasArray.length === 0) {
    contenidoHTML += '<div class="pagina">';
    if (plantillaImagenUrl) {
      contenidoHTML += '<img src="' + plantillaImagenUrl + '" class="plantilla-img" alt="Plantilla" />';
    }
    contenidoHTML += '<div class="elemento-posicionado texto-mesa" style="top: 50px; left: 50px; color: red; font-size: 16px;">No hay mesas para imprimir o el formato de datos es incorrecto</div>';
    contenidoHTML += '</div>';
  } else {
    // Agrupar las mesas de dos en dos por página
    for (let i = 0; i < mesasArray.length; i += 2) {
      // Crear una nueva página para cada par de mesas
      contenidoHTML += '<div class="pagina">';
      
      // Una única imagen de plantilla por página
      if (plantillaImagenUrl) {
        contenidoHTML += '<img src="' + plantillaImagenUrl + '" class="plantilla-img" alt="Plantilla para mesas" />';
      }
      
      // Primera mesa (izquierda)
      const mesaIzquierda = mesasArray[i];

      // Logo del campeonato - lado izquierdo
      if (campeonato && campeonato.logo) {
        const posLogo = posicionesGuardadas?.logo?.izquierda || { top: 15, left: 20, width: 120, height: 70 };
        const estiloLogo = crearEstiloPosicion(posLogo);
        // Añadir clase para debugging
        contenidoHTML += `<div class="elemento-posicionado debugLogo" style="${estiloLogo}">
          <img src="${campeonato.logo}" style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; object-position: left center;" alt="Logo campeonato" />
        </div>`;
      }

      // Título del campeonato - lado izquierdo
      if (campeonato && campeonato.nombre) {
        const posTitulo = posicionesGuardadas?.titulo?.izquierda || { top: 30, left: 150, width: 400, height: 40 };
        const estiloTitulo = crearEstiloPosicion(posTitulo);
        // Calcular tamaño de fuente adaptativo basado en el ancho del contenedor
        const fontSize = Math.min(Math.max(posTitulo.width / (campeonato.nombre.length * 0.6), 10), 24);
        
        // Añadir clase para debugging
        contenidoHTML += `<div class="elemento-posicionado debugTitulo" style="${estiloTitulo} font-size: ${fontSize}px;">
          ${campeonato.nombre}
        </div>`;
      }
      
      // Mesa ID (izquierda)
      const posMesa = posicionesGuardadas?.mesa?.izquierda || { top: 79, left: 112, width: 50, height: 20 };
      const estiloMesa = crearEstiloPosicion(posMesa);
      // Añadir clase para debugging
      contenidoHTML += `<div class="elemento-posicionado texto-mesa debugMesa" style="${estiloMesa} font-size: 14px;" data-elemento-tipo="mesa" data-lado="izquierda" data-texto-original="${String(mesaIzquierda.id || '').replace(/"/g, '&quot;')}">
        ${mesaIzquierda.id}
      </div>`;
      
      // Partida (izquierda)
      const posPartida = posicionesGuardadas?.partida?.izquierda || { top: 79, left: 162, width: 50, height: 20 };
      const estiloPartida = crearEstiloPosicion(posPartida);
      // Añadir clase para debugging
      contenidoHTML += `<div class="elemento-posicionado texto-mesa debugPartida" style="${estiloPartida} font-size: 14px;" data-elemento-tipo="partida" data-lado="izquierda" data-texto-original="${String(campeonato.partida_actual || '1').replace(/"/g, '&quot;')}">
        ${campeonato.partida_actual || '1'}
      </div>`;
      
      // Pareja 1 de mesa izquierda
      if (mesaIzquierda.pareja1) {
        // Nombre
        const posPareja1Nombre = posicionesGuardadas?.pareja1?.izquierda?.nombre || { top: 140, left: 30, width: 180, height: 20 };
        const estiloPareja1Nombre = crearEstiloPosicion(posPareja1Nombre);
        contenidoHTML += `<div class="elemento-posicionado texto-mesa debugParejaName" style="${estiloPareja1Nombre}" data-elemento-tipo="pareja1" data-lado="izquierda" data-subtipo="nombre" data-texto-original="${String(mesaIzquierda.pareja1.nombre || '').replace(/"/g, '&quot;')}">
          ${mesaIzquierda.pareja1.nombre || ''}
        </div>`;
        
        // Posición
        const posPareja1Pos = posicionesGuardadas?.pareja1?.izquierda?.pos || { top: 140, left: 210, width: 30, height: 20 };
        const estiloPareja1Pos = crearEstiloPosicion(posPareja1Pos);
        contenidoHTML += `<div class="elemento-posicionado texto-mesa debugParejaPos" style="${estiloPareja1Pos}" data-elemento-tipo="pareja1" data-lado="izquierda" data-subtipo="pos" data-texto-original="${String(mesaIzquierda.pareja1.ranking_posicion || '').replace(/"/g, '&quot;')}">
          ${mesaIzquierda.pareja1.ranking_posicion || ''}
        </div>`;
        
        // Partidas ganadas
        const posPareja1Pg = posicionesGuardadas?.pareja1?.izquierda?.pg || { top: 140, left: 240, width: 30, height: 20 };
        const estiloPareja1Pg = crearEstiloPosicion(posPareja1Pg);
        contenidoHTML += `<div class="elemento-posicionado texto-mesa debugParejaPg" style="${estiloPareja1Pg}" data-elemento-tipo="pareja1" data-lado="izquierda" data-subtipo="pg" data-texto-original="${String(mesaIzquierda.pareja1.partidas_ganadas || '0').replace(/"/g, '&quot;')}">
          ${mesaIzquierda.pareja1.partidas_ganadas || '0'}
        </div>`;
        
        // Diferencia
        const posPareja1Dif = posicionesGuardadas?.pareja1?.izquierda?.dif || { top: 140, left: 270, width: 50, height: 20 };
        const estiloPareja1Dif = crearEstiloPosicion(posPareja1Dif);
        contenidoHTML += `<div class="elemento-posicionado texto-mesa debugParejaDif" style="${estiloPareja1Dif}" data-elemento-tipo="pareja1" data-lado="izquierda" data-subtipo="dif" data-texto-original="${String(mesaIzquierda.pareja1.diferencia || '0').replace(/"/g, '&quot;')}">
          ${mesaIzquierda.pareja1.diferencia || '0'}
        </div>`;
      }
      
      // Pareja 2 de mesa izquierda
      if (mesaIzquierda.pareja2) {
        // Nombre
        const posPareja2Nombre = posicionesGuardadas?.pareja2?.izquierda?.nombre || { top: 169, left: 30, width: 180, height: 20 };
        const estiloPareja2Nombre = crearEstiloPosicion(posPareja2Nombre);
        contenidoHTML += `<div class="elemento-posicionado texto-mesa debugParejaName" style="${estiloPareja2Nombre}" data-elemento-tipo="pareja2" data-lado="izquierda" data-subtipo="nombre" data-texto-original="${String(mesaIzquierda.pareja2.nombre || '').replace(/"/g, '&quot;')}">
          ${mesaIzquierda.pareja2.nombre || ''}
        </div>`;
        
        // Posición
        const posPareja2Pos = posicionesGuardadas?.pareja2?.izquierda?.pos || { top: 169, left: 210, width: 30, height: 20 };
        const estiloPareja2Pos = crearEstiloPosicion(posPareja2Pos);
        contenidoHTML += `<div class="elemento-posicionado texto-mesa debugParejaPos" style="${estiloPareja2Pos}" data-elemento-tipo="pareja2" data-lado="izquierda" data-subtipo="pos" data-texto-original="${String(mesaIzquierda.pareja2.ranking_posicion || '').replace(/"/g, '&quot;')}">
          ${mesaIzquierda.pareja2.ranking_posicion || ''}
        </div>`;
        
        // Partidas ganadas
        const posPareja2Pg = posicionesGuardadas?.pareja2?.izquierda?.pg || { top: 169, left: 240, width: 30, height: 20 };
        const estiloPareja2Pg = crearEstiloPosicion(posPareja2Pg);
        contenidoHTML += `<div class="elemento-posicionado texto-mesa debugParejaPg" style="${estiloPareja2Pg}" data-elemento-tipo="pareja2" data-lado="izquierda" data-subtipo="pg" data-texto-original="${String(mesaIzquierda.pareja2.partidas_ganadas || '0').replace(/"/g, '&quot;')}">
          ${mesaIzquierda.pareja2.partidas_ganadas || '0'}
        </div>`;
        
        // Diferencia
        const posPareja2Dif = posicionesGuardadas?.pareja2?.izquierda?.dif || { top: 169, left: 270, width: 50, height: 20 };
        const estiloPareja2Dif = crearEstiloPosicion(posPareja2Dif);
        contenidoHTML += `<div class="elemento-posicionado texto-mesa debugParejaDif" style="${estiloPareja2Dif}" data-elemento-tipo="pareja2" data-lado="izquierda" data-subtipo="dif" data-texto-original="${String(mesaIzquierda.pareja2.diferencia || '0').replace(/"/g, '&quot;')}">
          ${mesaIzquierda.pareja2.diferencia || '0'}
        </div>`;
      }
      
      // Segunda mesa de la página (derecha, si existe)
      if (i + 1 < mesasArray.length) {
        const mesaDerecha = mesasArray[i + 1];
        
        // Logo del campeonato - lado derecho
        if (campeonato && campeonato.logo) {
          const posLogo = posicionesGuardadas?.logo?.derecha || { top: 15, left: 690, width: 120, height: 70 };
          const estiloLogo = crearEstiloPosicion(posLogo);
          contenidoHTML += `<div class="elemento-posicionado debugLogo" style="${estiloLogo}">
            <img src="${campeonato.logo}" style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; object-position: left center;" alt="Logo campeonato" />
          </div>`;
        }
  
        // Título del campeonato - lado derecho
        if (campeonato && campeonato.nombre) {
          const posTitulo = posicionesGuardadas?.titulo?.derecha || { top: 30, left: 820, width: 400, height: 40 };
          const estiloTitulo = crearEstiloPosicion(posTitulo);
          // Calcular tamaño de fuente adaptativo basado en el ancho del contenedor
          const fontSize = Math.min(Math.max(posTitulo.width / (campeonato.nombre.length * 0.6), 10), 24);
          
          contenidoHTML += `<div class="elemento-posicionado debugTitulo" style="${estiloTitulo} font-size: ${fontSize}px;">
            ${campeonato.nombre}
          </div>`;
        }
        
        // Mesa ID (derecha)
        const posMesa = posicionesGuardadas?.mesa?.derecha || { top: 79, left: 570, width: 50, height: 20 };
        const estiloMesa = crearEstiloPosicion(posMesa);
        contenidoHTML += `<div class="elemento-posicionado texto-mesa debugMesa" style="${estiloMesa} font-size: 14px;" data-elemento-tipo="mesa" data-lado="derecha" data-texto-original="${String(mesaDerecha.id || '').replace(/"/g, '&quot;')}">
          ${mesaDerecha.id}
        </div>`;
        
        // Partida (derecha)
        const posPartida = posicionesGuardadas?.partida?.derecha || { top: 79, left: 620, width: 50, height: 20 };
        const estiloPartida = crearEstiloPosicion(posPartida);
        contenidoHTML += `<div class="elemento-posicionado texto-mesa debugPartida" style="${estiloPartida} font-size: 14px;" data-elemento-tipo="partida" data-lado="derecha" data-texto-original="${String(campeonato.partida_actual || '1').replace(/"/g, '&quot;')}">
          ${campeonato.partida_actual || '1'}
        </div>`;
        
        // Pareja 1 de mesa derecha
        if (mesaDerecha.pareja1) {
          // Nombre
          const posPareja1Nombre = posicionesGuardadas?.pareja1?.derecha?.nombre || { top: 142, left: 570, width: 300, height: 20 };
          const estiloPareja1Nombre = crearEstiloPosicion(posPareja1Nombre);
          contenidoHTML += `<div class="elemento-posicionado texto-mesa debugParejaName" style="${estiloPareja1Nombre}" data-elemento-tipo="pareja1" data-lado="derecha" data-subtipo="nombre" data-texto-original="${String(mesaDerecha.pareja1.nombre || '').replace(/"/g, '&quot;')}">
            ${mesaDerecha.pareja1.nombre || ''}
          </div>`;
          
          // Posición
          const posPareja1Pos = posicionesGuardadas?.pareja1?.derecha?.pos || { top: 142, left: 870, width: 30, height: 20 };
          const estiloPareja1Pos = crearEstiloPosicion(posPareja1Pos);
          contenidoHTML += `<div class="elemento-posicionado texto-mesa debugParejaPos" style="${estiloPareja1Pos}" data-elemento-tipo="pareja1" data-lado="derecha" data-subtipo="pos" data-texto-original="${String(mesaDerecha.pareja1.ranking_posicion || '').replace(/"/g, '&quot;')}">
            ${mesaDerecha.pareja1.ranking_posicion || ''}
          </div>`;
          
          // Partidas ganadas
          const posPareja1Pg = posicionesGuardadas?.pareja1?.derecha?.pg || { top: 142, left: 900, width: 30, height: 20 };
          const estiloPareja1Pg = crearEstiloPosicion(posPareja1Pg);
          contenidoHTML += `<div class="elemento-posicionado texto-mesa debugParejaPg" style="${estiloPareja1Pg}" data-elemento-tipo="pareja1" data-lado="derecha" data-subtipo="pg" data-texto-original="${String(mesaDerecha.pareja1.partidas_ganadas || '0').replace(/"/g, '&quot;')}">
            ${mesaDerecha.pareja1.partidas_ganadas || '0'}
          </div>`;
          
          // Diferencia
          const posPareja1Dif = posicionesGuardadas?.pareja1?.derecha?.dif || { top: 142, left: 930, width: 50, height: 20 };
          const estiloPareja1Dif = crearEstiloPosicion(posPareja1Dif);
          contenidoHTML += `<div class="elemento-posicionado texto-mesa debugParejaDif" style="${estiloPareja1Dif}" data-elemento-tipo="pareja1" data-lado="derecha" data-subtipo="dif" data-texto-original="${String(mesaDerecha.pareja1.diferencia || '0').replace(/"/g, '&quot;')}">
            ${mesaDerecha.pareja1.diferencia || '0'}
          </div>`;
        }
        
        // Pareja 2 de mesa derecha
        if (mesaDerecha.pareja2) {
          // Nombre
          const posPareja2Nombre = posicionesGuardadas?.pareja2?.derecha?.nombre || { top: 169, left: 570, width: 300, height: 20 };
          const estiloPareja2Nombre = crearEstiloPosicion(posPareja2Nombre);
          contenidoHTML += `<div class="elemento-posicionado texto-mesa debugParejaName" style="${estiloPareja2Nombre}" data-elemento-tipo="pareja2" data-lado="derecha" data-subtipo="nombre" data-texto-original="${String(mesaDerecha.pareja2.nombre || '').replace(/"/g, '&quot;')}">
            ${mesaDerecha.pareja2.nombre || ''}
          </div>`;
          
          // Posición
          const posPareja2Pos = posicionesGuardadas?.pareja2?.derecha?.pos || { top: 169, left: 870, width: 30, height: 20 };
          const estiloPareja2Pos = crearEstiloPosicion(posPareja2Pos);
          contenidoHTML += `<div class="elemento-posicionado texto-mesa debugParejaPos" style="${estiloPareja2Pos}" data-elemento-tipo="pareja2" data-lado="derecha" data-subtipo="pos" data-texto-original="${String(mesaDerecha.pareja2.ranking_posicion || '').replace(/"/g, '&quot;')}">
            ${mesaDerecha.pareja2.ranking_posicion || ''}
          </div>`;
          
          // Partidas ganadas
          const posPareja2Pg = posicionesGuardadas?.pareja2?.derecha?.pg || { top: 169, left: 900, width: 30, height: 20 };
          const estiloPareja2Pg = crearEstiloPosicion(posPareja2Pg);
          contenidoHTML += `<div class="elemento-posicionado texto-mesa debugParejaPg" style="${estiloPareja2Pg}" data-elemento-tipo="pareja2" data-lado="derecha" data-subtipo="pg" data-texto-original="${String(mesaDerecha.pareja2.partidas_ganadas || '0').replace(/"/g, '&quot;')}">
            ${mesaDerecha.pareja2.partidas_ganadas || '0'}
          </div>`;
          
          // Diferencia
          const posPareja2Dif = posicionesGuardadas?.pareja2?.derecha?.dif || { top: 169, left: 930, width: 50, height: 20 };
          const estiloPareja2Dif = crearEstiloPosicion(posPareja2Dif);
          contenidoHTML += `<div class="elemento-posicionado texto-mesa debugParejaDif" style="${estiloPareja2Dif}" data-elemento-tipo="pareja2" data-lado="derecha" data-subtipo="dif" data-texto-original="${String(mesaDerecha.pareja2.diferencia || '0').replace(/"/g, '&quot;')}">
            ${mesaDerecha.pareja2.diferencia || '0'}
          </div>`;
        }
      }
      
      contenidoHTML += '</div>'; // Fin de la página
    }
  }
  
  // Agregar estilos CSS al principio
  return `<style>${estiloCSS}</style>${contenidoHTML}`;
};

/**
 * Carga los datos necesarios para la impresión de mesas
 * @param {Object} campeonato - Referencia al objeto reactivo del campeonato
 * @param {Array} mesasParaImprimir - Referencia al array reactivo de mesas
 * @returns {Promise<number>} - Número de mesas cargadas para imprimir
 */
const cargarDatosImpresion = async (campeonato, mesasParaImprimir) => {
  try {
    // Obtener el campeonato actual si no está ya cargado
    if (!campeonato.value) {
      campeonato.value = await campeonatoService.obtenerActual();
      if (!campeonato.value) {
        console.error('No hay campeonato activo');
        return 0;
      }
    }

    // 1. Obtener las mesas y el ranking
    const [mesas, rankingData] = await Promise.all([
      mesaService.obtenerMesas(campeonato.value.id, campeonato.value.partida_actual),
      resultadoService.obtenerRanking(campeonato.value.id)
    ]);

    console.log('Mesas asignadas:', mesas);
    console.log('Datos del ranking:', rankingData);
    console.log('Número total de mesas:', mesas.length);

    // 2. Crear un mapa del ranking para búsqueda rápida por id de pareja
    const rankingMap = new Map();
    rankingData.forEach((r, index) => {
      rankingMap.set(r.pareja_id, {
        ...r,
        posicion: index + 1 // Guardamos la posición basada en el orden del ranking
      });
    });

    // 3. Crear las mesas para imprimir
    const mesasFiltradas = mesas
      .filter(mesa => mesa.pareja1_id || mesa.pareja2_id) // Filtrar mesas vacías
      .map(mesa => {
        // Obtener datos del ranking para cada pareja
        const rankingPareja1 = rankingMap.get(mesa.pareja1_id);
        const rankingPareja2 = rankingMap.get(mesa.pareja2_id);

        return {
          id: mesa.id,
          pareja1: {
            id: mesa.pareja1_id,
            nombre: rankingPareja1?.nombre || '',
            ranking_posicion: rankingPareja1?.posicion || '-',
            partidas_ganadas: rankingPareja1?.pg || 0,
            diferencia: rankingPareja1?.pp || 0
          },
          pareja2: {
            id: mesa.pareja2_id,
            nombre: rankingPareja2?.nombre || '',
            ranking_posicion: rankingPareja2?.posicion || '-',
            partidas_ganadas: rankingPareja2?.pg || 0,
            diferencia: rankingPareja2?.pp || 0
          }
        };
      })
      .sort((a, b) => Number(a.id) - Number(b.id));

    // Asignar a la variable reactiva
    mesasParaImprimir.value = mesasFiltradas;

    console.log('Mesas preparadas para imprimir:', mesasParaImprimir.value);
    console.log('Total de mesas a imprimir:', mesasParaImprimir.value.length);
    
    // Asegurarse de que haya al menos una mesa
    if (mesasParaImprimir.value.length === 0) {
      console.error('No hay mesas para imprimir');
      return 0;
    }

    // Verificar si el logo del campeonato necesita URL completa
    if (campeonato.value.logo && !campeonato.value.logo.startsWith('http')) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      campeonato.value.logo = `${baseUrl}${campeonato.value.logo.startsWith('/') ? '' : '/'}${campeonato.value.logo}`;
      console.log('URL completa del logo:', campeonato.value.logo);
    }

    return mesasParaImprimir.value.length;
  } catch (error) {
    console.error('Error al cargar datos para impresión:', error);
    return 0;
  }
};

/**
 * Ejecuta el proceso de impresión
 * @param {Object} campeonato - Datos del campeonato
 * @param {Array} mesas - Lista de mesas a imprimir
 * @param {String} plantillaUrl - URL de la imagen de plantilla
 * @returns {Promise<boolean>} - true si se imprimió correctamente, false en caso contrario
 */
const ejecutarImpresion = async (campeonato, mesas, plantillaUrl) => {
  try {
    // Asegurar que el objeto de control de impresión siempre exista
    if (typeof window !== 'undefined') {
      if (!window.__dominoPrintControl) {
        window.__dominoPrintControl = {
          isCurrentlyPrinting: false,
          lastPrintTimestamp: null
        };
      }
    }

    // Evitar múltiples impresiones concurrentes
    if (typeof window !== 'undefined' && window.__dominoPrintControl.isCurrentlyPrinting) {
      console.warn('Ya hay una impresión en curso. Por favor, espere...');
      return false;
    }
    
    // Marcar como imprimiendo
    if (typeof window !== 'undefined') {
        window.__dominoPrintControl.isCurrentlyPrinting = true;
        window.__dominoPrintControl.lastPrintTimestamp = Date.now();
      }
      
    console.log('🖨️ INICIANDO PROCESO DE IMPRESIÓN');
    console.log('- Campeonato:', campeonato?.nombre);
    console.log('- Partida actual:', campeonato?.partida_actual);
    console.log('- Mesas a imprimir:', Array.isArray(mesas) ? mesas.length : 'No es un array');
    
    // CARGA DIRECTA DE POSICIONES DE LOCALSTORAGE
    let posicionesGuardadas = null;
    
    try {
      const savedPositionsJSON = localStorage.getItem('posiciones');
      
      if (savedPositionsJSON) {
        posicionesGuardadas = JSON.parse(savedPositionsJSON);
        
        // Verificar si las posiciones tienen una estructura diferente a la esperada y corregirla
        if (posicionesGuardadas?.pareja1?.nombre?.izquierda && !posicionesGuardadas?.pareja1?.izquierda?.nombre) {
          console.log('⚠️ Estructura incorrecta detectada, corrigiendo...');
          
          // Corregir pareja1
          if (posicionesGuardadas.pareja1) {
            if (!posicionesGuardadas.pareja1.izquierda) posicionesGuardadas.pareja1.izquierda = {};
            if (!posicionesGuardadas.pareja1.derecha) posicionesGuardadas.pareja1.derecha = {};
            
            // Transferir propiedades
            ['nombre', 'pos', 'pg', 'dif'].forEach(prop => {
              if (posicionesGuardadas.pareja1[prop]?.izquierda) {
                posicionesGuardadas.pareja1.izquierda[prop] = posicionesGuardadas.pareja1[prop].izquierda;
              }
              if (posicionesGuardadas.pareja1[prop]?.derecha) {
                posicionesGuardadas.pareja1.derecha[prop] = posicionesGuardadas.pareja1[prop].derecha;
              }
            });
          }
          
          // Corregir pareja2
          if (posicionesGuardadas.pareja2) {
            if (!posicionesGuardadas.pareja2.izquierda) posicionesGuardadas.pareja2.izquierda = {};
            if (!posicionesGuardadas.pareja2.derecha) posicionesGuardadas.pareja2.derecha = {};
            
            // Transferir propiedades
            ['nombre', 'pos', 'pg', 'dif'].forEach(prop => {
              if (posicionesGuardadas.pareja2[prop]?.izquierda) {
                posicionesGuardadas.pareja2.izquierda[prop] = posicionesGuardadas.pareja2[prop].izquierda;
              }
              if (posicionesGuardadas.pareja2[prop]?.derecha) {
                posicionesGuardadas.pareja2.derecha[prop] = posicionesGuardadas.pareja2[prop].derecha;
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar posiciones desde localStorage:', error);
    }
    
    // Si no se pudieron cargar posiciones desde localStorage, usar posiciones por defecto
    if (!posicionesGuardadas) {
      posicionesGuardadas = {
        logo: {
          izquierda: { top: 15, left: 20, width: 120, height: 70 },
          derecha: { top: 15, left: 690, width: 120, height: 70 }
        },
        titulo: {
          izquierda: { top: 30, left: 150, width: 400, height: 40 },
          derecha: { top: 30, left: 820, width: 400, height: 40 }
        },
        mesa: {
          izquierda: { top: 79, left: 112, width: 50, height: 20 },
          derecha: { top: 79, left: 570, width: 50, height: 20 }
        },
        partida: {
          izquierda: { top: 79, left: 162, width: 50, height: 20 },
          derecha: { top: 79, left: 620, width: 50, height: 20 }
        },
        pareja1: {
          izquierda: {
            nombre: { top: 142, left: 112, width: 300, height: 20 },
            pos: { top: 142, left: 412, width: 10, height: 20 },
            pg: { top: 142, left: 442, width: 15, height: 20 },
            dif: { top: 142, left: 472, width: 20, height: 20 }
          },
          derecha: {
            nombre: { top: 142, left: 570, width: 300, height: 20 },
            pos: { top: 142, left: 870, width: 10, height: 20 },
            pg: { top: 142, left: 900, width: 15, height: 20 },
            dif: { top: 142, left: 930, width: 20, height: 20 }
          }
        },
        pareja2: {
          izquierda: {
            nombre: { top: 169, left: 112, width: 300, height: 20 },
            pos: { top: 169, left: 412, width: 10, height: 20 },
            pg: { top: 169, left: 442, width: 15, height: 20 },
            dif: { top: 169, left: 472, width: 20, height: 20 }
          },
          derecha: {
            nombre: { top: 169, left: 570, width: 300, height: 20 },
            pos: { top: 169, left: 870, width: 10, height: 20 },
            pg: { top: 169, left: 900, width: 15, height: 20 },
            dif: { top: 169, left: 930, width: 20, height: 20 }
          }
        }
      };
    }
    
    // VALIDAR DATOS
    if (!campeonato || typeof campeonato !== 'object') {
      console.error('Datos de campeonato no válidos o no disponibles');
      if (typeof window !== 'undefined') {
        window.__dominoPrintControl.isCurrentlyPrinting = false;
      }
      return false;
    }
    
    if (!mesas || !Array.isArray(mesas) || mesas.length === 0) {
      console.error('No hay mesas para imprimir o el formato es incorrecto');
      mesas = [];
    }
    
    // GENERAR HTML
    const htmlImpresion = generarHTMLImpresion(mesas, campeonato, plantillaUrl, posicionesGuardadas);
    
    // CREAR IFRAME PARA IMPRESIÓN DIRECTA
    // Este enfoque es más directo que abrir una nueva ventana
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    // Configurar el contenido HTML
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Impresión de Mesas - ${campeonato.nombre || 'Dominó'}</title>
        <meta charset="UTF-8">
        <style>${htmlImpresion.match(/<style>([\s\S]*?)<\/style>/)?.[1] || ''}</style>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }
          
          body, html {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: white;
            width: 100%;
            height: 100%;
          }
          
          /* Eliminar todos los elementos de depuración */
          .debugInfo, .posiciones-debug, .controles-depuracion {
            display: none !important;
          }
        </style>
        <script>
          // Función para ajustar automáticamente el tamaño del texto
          function ajustarTamanoTexto() {
            // Seleccionar todos los elementos con clase debugParejaName
            var elementos = document.querySelectorAll('.debugParejaName');
            
            elementos.forEach(function(elemento) {
              // Obtener información del elemento desde los atributos de datos
              var textoOriginal = elemento.getAttribute('data-texto-original') || elemento.textContent.trim();
              
              // Tamaño de fuente inicial (12px)
              elemento.style.fontSize = '12px';
              
              // Calcular anchos
              var anchoDisponible = elemento.offsetWidth;
              var anchoTexto = elemento.scrollWidth;
              
              // Añadir un pequeño margen de seguridad (95% del ancho disponible)
              var anchoEfectivo = anchoDisponible * 0.95;
              
              // Si el texto es más ancho que el contenedor, ajustar el tamaño
              if (anchoTexto > anchoEfectivo && anchoEfectivo > 0) {
                // Factor de reducción
                var factorReduccion = anchoEfectivo / anchoTexto;
                
                // Calcular nuevo tamaño (mínimo 8px)
                var nuevoTamano = Math.max(8, Math.floor(12 * factorReduccion));
                
                // Aplicar el nuevo tamaño
                elemento.style.fontSize = nuevoTamano + 'px';
              }
            });
          }
          
          // Cuando se carga la página, ajustar el texto y luego imprimir
          window.onload = function() {
            // Ajustar texto
            ajustarTamanoTexto();
            
            // Imprimir después de un breve retraso para asegurar que todo esté cargado
            setTimeout(function() {
          window.print();
          
              // Notificar a la ventana principal que se ha completado la impresión
              window.parent.__dominoPrintControl.isCurrentlyPrinting = false;
              
              // Eliminar el iframe después de imprimir
              setTimeout(function() {
                window.parent.document.body.removeChild(window.frameElement);
              }, 1000);
            }, 200);
          };
        </script>
      </head>
      <body>
        ${htmlImpresion.replace(/<style>[\s\S]*?<\/style>/, '')}
      </body>
      </html>
    `);
    doc.close();
    
    return true;
    } catch (error) {
    console.error('Error en el proceso de impresión:', error);
      
    // Resetear estado en caso de error
    if (typeof window !== 'undefined') {
        window.__dominoPrintControl.isCurrentlyPrinting = false;
      }
      
    return false;
    }
};

export default {
  cargarDatosImpresion,
  ejecutarImpresion
}; 