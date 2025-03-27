// Servicio para la impresión de mesas de dominó
// Este servicio maneja la generación de HTML y la impresión

/**
 * Convierte un objeto de estilo a texto CSS
 * @param {Object} estiloObj - Objeto con propiedades CSS
 * @returns {String} Cadena de texto con estilos CSS
 */
const convertirEstiloATexto = (estiloObj) => {
  return Object.entries(estiloObj)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
};

/**
 * Genera el HTML de impresión para las mesas
 * @param {Array} mesas - Lista de mesas a imprimir
 * @param {Object} campeonato - Datos del campeonato actual
 * @param {String} plantillaImagenUrl - URL de la imagen de plantilla
 * @param {Function} obtenerEstiloPosicionTexto - Función para obtener estilos
 * @returns {String} HTML completo para imprimir
 */
const generarHTMLImpresion = (mesas, campeonato, plantillaImagenUrl, obtenerEstiloPosicionTexto) => {
  // Construir HTML para la impresión
  let paginasHTML = '';
  for (let i = 0; i < mesas.length; i += 2) {
    const mesa = mesas[i];
    const tieneSiguienteMesa = i + 1 < mesas.length;
    const siguienteMesa = tieneSiguienteMesa ? mesas[i + 1] : null;
    
    // Crear página
    paginasHTML += '<div id="print-page-' + Math.floor(i/2) + '" class="print-page" style="page-break-inside: avoid; page-break-after: always; height: 210mm; width: 297mm;">';
    paginasHTML += '<div class="print-template-image" style="width: 100%; height: 100%;">';
    paginasHTML += '<img src="' + plantillaImagenUrl + '" alt="Plantilla de mesas" class="template-image" style="width: 100%; height: 100%; object-fit: fill;" />';
    
    // Logo izquierdo
    paginasHTML += '<div style="position: absolute; top: 113px; left: 246px; width: 42px; height: 30px; display: flex; justify-content: center; align-items: center; z-index: 100;">';
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
      paginasHTML += '<div style="position: absolute; top: 113px; left: 914px; width: 42px; height: 30px; display: flex; justify-content: center; align-items: center; z-index: 100;">';
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
  
  // Construir el HTML completo evitando problemas con etiquetas
  const htmlCompleto = '<!DOCTYPE html>' +
    '<html>' +
    '<head>' +
    '<meta charset="UTF-8">' +
    '<title>Impresión de Mesas - ' + (campeonato && campeonato.nombre ? campeonato.nombre : 'Domino App') + '</title>' +
    '<style>' +
    '* { box-sizing: border-box; margin: 0; padding: 0; }' +
    '@page { size: landscape; margin: 0; }' +
    'html, body { width: 100%; height: 100%; background-color: white; }' +
    '.print-container { display: block; width: 100%; }' +
    '.print-page { width: 297mm; height: 210mm; page-break-after: always; position: relative; margin: 0 auto; overflow: hidden; }' +
    '.print-page:last-child { page-break-after: avoid; }' +
    '.print-template-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }' +
    '.template-image { width: 100%; height: 100%; object-fit: contain; }' +
    '.form-field { position: absolute; text-align: center; font-family: Arial, sans-serif; font-size: 10pt; color: black; }' +
    '@media screen { ' +
    '  body { background-color: #f0f0f0; padding: 20px; }' +
    '  .print-page { margin-bottom: 20px; background-color: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); }' +
    '}' +
    '@media print {' +
    '  @page { size: landscape; margin: 0; }' +
    '  html, body { margin: 0 !important; padding: 0 !important; }' +
    '  .print-page { break-inside: avoid; page-break-after: always; box-shadow: none; }' +
    '  .print-container { padding: 0; margin: 0; }' +
    '}' +
    '</style>' +
    '</head>' +
    '<body>' +
    '<div class="print-container">' + paginasHTML + '</div>' +
    '</body>' +
    '</html>';
  
  return htmlCompleto;
};

/**
 * Imprime las mesas en una ventana nueva
 * @param {Array} mesas - Lista de mesas a imprimir
 * @param {Object} campeonato - Datos del campeonato actual
 * @param {String} plantillaImagenUrl - URL de la imagen de plantilla
 * @param {Function} obtenerEstiloPosicionTexto - Función para obtener los estilos
 * @returns {Promise} Promesa que se resuelve cuando se completa la operación
 */
const imprimirMesas = (mesas, campeonato, plantillaImagenUrl, obtenerEstiloPosicionTexto) => {
  return new Promise((resolve, reject) => {
    try {
      if (!mesas || mesas.length === 0) {
        reject(new Error('No hay mesas para imprimir'));
        return;
      }
      
      const paginasCount = Math.ceil(mesas.length / 2);
      console.log('Imprimiendo ' + mesas.length + ' mesas en ' + paginasCount + ' páginas...');
      
      // Generar el HTML de impresión
      const htmlCompleto = generarHTMLImpresion(mesas, campeonato, plantillaImagenUrl, obtenerEstiloPosicionTexto);
      
      // Crear un iframe temporal oculto para imprimir
      const iframeTemporal = document.createElement('iframe');
      iframeTemporal.style.position = 'fixed';
      iframeTemporal.style.width = '0';
      iframeTemporal.style.height = '0';
      iframeTemporal.style.opacity = '0';
      iframeTemporal.style.border = 'none';
      iframeTemporal.style.overflow = 'hidden';
      document.body.appendChild(iframeTemporal);
      
      // Establecer el contenido del iframe
      iframeTemporal.contentWindow.document.open();
      iframeTemporal.contentWindow.document.write(htmlCompleto);
      iframeTemporal.contentWindow.document.close();
      
      // Esperar a que el iframe cargue completamente
      iframeTemporal.onload = () => {
        setTimeout(() => {
          try {
            // Llamar a imprimir en el iframe
            iframeTemporal.contentWindow.focus();
            iframeTemporal.contentWindow.print();
            
            // Limpiar el iframe después de un tiempo
            setTimeout(() => {
              document.body.removeChild(iframeTemporal);
              resolve();
            }, 2000);
          } catch (e) {
            console.error('Error al imprimir:', e);
            document.body.removeChild(iframeTemporal);
            reject(e);
          }
        }, 1000);
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