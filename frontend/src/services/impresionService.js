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
 * @returns {String} HTML para imprimir
 */
const generarHTMLImpresion = (mesas, campeonato, plantillaImagenUrl) => {
  // Verificar que mesas sea un array
  const mesasArray = Array.isArray(mesas) ? mesas : [];
  
  console.log('Generando HTML para impresión:');
  console.log('- Tipo de datos de mesas:', typeof mesas);
  console.log('- Es array:', Array.isArray(mesas));
  console.log('- Longitud del array:', mesasArray.length);
  
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
      width: 100%;
      height: 100vh;
      page-break-after: always;
      overflow: hidden;
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
      object-fit: contain;
    }
    
    .texto-mesa {
      position: absolute;
      z-index: 10;
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
      display: none; /* Ocultar por defecto */
    }
    
    @media print {
      body { 
        margin: 0; 
        padding: 0; 
      }
      .debugInfo { 
        display: none !important; 
      }
      .pagina {
        margin: 0;
        padding: 0;
      }
    }
  `;
  
  // Información de depuración (oculta por defecto)
  contenidoHTML += '<div class="debugInfo">';
  contenidoHTML += '<p>Información de depuración:</p>';
  contenidoHTML += '<p>Número de mesas: ' + mesasArray.length + '</p>';
  contenidoHTML += '<p>Tipo de mesas: ' + typeof mesas + '</p>';
  contenidoHTML += '<p>Es array: ' + Array.isArray(mesas) + '</p>';
  contenidoHTML += '<p>Valor mesas: ' + JSON.stringify(mesasArray.slice(0, 2)).substring(0, 100) + '...</p>';
  contenidoHTML += '<p>Campeonato: ' + (campeonato ? campeonato.nombre : 'No disponible') + '</p>';
  contenidoHTML += '<p>URL plantilla: ' + (plantillaImagenUrl || 'No disponible') + '</p>';
  contenidoHTML += '</div>';
  
  // Si no hay mesas, mostrar mensaje
  if (mesasArray.length === 0) {
    contenidoHTML += '<div class="pagina">';
    if (plantillaImagenUrl) {
      contenidoHTML += '<img src="' + plantillaImagenUrl + '" class="plantilla-img" alt="Plantilla" />';
    }
    contenidoHTML += '<div class="texto-mesa" style="top: 50px; left: 50px; color: red; font-size: 16px;">No hay mesas para imprimir o el formato de datos es incorrecto</div>';
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
      
      // Mesa ID (izquierda)
      contenidoHTML += '<div class="texto-mesa" style="top: 79px; left: 112px;"><strong>Mesa ID: ' + mesaIzquierda.id + '</strong></div>';
      
      // Pareja 1 de mesa izquierda
      if (mesaIzquierda.pareja1) {
        contenidoHTML += '<div class="texto-mesa" style="top: 142px; left: 112px;">Pareja 1: ' + 
          mesaIzquierda.pareja1.id + '</div>';
      }
      
      // Pareja 2 de mesa izquierda
      if (mesaIzquierda.pareja2) {
        contenidoHTML += '<div class="texto-mesa" style="top: 169px; left: 112px;">Pareja 2: ' + 
          mesaIzquierda.pareja2.id + '</div>';
      }
      
      // Datos del campeonato (izquierda)
      if (campeonato) {
        contenidoHTML += '<div class="texto-mesa" style="top: 197px; left: 112px;">' + 
          campeonato.nombre + '</div>';
      }
      
      // Segunda mesa de la página (derecha, si existe)
      if (i + 1 < mesasArray.length) {
        const mesaDerecha = mesasArray[i + 1];
        
        // Mesa ID (derecha)
        contenidoHTML += '<div class="texto-mesa" style="top: 79px; left: 570px;"><strong>Mesa ID: ' + mesaDerecha.id + '</strong></div>';
        
        // Pareja 1 de mesa derecha
        if (mesaDerecha.pareja1) {
          contenidoHTML += '<div class="texto-mesa" style="top: 142px; left: 570px;">Pareja 1: ' + 
            mesaDerecha.pareja1.id + '</div>';
        }
        
        // Pareja 2 de mesa derecha
        if (mesaDerecha.pareja2) {
          contenidoHTML += '<div class="texto-mesa" style="top: 169px; left: 570px;">Pareja 2: ' + 
            mesaDerecha.pareja2.id + '</div>';
        }
        
        // Datos del campeonato (derecha)
        if (campeonato) {
          contenidoHTML += '<div class="texto-mesa" style="top: 197px; left: 570px;">' + 
            campeonato.nombre + '</div>';
        }
      }
      
      contenidoHTML += '</div>'; // Fin de la página
    }
  }
  
  // HTML completo
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Impresión Mesas - Domino App</title>
  <style>${estiloCSS}</style>
</head>
<body>
  ${contenidoHTML}
</body>
</html>`;
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
 * Implementación con enfoque radicalmente simplificado para imprimir mesas
 * Usa un método directo de impresión sin iframes ni ventanas complejas
 * 
 * @param {Object} campeonato - Datos del campeonato
 * @param {Array} mesas - Lista de mesas a imprimir
 * @param {String} plantillaUrl - URL de la imagen de la plantilla
 * @param {Number} escalaLogo - Factor de escala para el logo (entre 0.5 y 1.0)
 * @returns {Promise} Promesa que se resuelve cuando finaliza la impresión
 */
const ejecutarImpresion = async (campeonato, mesas, plantillaUrl, escalaLogo = 0.7) => {
  return new Promise((resolve, reject) => {
    try {
      // Verificación mínima para evitar duplicados
      if (window.__dominoPrintControl && window.__dominoPrintControl.isCurrentlyPrinting) {
        console.warn('⚠️ Ya hay una impresión en curso. Cancelando.');
        return resolve(false);
      }
      
      // Marcar como en proceso
      if (window.__dominoPrintControl) {
        window.__dominoPrintControl.isCurrentlyPrinting = true;
        window.__dominoPrintControl.lastPrintTimestamp = Date.now();
      }
      
      // Generar ID único para esta impresión
      const printId = 'print_' + Date.now();
      console.log('🖨️ Iniciando impresión simplificada:', printId);
      
      // Normalizar datos de mesas
      let mesasArray = Array.isArray(mesas) ? mesas : [];
      if (mesas && mesas.value && Array.isArray(mesas.value)) {
        mesasArray = mesas.value;
      }
      
      // Normalizar datos de campeonato
      let campeonatoData = campeonato;
      if (campeonato && campeonato.value) {
        campeonatoData = campeonato.value;
      }
      
      // Verificar que haya datos para imprimir
      if (mesasArray.length === 0) {
        console.warn('⚠️ No hay mesas para imprimir');
        if (window.__dominoPrintControl) window.__dominoPrintControl.isCurrentlyPrinting = false;
        return resolve(false);
      }
      
      // Generar el HTML
      const htmlParaImprimir = generarHTMLImpresion(mesasArray, campeonatoData, plantillaUrl);
      
      // Crear un elemento temporal en el DOM
      const printContainer = document.createElement('div');
      printContainer.style.position = 'absolute';
      printContainer.style.left = '-9999px';
      printContainer.style.top = '-9999px';
      printContainer.innerHTML = htmlParaImprimir;
      document.body.appendChild(printContainer);
      
      // Función para limpiar recursos
      const limpiarRecursos = () => {
        try {
          // Esperar un momento y luego eliminar el contenedor
          setTimeout(() => {
            if (document.body.contains(printContainer)) {
              document.body.removeChild(printContainer);
            }
            
            // Liberar el control
            if (window.__dominoPrintControl) {
              window.__dominoPrintControl.isCurrentlyPrinting = false;
            }
            
            console.log('✅ Recursos liberados para la impresión:', printId);
          }, 1000);
        } catch (e) {
          console.error('Error al limpiar recursos:', e);
        }
      };
      
      // Función para imprimir usando la API nativa del navegador
      const imprimirContenido = () => {
        try {
          // Guardar contenido actual de la página
          const bodyOriginal = document.body.innerHTML;
          
          // Reemplazar temporalmente el contenido del body
          document.body.innerHTML = htmlParaImprimir;
          
          // Variable para detectar cuando termina la impresión
          let printDialogClosed = false;
          
          // Función para ejecutar después de que se cierre el diálogo de impresión
          const afterPrintAction = () => {
            if (printDialogClosed) return; // Evitar ejecución múltiple
            printDialogClosed = true;
            
            console.log('Diálogo de impresión cerrado, recargando página...');
            
            // Recargar la página en lugar de intentar restaurar el DOM
            window.location.reload();
            
            // Nota: El código debajo nunca se ejecutará debido al reload
            // pero lo dejamos como fallback por si el reload falla
            setTimeout(() => {
              try {
                // Restaurar contenido original
                document.body.innerHTML = bodyOriginal;
                
                // Limpiar recursos
                limpiarRecursos();
                resolve(true);
              } catch (e) {
                window.location.reload();
              }
            }, 100);
          };
          
          // Detectar cierre de diálogo de impresión usando el evento afterprint
          window.addEventListener('afterprint', afterPrintAction, { once: true });
          
          // Respaldo en caso de que afterprint no se dispare
          setTimeout(() => {
            if (!printDialogClosed) {
              afterPrintAction();
            }
          }, 5000); // 5 segundos de espera máxima
          
          // Imprimir
          window.print();
          
        } catch (error) {
          console.error('❌ Error durante la impresión:', error);
          
          // Recargar la página en caso de error
          window.location.reload();
          
          reject(error);
        }
      };
      
      // Ejecutar la impresión con un pequeño retardo
      setTimeout(imprimirContenido, 300);
      
    } catch (error) {
      console.error('❌ Error crítico en el sistema de impresión:', error);
      
      // Liberar recursos en caso de error
      if (window.__dominoPrintControl) {
        window.__dominoPrintControl.isCurrentlyPrinting = false;
      }
      
      // Recargar la página si algo sale mal
      setTimeout(() => window.location.reload(), 1000);
      
      reject(error);
    }
  });
};

export default {
  cargarDatosImpresion,
  ejecutarImpresion
}; 