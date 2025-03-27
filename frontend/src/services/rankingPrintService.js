/**
 * Servicio para la impresión del ranking de domino
 */

/**
 * Genera el HTML para la impresión del ranking
 * @param {Array} rankingData - Datos del ranking a imprimir
 * @param {Object} campeonato - Datos del campeonato actual
 * @returns {String} HTML completo para impresión
 */
const generarHTMLRanking = (rankingData, campeonato) => {
  // Generar filas de la tabla
  const filas = rankingData.map((item, index) => `
    <tr>
      <td class="centered">${index + 1}</td>
      <td class="centered">${item.ultima_partida || 0}</td>
      <td class="centered">${item.gb ? 'B' : 'A'}</td>
      <td class="centered">${item.pg || 0}</td>
      <td class="centered">${item.pp || 0}</td>
      <td class="centered">${item.rt || 0}</td>
      <td class="centered">${item.mg || 0}</td>
      <td class="centered">${item.numero || item.pareja_id || 0}</td>
      <td class="nombre">${item.nombre || 'Sin nombre'}</td>
      <td>${item.club || ''}</td>
    </tr>
  `).join('');

  // Generar partida actual si existe
  const partidaActual = campeonato && campeonato.partida_actual ? 
    `<p>Partida actual: ${campeonato.partida_actual}</p>` : '';
  
  // Construir el HTML completo
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ranking - ${campeonato ? campeonato.nombre : 'Domino App'}</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      margin: 0; 
      padding: 20px; 
    }
    h1 { 
      text-align: center; 
      margin-bottom: 20px; 
      font-size: 24px;
      color: #333;
    }
    h2 {
      text-align: center;
      margin-top: -5px;
      color: #555;
      font-weight: normal;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-bottom: 20px;
    }
    th, td { 
      padding: 10px 8px; 
      text-align: left; 
      border-bottom: 1px solid #ddd; 
    }
    th { 
      background-color: #f2f2f2; 
      font-weight: bold;
      color: #333;
      text-align: center;
    }
    tr:nth-child(even) { 
      background-color: #f9f9f9; 
    }
    tr:hover { 
      background-color: #f5f5f5; 
    }
    .centered { 
      text-align: center; 
    }
    .nombre {
      text-align: left;
      width: 30%;
    }
    @media print {
      body { 
        padding: 0.5cm; 
        font-size: 11pt;
      }
      h1 { 
        font-size: 16pt; 
        margin-bottom: 15px;
      }
      h2 {
        font-size: 14pt;
        margin-bottom: 10px;
      }
      table { 
        page-break-inside: auto;
        width: 100%;
      }
      tr { 
        page-break-inside: avoid; 
        page-break-after: auto;
      }
      thead { 
        display: table-header-group; 
      }
      tfoot { 
        display: table-footer-group; 
      }
      @page { 
        margin: 1cm; 
        size: landscape;
      }
    }
  </style>
</head>
<body>
  <h1>Ranking Completo</h1>
  <h2 style="text-align: center; margin-top: -5px; color: #555; font-weight: normal;">
    ${campeonato ? campeonato.nombre : ''}
  </h2>
  
  <div style="text-align: right; margin: 10px 0; font-weight: bold; padding-right: 20px;">
    ${campeonato && campeonato.partida_actual ? `Partida ${campeonato.partida_actual} de ${campeonato.numero_partidas || '?'}` : ''}
  </div>
  
  <table>
    <thead>
      <tr>
        <th class="centered">POSI</th>
        <th class="centered">PART.</th>
        <th class="centered">GB</th>
        <th class="centered">PG</th>
        <th class="centered">DIF.</th>
        <th class="centered">RT</th>
        <th class="centered">MG</th>
        <th class="centered">PAREJA</th>
        <th class="nombre">NOMBRE</th>
        <th>CLUB</th>
      </tr>
    </thead>
    <tbody>
      ${filas}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="10" style="text-align: center; font-size: 9pt; padding: 8px; border-top: 1px solid #ddd;">
          © ${new Date().getFullYear()} Domino App
        </td>
      </tr>
    </tfoot>
  </table>
  
  <script>
    window.onload = function() {
      console.log('Contenido del ranking cargado correctamente');
    }
  </script>
</body>
</html>`;
};

/**
 * Imprime el ranking en una ventana nueva
 * @param {Array} rankingData - Datos del ranking a imprimir
 * @param {Object} campeonato - Datos del campeonato actual
 * @returns {Promise} Promesa que se resuelve cuando se completa la operación
 */
const imprimirRanking = (rankingData, campeonato) => {
  return new Promise((resolve, reject) => {
    try {
      // Generar el HTML para la impresión
      const html = generarHTMLRanking(rankingData, campeonato);
      
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
      iframe.contentWindow.document.write(html);
      iframe.contentWindow.document.close();
      
      // Imprimir cuando el contenido esté cargado
      iframe.onload = () => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          
          // Eliminar el iframe después de un tiempo
          setTimeout(() => {
            document.body.removeChild(iframe);
            resolve();
          }, 1000);
        } catch (e) {
          console.error('Error al imprimir ranking:', e);
          document.body.removeChild(iframe);
          reject(e);
        }
      };
    } catch (error) {
      console.error('Error al generar HTML del ranking:', error);
      reject(error);
    }
  });
};

export default {
  generarHTMLRanking,
  imprimirRanking
}; 