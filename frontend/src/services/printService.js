// Servicio para la impresión de mesas de dominó
// Este servicio maneja la generación de HTML y la impresión

import posicionamientoService from './posicionamientoService';

/**
 * Genera el HTML de impresión para las mesas
 * @param {Array} mesas - Lista de mesas a imprimir
 * @param {Object} campeonato - Datos del campeonato actual
 * @param {String} plantillaImagenUrl - URL de la imagen de plantilla
 * @returns {String} HTML completo para imprimir
 */
const generarHTMLImpresion = (mesas, campeonato, plantillaImagenUrl) => {
  // Acceder a las funciones desde el servicio de posicionamiento
  const { obtenerEstiloPosicionTexto, convertirEstiloATexto } = posicionamientoService;

  // Construir HTML para la impresión
  let paginasHTML = '';
  for (let i = 0; i < mesas.length; i += 2) {
    const mesa = mesas[i];
    const tieneSiguienteMesa = i + 1 < mesas.length;
    const siguienteMesa = tieneSiguienteMesa ? mesas[i + 1] : null;
    
    // Crear página
    paginasHTML += '<div id="print-page-' + Math.floor(i/2) + '" class="print-page">';
    paginasHTML += '<div class="print-template-image">';
    paginasHTML += '<img src="' + plantillaImagenUrl + '" alt="Plantilla de mesas" class="template-image" />';
    
    // Logo izquierdo
    const estiloLogoIzquierdo = convertirEstiloATexto(obtenerEstiloPosicionTexto('logoCampeonato', i, 'izquierda'));
    paginasHTML += '<div style="position: absolute; top: 180px; left: 230px; width: 50px; height: 50px; display: flex; justify-content: center; align-items: center; z-index: 100;">';
    if (campeonato && campeonato.logo) {
      paginasHTML += '<img src="' + campeonato.logo + '" alt="Logo mesa izquierda" style="max-width: 100%; max-height: 100%; object-fit: contain; object-position: center center; display: block;" />';
    }
    paginasHTML += '</div>';
    
    // Datos de la primera mesa (izquierda)
    paginasHTML += '<div class="template-overlay left-side">';
    
    // Nombre del campeonato
    const estiloNombreCampeonatoIzq = convertirEstiloATexto(obtenerEstiloPosicionTexto('nombreCampeonato', i, 'izquierda'));
    paginasHTML += '<div class="form-field" style="' + estiloNombreCampeonatoIzq + '">';
    paginasHTML += campeonato && campeonato.nombre ? campeonato.nombre : '';
    paginasHTML += '</div>';
    
    // Número de mesa y partida
    const estiloMesaNumeroIzq = convertirEstiloATexto(obtenerEstiloPosicionTexto('mesaNumero', i, 'izquierda'));
    paginasHTML += '<div class="form-field" style="' + estiloMesaNumeroIzq + '">';
    paginasHTML += mesa.id;
    paginasHTML += '</div>';
    
    const estiloPartidaNumeroIzq = convertirEstiloATexto(obtenerEstiloPosicionTexto('partidaNumero', i, 'izquierda'));
    paginasHTML += '<div class="form-field" style="' + estiloPartidaNumeroIzq + '">';
    paginasHTML += campeonato && campeonato.partida_actual ? campeonato.partida_actual : '';
    paginasHTML += '</div>';
    
    // Datos pareja izquierda
    const estiloPosicionIzq = convertirEstiloATexto(obtenerEstiloPosicionTexto('posicion', i, 'izquierda'));
    paginasHTML += '<div class="form-field" style="' + estiloPosicionIzq + '">';
    paginasHTML += mesa.pareja1 && mesa.pareja1.ranking_posicion ? mesa.pareja1.ranking_posicion : '-';
    paginasHTML += '</div>';
    
    const estiloPgIzq = convertirEstiloATexto(obtenerEstiloPosicionTexto('pg', i, 'izquierda'));
    paginasHTML += '<div class="form-field" style="' + estiloPgIzq + '">';
    paginasHTML += mesa.pareja1 && mesa.pareja1.partidas_ganadas ? mesa.pareja1.partidas_ganadas : '0';
    paginasHTML += '</div>';
    
    const estiloDiferenciaIzq = convertirEstiloATexto(obtenerEstiloPosicionTexto('diferencia', i, 'izquierda'));
    paginasHTML += '<div class="form-field" style="' + estiloDiferenciaIzq + '">';
    paginasHTML += mesa.pareja1 && mesa.pareja1.diferencia ? mesa.pareja1.diferencia : '0';
    paginasHTML += '</div>';
    
    // Datos pareja derecha (en la mesa izquierda)
    const estiloPosicionOponenteIzq = convertirEstiloATexto(obtenerEstiloPosicionTexto('posicionOponente', i, 'izquierda'));
    paginasHTML += '<div class="form-field" style="' + estiloPosicionOponenteIzq + '">';
    paginasHTML += mesa.pareja2 && mesa.pareja2.ranking_posicion ? mesa.pareja2.ranking_posicion : '-';
    paginasHTML += '</div>';
    
    const estiloPgOponenteIzq = convertirEstiloATexto(obtenerEstiloPosicionTexto('pgOponente', i, 'izquierda'));
    paginasHTML += '<div class="form-field" style="' + estiloPgOponenteIzq + '">';
    paginasHTML += mesa.pareja2 && mesa.pareja2.partidas_ganadas ? mesa.pareja2.partidas_ganadas : '0';
    paginasHTML += '</div>';
    
    const estiloDiferenciaOponenteIzq = convertirEstiloATexto(obtenerEstiloPosicionTexto('diferenciaOponente', i, 'izquierda'));
    paginasHTML += '<div class="form-field" style="' + estiloDiferenciaOponenteIzq + '">';
    paginasHTML += mesa.pareja2 && mesa.pareja2.diferencia ? mesa.pareja2.diferencia : '0';
    paginasHTML += '</div>';
    
    paginasHTML += '</div>'; // Cierre template-overlay left-side
    
    // Si hay una segunda mesa, añadir su HTML
    if (tieneSiguienteMesa) {
      // Logo derecho
      const estiloLogoDerecho = convertirEstiloATexto(obtenerEstiloPosicionTexto('logoCampeonato', i + 1, 'derecha'));
      paginasHTML += '<div style="position: absolute; top: 180px; left: 900px; width: 50px; height: 50px; display: flex; justify-content: center; align-items: center; z-index: 100;">';
      if (campeonato && campeonato.logo) {
        paginasHTML += '<img src="' + campeonato.logo + '" alt="Logo mesa derecha" style="max-width: 100%; max-height: 100%; object-fit: contain; object-position: center center; display: block;" />';
      }
      paginasHTML += '</div>';
      
      // Datos de la segunda mesa (derecha)
      paginasHTML += '<div class="template-overlay right-side">';
      
      // Nombre del campeonato
      const estiloNombreCampeonatoDer = convertirEstiloATexto(obtenerEstiloPosicionTexto('nombreCampeonato', i + 1, 'derecha'));
      paginasHTML += '<div class="form-field" style="' + estiloNombreCampeonatoDer + '">';
      paginasHTML += campeonato && campeonato.nombre ? campeonato.nombre : '';
      paginasHTML += '</div>';
      
      // Número de mesa y partida
      const estiloMesaNumeroDer = convertirEstiloATexto(obtenerEstiloPosicionTexto('mesaNumero', i + 1, 'derecha'));
      paginasHTML += '<div class="form-field" style="' + estiloMesaNumeroDer + '">';
      paginasHTML += siguienteMesa.id;
      paginasHTML += '</div>';
      
      const estiloPartidaNumeroDer = convertirEstiloATexto(obtenerEstiloPosicionTexto('partidaNumero', i + 1, 'derecha'));
      paginasHTML += '<div class="form-field" style="' + estiloPartidaNumeroDer + '">';
      paginasHTML += campeonato && campeonato.partida_actual ? campeonato.partida_actual : '';
      paginasHTML += '</div>';
      
      // Datos pareja izquierda (en la mesa derecha)
      const estiloPosicionDer = convertirEstiloATexto(obtenerEstiloPosicionTexto('posicion', i + 1, 'derecha'));
      paginasHTML += '<div class="form-field" style="' + estiloPosicionDer + '">';
      paginasHTML += siguienteMesa.pareja1 && siguienteMesa.pareja1.ranking_posicion ? siguienteMesa.pareja1.ranking_posicion : '-';
      paginasHTML += '</div>';
      
      const estiloPgDer = convertirEstiloATexto(obtenerEstiloPosicionTexto('pg', i + 1, 'derecha'));
      paginasHTML += '<div class="form-field" style="' + estiloPgDer + '">';
      paginasHTML += siguienteMesa.pareja1 && siguienteMesa.pareja1.partidas_ganadas ? siguienteMesa.pareja1.partidas_ganadas : '0';
      paginasHTML += '</div>';
      
      const estiloDiferenciaDer = convertirEstiloATexto(obtenerEstiloPosicionTexto('diferencia', i + 1, 'derecha'));
      paginasHTML += '<div class="form-field" style="' + estiloDiferenciaDer + '">';
      paginasHTML += siguienteMesa.pareja1 && siguienteMesa.pareja1.diferencia ? siguienteMesa.pareja1.diferencia : '0';
      paginasHTML += '</div>';
      
      // Datos pareja derecha (en la mesa derecha)
      const estiloPosicionOponenteDer = convertirEstiloATexto(obtenerEstiloPosicionTexto('posicionOponente', i + 1, 'derecha'));
      paginasHTML += '<div class="form-field" style="' + estiloPosicionOponenteDer + '">';
      paginasHTML += siguienteMesa.pareja2 && siguienteMesa.pareja2.ranking_posicion ? siguienteMesa.pareja2.ranking_posicion : '-';
      paginasHTML += '</div>';
      
      const estiloPgOponenteDer = convertirEstiloATexto(obtenerEstiloPosicionTexto('pgOponente', i + 1, 'derecha'));
      paginasHTML += '<div class="form-field" style="' + estiloPgOponenteDer + '">';
      paginasHTML += siguienteMesa.pareja2 && siguienteMesa.pareja2.partidas_ganadas ? siguienteMesa.pareja2.partidas_ganadas : '0';
      paginasHTML += '</div>';
      
      const estiloDiferenciaOponenteDer = convertirEstiloATexto(obtenerEstiloPosicionTexto('diferenciaOponente', i + 1, 'derecha'));
      paginasHTML += '<div class="form-field" style="' + estiloDiferenciaOponenteDer + '">';
      paginasHTML += siguienteMesa.pareja2 && siguienteMesa.pareja2.diferencia ? siguienteMesa.pareja2.diferencia : '0';
      paginasHTML += '</div>';
      
      paginasHTML += '</div>'; // Cierre template-overlay right-side
    }
    
    // Cerrar los divs abiertos
    paginasHTML += '</div>'; // Cierre print-template-image
    paginasHTML += '</div>'; // Cierre print-page
  }
  
  // Estilos CSS mejorados para impresión
  const stylesPrint = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: landscape; margin: 0; }
    html, body { width: 100%; height: 100%; background-color: white; margin: 0; padding: 0; }
    .print-container { display: block; }
    .print-page { page-break-after: always; position: relative; margin: 0; padding: 0; height: 100vh; width: 100%; }
    .print-page:last-child { page-break-after: avoid; }
    .print-template-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
    .template-image { width: 100%; height: 100%; object-fit: fill; display: block; }
    .form-field { position: absolute; text-align: center; font-family: Arial, sans-serif; font-size: 10pt; color: black; }
    .debug-info { position: fixed; top: 5px; right: 5px; background: rgba(255,255,255,0.7); padding: 5px; font-size: 10px; z-index: 9999; }
    @media print {
      @page { size: landscape; margin: 0; }
      html, body { width: 100%; height: 100%; margin: 0 !important; padding: 0 !important; }
      .print-page { break-inside: avoid; page-break-after: always; box-shadow: none; margin: 0; padding: 0; height: 100vh; width: 100%; }
      .print-container { padding: 0; margin: 0; }
      .template-image { width: 100%; height: 100%; object-fit: fill; }
      .debug-info { display: none; }
    }
  `;
  
  // Construir el HTML completo con un script que controla la impresión
  const htmlCompleto = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Impresión de Mesas - ${campeonato && campeonato.nombre ? campeonato.nombre : 'Domino App'}</title>
      <style>${stylesPrint}</style>
    </head>
    <body>
      <div class="print-container">${paginasHTML}</div>
    </body>
    </html>`;
  
  return htmlCompleto;
};

/**
 * Imprime las mesas en una ventana nueva
 * @param {Array} mesas - Lista de mesas a imprimir
 * @param {Object} campeonato - Datos del campeonato actual
 * @param {String} plantillaImagenUrl - URL de la imagen de plantilla
 * @returns {Promise} Promesa que se resuelve cuando se completa la operación
 */
const imprimirMesas = (mesas, campeonato, plantillaImagenUrl) => {
  return new Promise((resolve, reject) => {
    try {
      if (!mesas || mesas.length === 0) {
        reject(new Error('No hay mesas para imprimir'));
        return;
      }
      
      const paginasCount = Math.ceil(mesas.length / 2);
      console.log('Imprimiendo ' + mesas.length + ' mesas en ' + paginasCount + ' páginas...');
      
      // Generar el HTML de impresión
      const htmlCompleto = generarHTMLImpresion(mesas, campeonato, plantillaImagenUrl);
      
      // Compartir datos con la nueva ventana
      window.mesasParaImprimir = mesas;
      window.campeonato = campeonato;
      window.plantillaImagenUrl = plantillaImagenUrl;
      
      // Crear un iframe invisible para imprimir directamente
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.opacity = '0';
      iframe.style.border = 'none';
      iframe.style.left = '-1000px';
      iframe.style.top = '-1000px';
      document.body.appendChild(iframe);
      
      // Configurar el iframe con el contenido
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(htmlCompleto);
      iframe.contentWindow.document.close();
      
      // Cuando el contenido está cargado, imprimir directamente
      iframe.onload = () => {
        try {
          // Imprimir inmediatamente
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          
          // Eliminar el iframe después de un tiempo razonable
          setTimeout(() => {
            document.body.removeChild(iframe);
            resolve();
          }, 1000);
        } catch (e) {
          console.error('Error al imprimir:', e);
          document.body.removeChild(iframe);
          reject(e);
        }
      };
    } catch (error) {
      console.error('Error al imprimir:', error);
      reject(error);
    }
  });
};

export default {
  imprimirMesas,
  generarHTMLImpresion
}; 