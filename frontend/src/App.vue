<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { campeonatoService, mesaService, parejaService, resultadoService } from './services/api'
import PlantillaImagenConfig from './components/PlantillaImagenConfig.vue'

const route = useRoute()
const showMesasMenu = ref(false)
const showResultadosMenu = ref(false)
let closeTimeout = null

// Verificar si esta ventana es para impresión
const esVentanaImpresion = ref(false)
onMounted(() => {
  // Verificar si hay parámetro "imprimir=true" en la URL
  const urlParams = new URLSearchParams(window.location.search);
  esVentanaImpresion.value = urlParams.get('imprimir') === 'true';
  
  // Si es ventana de impresión, configurar para imprimir automáticamente
  if (esVentanaImpresion.value) {
    // Usar los datos pasados por la ventana principal
    if (window.opener) {
      mesasParaImprimir.value = window.opener.mesasParaImprimir || [];
      campeonato.value = window.opener.campeonato || null;
      plantillaImagenUrl.value = window.opener.plantillaImagenUrl || '';
      
      // Imprimir automáticamente después de cargar
      setTimeout(() => {
        window.print();
        // Opcionalmente cerrar después de imprimir
        setTimeout(() => {
          window.close();
        }, 1000);
      }, 500);
    }
  } else {
    // Código normal de inicialización para la ventana principal
    document.addEventListener('click', closeMenus);
    const storedTemplateUrl = localStorage.getItem('plantilla_mesas_url');
    if (storedTemplateUrl) {
      plantillaImagenUrl.value = storedTemplateUrl;
    }
  }
});

// Referencias para los datos
const campeonato = ref(null)
const parejasMesas = ref([])
const resultados = ref([])
const ranking = ref([])

// Ruta de la imagen de plantilla (usar placeholder base64 si no hay una personalizada)
const plantillaImagenUrl = ref('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0id2hpdGUiLz48dGV4dCB4PSI2MDAiIHk9IjMwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJibGFjayI+Q2FyZ3VlIGxhIGltYWdlbiBkZSBwbGFudGlsbGEgZGVzZGUgbGEgb3BjacOzbiAnQ29uZmlndXJhciBQbGFudGlsbGEnPC90ZXh0Pjwvc3ZnPg==')

// Modal de configuración de plantilla
const mostrarModalPlantilla = ref(false)

// Computed property para las mesas que se van a imprimir
const mesasParaImprimir = ref([])

// Función para cargar los datos necesarios para la impresión
const cargarDatosImpresion = async () => {
  try {
    // Obtener el campeonato actual
    campeonato.value = await campeonatoService.obtenerActual();
    if (!campeonato.value) {
      console.error('No hay campeonato activo');
      return;
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

// Función para imprimir las mesas
const imprimir = async () => {
  try {
    // Cargar los datos y esperar a que se complete
    const mesasCount = await cargarDatosImpresion();
    
    if (mesasCount === 0) {
      alert('No hay mesas para imprimir');
      return;
    }
    
    const paginasCount = Math.ceil(mesasCount / 2);
    console.log(`Imprimiendo ${mesasCount} mesas en ${paginasCount} páginas...`);
    
    // En lugar de modificar la página actual, abrir una ventana separada para imprimir
    const imprimirWindow = window.open(window.location.href + '?imprimir=true', 'DominoImprimir', 
      'width=1024,height=768,top=0,left=0,toolbar=0,scrollbars=0,status=0,menubar=0');
    
    if (!imprimirWindow) {
      alert('No se pudo abrir la ventana de impresión. Por favor, permita las ventanas emergentes en su navegador.');
      return;
    }
    
    // Pasar los datos de impresión a la nueva ventana
    imprimirWindow.onload = () => {
      // Pasar los datos necesarios a la ventana de impresión
      imprimirWindow.mesasParaImprimir = mesasParaImprimir.value;
      imprimirWindow.campeonato = campeonato.value;
      imprimirWindow.plantillaImagenUrl = plantillaImagenUrl.value;
      
      // Generar el HTML directamente en lugar de intentar acceder al elemento original
      let paginasHTML = '';
      
      // Generar el HTML para cada mesa, 2 por página
      for (let i = 0; i < mesasParaImprimir.value.length; i += 2) {
        const mesa = mesasParaImprimir.value[i];
        const tieneSiguienteMesa = i + 1 < mesasParaImprimir.value.length;
        const siguienteMesa = tieneSiguienteMesa ? mesasParaImprimir.value[i + 1] : null;
        
        paginasHTML += `
          <div id="print-page-${Math.floor(i/2)}" class="print-page" style="position: relative; width: 100%; height: 100%; overflow: hidden; page-break-after: always;">
            <div class="print-template-image" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
              <img src="${plantillaImagenUrl.value}" alt="Plantilla de mesas" class="template-image" style="width: 100%; height: 100%; object-fit: fill;" />
              
              <!-- Logo izquierdo -->
              <div style="position: absolute; top: 113px; left: 246px; width: 42px; height: 30px; display: flex; justify-content: center; align-items: center; z-index: 100;">
                ${campeonato.value?.logo ? `<img src="${campeonato.value.logo}" alt="Logo mesa izquierda" style="max-width: 100%; max-height: 100%; object-fit: contain; object-position: center center; display: block;" />` : ''}
              </div>
              
              <!-- Logo derecho (solo si hay una mesa siguiente) -->
              ${tieneSiguienteMesa ? `
                <div style="position: absolute; top: 113px; left: 914px; width: 42px; height: 30px; display: flex; justify-content: center; align-items: center; z-index: 100;">
                  ${campeonato.value?.logo ? `<img src="${campeonato.value.logo}" alt="Logo mesa derecha" style="max-width: 100%; max-height: 100%; object-fit: contain; object-position: center center; display: block;" />` : ''}
                </div>
              ` : ''}
              
              <!-- Datos de la primera mesa (izquierda) -->
              <div class="template-overlay left-side">
                <!-- Nombre del campeonato -->
                <div class="form-field" style="${JSON.stringify(obtenerEstiloPosicionTexto('nombreCampeonato', i, 'izquierda')).replace(/[{}"]/g, '').replace(/,/g, ';')}">
                  ${campeonato.value?.nombre || ''}
                </div>
                
                <!-- Número de mesa y partida -->
                <div class="form-field" style="${JSON.stringify(obtenerEstiloPosicionTexto('mesaNumero', i, 'izquierda')).replace(/[{}"]/g, '').replace(/,/g, ';')}">
                  ${mesa.id}
                </div>
                <div class="form-field" style="${JSON.stringify(obtenerEstiloPosicionTexto('partidaNumero', i, 'izquierda')).replace(/[{}"]/g, '').replace(/,/g, ';')}">
                  ${campeonato.value?.partida_actual || ''}
                </div>
                
                <!-- Datos pareja izquierda -->
                <div class="form-field" style="${JSON.stringify(obtenerEstiloPosicionTexto('posicion', i, 'izquierda')).replace(/[{}"]/g, '').replace(/,/g, ';')}">
                  ${mesa.pareja1?.ranking_posicion || '-'}
                </div>
                <div class="form-field" style="${JSON.stringify(obtenerEstiloPosicionTexto('pg', i, 'izquierda')).replace(/[{}"]/g, '').replace(/,/g, ';')}">
                  ${mesa.pareja1?.partidas_ganadas || '0'}
                </div>
                <div class="form-field" style="${JSON.stringify(obtenerEstiloPosicionTexto('diferencia', i, 'izquierda')).replace(/[{}"]/g, '').replace(/,/g, ';')}">
                  ${mesa.pareja1?.diferencia || '0'}
                </div>
                
                <!-- Datos pareja derecha (en la mesa izquierda) -->
                <div class="form-field" style="${JSON.stringify(obtenerEstiloPosicionTexto('posicionOponente', i, 'izquierda')).replace(/[{}"]/g, '').replace(/,/g, ';')}">
                  ${mesa.pareja2?.ranking_posicion || '-'}
                </div>
                <div class="form-field" style="${JSON.stringify(obtenerEstiloPosicionTexto('pgOponente', i, 'izquierda')).replace(/[{}"]/g, '').replace(/,/g, ';')}">
                  ${mesa.pareja2?.partidas_ganadas || '0'}
                </div>
                <div class="form-field" style="${JSON.stringify(obtenerEstiloPosicionTexto('diferenciaOponente', i, 'izquierda')).replace(/[{}"]/g, '').replace(/,/g, ';')}">
                  ${mesa.pareja2?.diferencia || '0'}
                </div>
              </div>
              
              <!-- Datos de la segunda mesa (derecha) -->
              ${tieneSiguienteMesa ? `
                <div class="template-overlay right-side">
                  <!-- Nombre del campeonato -->
                  <div class="form-field" style="${JSON.stringify(obtenerEstiloPosicionTexto('nombreCampeonato', i + 1, 'derecha')).replace(/[{}"]/g, '').replace(/,/g, ';')}">
                    ${campeonato.value?.nombre || ''}
                  </div>
                  
                  <!-- Número de mesa y partida -->
                  <div class="form-field" style="${JSON.stringify(obtenerEstiloPosicionTexto('mesaNumero', i + 1, 'derecha')).replace(/[{}"]/g, '').replace(/,/g, ';')}">
                    ${siguienteMesa.id}
                  </div>
                  <div class="form-field" style="${JSON.stringify(obtenerEstiloPosicionTexto('partidaNumero', i + 1, 'derecha')).replace(/[{}"]/g, '').replace(/,/g, ';')}">
                    ${campeonato.value?.partida_actual || ''}
                  </div>
                  
                  <!-- Datos pareja izquierda (en la mesa derecha) -->
                  <div class="form-field" style="${JSON.stringify(obtenerEstiloPosicionTexto('posicion', i + 1, 'derecha')).replace(/[{}"]/g, '').replace(/,/g, ';')}">
                    ${siguienteMesa.pareja1?.ranking_posicion || '-'}
                  </div>
                  <div class="form-field" style="${JSON.stringify(obtenerEstiloPosicionTexto('pg', i + 1, 'derecha')).replace(/[{}"]/g, '').replace(/,/g, ';')}">
                    ${siguienteMesa.pareja1?.partidas_ganadas || '0'}
                  </div>
                  <div class="form-field" style="${JSON.stringify(obtenerEstiloPosicionTexto('diferencia', i + 1, 'derecha')).replace(/[{}"]/g, '').replace(/,/g, ';')}">
                    ${siguienteMesa.pareja1?.diferencia || '0'}
                  </div>
                  
                  <!-- Datos pareja derecha (en la mesa derecha) -->
                  <div class="form-field" style="${JSON.stringify(obtenerEstiloPosicionTexto('posicionOponente', i + 1, 'derecha')).replace(/[{}"]/g, '').replace(/,/g, ';')}">
                    ${siguienteMesa.pareja2?.ranking_posicion || '-'}
                  </div>
                  <div class="form-field" style="${JSON.stringify(obtenerEstiloPosicionTexto('pgOponente', i + 1, 'derecha')).replace(/[{}"]/g, '').replace(/,/g, ';')}">
                    ${siguienteMesa.pareja2?.partidas_ganadas || '0'}
                  </div>
                  <div class="form-field" style="${JSON.stringify(obtenerEstiloPosicionTexto('diferenciaOponente', i + 1, 'derecha')).replace(/[{}"]/g, '').replace(/,/g, ';')}">
                    ${siguienteMesa.pareja2?.diferencia || '0'}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }
      
      // Aplicar los estilos y el contenido HTML a la ventana de impresión
      imprimirWindow.document.body.innerHTML = `
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          .print-container {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
          }
          .print-page {
            width: 297mm;
            height: 210mm;
            position: relative;
            page-break-after: always;
          }
          .template-image {
            width: 100%;
            height: 100%;
            object-fit: fill;
          }
          .form-field {
            position: absolute;
            text-align: center;
            font-family: Arial, sans-serif;
            font-size: 10pt;
            color: black;
          }
        </style>
        <div class="print-container" id="print-container">
          ${paginasHTML}
        </div>
      `;
      
      // Esperar un poco y luego imprimir
      setTimeout(() => {
        imprimirWindow.print();
        
        // Cerrar la ventana después de imprimir
        setTimeout(() => {
          imprimirWindow.close();
        }, 1000);
      }, 500);
    };
  } catch (error) {
    console.error('Error al imprimir:', error);
    alert(`Error al imprimir: ${error.message}`);
  }
};

// Función para depurar la impresión (versión de prueba)
const imprimirPrueba = async () => {
  try {
    await cargarDatosImpresion();
    
    console.log("Estado de las mesas para imprimir:");
    console.log(`- Total de mesas: ${mesasParaImprimir.value.length}`);
    console.log(`- Páginas necesarias: ${Math.ceil(mesasParaImprimir.value.length / 2)}`);
    
    // Generar HTML de prueba para cada página
    let htmlDebug = "<div style='padding: 20px; background: #f5f5f5;'>";
    htmlDebug += `<h2>Imprimiendo ${mesasParaImprimir.value.length} mesas en ${Math.ceil(mesasParaImprimir.value.length / 2)} páginas</h2>`;
    
    for (let i = 0; i < mesasParaImprimir.value.length; i += 2) {
      htmlDebug += `<div style='margin: 10px; padding: 10px; border: 1px solid #ccc; background: white;'>`;
      htmlDebug += `<h3>Página ${Math.floor(i/2) + 1}</h3>`;
      htmlDebug += `<div style='display: flex;'>`;
      
      // Primera mesa
      htmlDebug += `<div style='flex: 1; padding: 5px;'>`;
      htmlDebug += `<div>Mesa ${mesasParaImprimir.value[i].id}</div>`;
      htmlDebug += `<div>Pareja1: ${JSON.stringify(mesasParaImprimir.value[i].pareja1)}</div>`;
      htmlDebug += `<div>Pareja2: ${JSON.stringify(mesasParaImprimir.value[i].pareja2)}</div>`;
      htmlDebug += `</div>`;
      
      // Segunda mesa (si existe)
      if (i + 1 < mesasParaImprimir.value.length) {
        htmlDebug += `<div style='flex: 1; padding: 5px;'>`;
        htmlDebug += `<div>Mesa ${mesasParaImprimir.value[i+1].id}</div>`;
        htmlDebug += `<div>Pareja1: ${JSON.stringify(mesasParaImprimir.value[i+1].pareja1)}</div>`;
        htmlDebug += `<div>Pareja2: ${JSON.stringify(mesasParaImprimir.value[i+1].pareja2)}</div>`;
        htmlDebug += `</div>`;
      }
      
      htmlDebug += `</div></div>`;
    }
    
    htmlDebug += "</div>";
    
    // Crear una ventana nueva para ver la depuración
    const debugWindow = window.open('', '_blank');
    if (debugWindow) {
      debugWindow.document.write(htmlDebug);
      debugWindow.document.close();
    } else {
      console.warn("No se pudo abrir la ventana de depuración. Verificar si los popups están bloqueados.");
      console.log(htmlDebug);
    }
    
  } catch (error) {
    console.error('Error en la función de depuración:', error);
  }
};

// Nueva implementación de posicionamiento para el logo
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
    logoCampeonato: lado === 'izquierda' 
      ? { position: 'absolute', top: '140px', left: '370px', width: '25px', height: '25px', padding: '0', margin: '0' }
      : { position: 'absolute', top: '140px', left: '1050px', width: '25px', height: '25px', padding: '0', margin: '0' },
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

  // Caso especial para el logo
  if (tipo === 'logoCampeonato') {
    if (lado === 'izquierda') {
      return { position: 'absolute', top: '140px', left: '373px', width: '25px', height: '25px', padding: '0', margin: '0' };
    } else {
      return { position: 'absolute', top: '140px', left: '1050px', width: '25px', height: '25px', padding: '0', margin: '0' };
    }
  }

  // Retornar el estilo CSS con la posición para los demás casos
  return posiciones[tipo][lado] || {};
};

const closeMenus = (e) => {
  const mesasButton = document.getElementById('mesas-menu-button')
  const mesasDropdown = document.getElementById('mesas-dropdown')
  const resultadosButton = document.getElementById('resultados-menu-button')
  const resultadosDropdown = document.getElementById('resultados-dropdown')

  if (mesasButton && mesasDropdown) {
    if (!mesasButton.contains(e.target) && !mesasDropdown.contains(e.target)) {
      // Cerrar con retraso
      closeTimeout = setTimeout(() => {
        showMesasMenu.value = false
      }, 200)
    }
  }

  if (resultadosButton && resultadosDropdown) {
    if (!resultadosButton.contains(e.target) && !resultadosDropdown.contains(e.target)) {
      // Cerrar con retraso
      closeTimeout = setTimeout(() => {
        showResultadosMenu.value = false
      }, 200)
    }
  }
}

const clearCloseTimeout = () => {
  if (closeTimeout) {
    clearTimeout(closeTimeout)
    closeTimeout = null
  }
}

// Función para actualizar la imagen de plantilla
const actualizarPlantilla = (nuevaUrl) => {
  plantillaImagenUrl.value = nuevaUrl;
  // En un sistema real, aquí guardaríamos la URL en localStorage o en el servidor
  localStorage.setItem('plantilla_mesas_url', nuevaUrl);
  mostrarModalPlantilla.value = false;
};

onMounted(async () => {
  document.addEventListener('click', closeMenus)
  
  // Cargar el campeonato actual al iniciar
  try {
    const data = await campeonatoService.obtenerActual();
    if (data) {
      campeonato.value = data;
      console.log('Campeonato cargado en App.vue:', campeonato.value);
      console.log('Logo del campeonato:', campeonato.value.logo);
      
      // Construir URL completa para el logo si es necesario
      if (campeonato.value.logo && !campeonato.value.logo.startsWith('http')) {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        campeonato.value.logo = `${baseUrl}${campeonato.value.logo.startsWith('/') ? '' : '/'}${campeonato.value.logo}`;
        console.log('URL completa del logo:', campeonato.value.logo);
      }
    }
    
    // Cargar la imagen de plantilla guardada (si existe)
    const plantillaGuardada = localStorage.getItem('plantilla_mesas_url');
    if (plantillaGuardada) {
      plantillaImagenUrl.value = plantillaGuardada;
    }
  } catch (error) {
    console.error('Error al cargar el campeonato:', error);
  }
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenus)
  clearCloseTimeout()
})

// Función para manejar errores de carga del logo
const handleLogoError = (event) => {
  console.error('Error al cargar el logo:', event.target.src);
};
</script>

<template>
  <div class="h-screen flex flex-col">
    <!-- Mostrar solo el contenido de impresión cuando es ventana de impresión -->
    <template v-if="esVentanaImpresion">
      <div id="print-container" style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;">
        <!-- Imprimir todas las mesas, 2 por página -->
        <template v-for="(mesa, index) in mesasParaImprimir" :key="mesa.id">
          <!-- Crear una nueva página cada dos mesas (índices 0, 2, 4, etc.) -->
          <div v-if="index % 2 === 0" :id="`print-page-${Math.floor(index/2)}`" class="print-page" style="position: relative; width: 100%; height: 100%; overflow: hidden; page-break-after: always;">
            <!-- Imagen de fondo del formulario -->
            <div class="print-template-image" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
              <img :src="plantillaImagenUrl" alt="Plantilla de mesas" class="template-image" style="width: 100%; height: 100%; object-fit: fill;" />
              
              <!-- Logo izquierdo -->
              <div style="position: absolute; top: 113px; left: 246px; width: 42px; height: 30px; display: flex; justify-content: center; align-items: center; z-index: 100;">
                <img v-if="campeonato?.logo" 
                     :src="campeonato.logo" 
                     alt="Logo mesa izquierda" 
                     style="max-width: 100%; max-height: 100%; object-fit: contain; object-position: center center; display: block;" 
                     @error="handleLogoError" />
              </div>
              
              <!-- Logo derecho (solo si hay una mesa siguiente) -->
              <div v-if="index + 1 < mesasParaImprimir.length" style="position: absolute; top: 113px; left: 914px; width: 42px; height: 30px; display: flex; justify-content: center; align-items: center; z-index: 100;">
                <img v-if="campeonato?.logo" 
                     :src="campeonato.logo" 
                     alt="Logo mesa derecha" 
                     style="max-width: 100%; max-height: 100%; object-fit: contain; object-position: center center; display: block;" 
                     @error="handleLogoError" />
              </div>
              
              <!-- Datos de la primera mesa (izquierda) -->
              <div class="template-overlay left-side">
                <!-- Nombre del campeonato -->
                <div class="form-field" :style="obtenerEstiloPosicionTexto('nombreCampeonato', index, 'izquierda')">
                  {{ campeonato?.nombre || '' }}
                </div>
                
                <!-- Número de mesa y partida -->
                <div class="form-field" :style="obtenerEstiloPosicionTexto('mesaNumero', index, 'izquierda')">
                  {{ mesa.id }}
                </div>
                <div class="form-field" :style="obtenerEstiloPosicionTexto('partidaNumero', index, 'izquierda')">
                  {{ campeonato?.partida_actual || '' }}
                </div>
                
                <!-- Datos pareja izquierda -->
                <div class="form-field" :style="obtenerEstiloPosicionTexto('posicion', index, 'izquierda')">
                  {{ mesa.pareja1?.ranking_posicion || '-' }}
                </div>
                <div class="form-field" :style="obtenerEstiloPosicionTexto('pg', index, 'izquierda')">
                  {{ mesa.pareja1?.partidas_ganadas || '0' }}
                </div>
                <div class="form-field" :style="obtenerEstiloPosicionTexto('diferencia', index, 'izquierda')">
                  {{ mesa.pareja1?.diferencia || '0' }}
                </div>
                
                <!-- Datos pareja derecha (en la mesa izquierda) -->
                <div class="form-field" :style="obtenerEstiloPosicionTexto('posicionOponente', index, 'izquierda')">
                  {{ mesa.pareja2?.ranking_posicion || '-' }}
                </div>
                <div class="form-field" :style="obtenerEstiloPosicionTexto('pgOponente', index, 'izquierda')">
                  {{ mesa.pareja2?.partidas_ganadas || '0' }}
                </div>
                <div class="form-field" :style="obtenerEstiloPosicionTexto('diferenciaOponente', index, 'izquierda')">
                  {{ mesa.pareja2?.diferencia || '0' }}
                </div>
              </div>
              
              <!-- Datos de la segunda mesa (derecha) -->
              <div v-if="index + 1 < mesasParaImprimir.length" class="template-overlay right-side">
                <!-- Nombre del campeonato -->
                <div class="form-field" :style="obtenerEstiloPosicionTexto('nombreCampeonato', index + 1, 'derecha')">
                  {{ campeonato?.nombre || '' }}
                </div>
                
                <!-- Número de mesa y partida -->
                <div class="form-field" :style="obtenerEstiloPosicionTexto('mesaNumero', index + 1, 'derecha')">
                  {{ mesasParaImprimir[index + 1].id }}
                </div>
                <div class="form-field" :style="obtenerEstiloPosicionTexto('partidaNumero', index + 1, 'derecha')">
                  {{ campeonato?.partida_actual || '' }}
                </div>
                
                <!-- Datos pareja izquierda (en la mesa derecha) -->
                <div class="form-field" :style="obtenerEstiloPosicionTexto('posicion', index + 1, 'derecha')">
                  {{ mesasParaImprimir[index + 1].pareja1?.ranking_posicion || '-' }}
                </div>
                <div class="form-field" :style="obtenerEstiloPosicionTexto('pg', index + 1, 'derecha')">
                  {{ mesasParaImprimir[index + 1].pareja1?.partidas_ganadas || '0' }}
                </div>
                <div class="form-field" :style="obtenerEstiloPosicionTexto('diferencia', index + 1, 'derecha')">
                  {{ mesasParaImprimir[index + 1].pareja1?.diferencia || '0' }}
                </div>
                
                <!-- Datos pareja derecha (en la mesa derecha) -->
                <div class="form-field" :style="obtenerEstiloPosicionTexto('posicionOponente', index + 1, 'derecha')">
                  {{ mesasParaImprimir[index + 1].pareja2?.ranking_posicion || '-' }}
                </div>
                <div class="form-field" :style="obtenerEstiloPosicionTexto('pgOponente', index + 1, 'derecha')">
                  {{ mesasParaImprimir[index + 1].pareja2?.partidas_ganadas || '0' }}
                </div>
                <div class="form-field" :style="obtenerEstiloPosicionTexto('diferenciaOponente', index + 1, 'derecha')">
                  {{ mesasParaImprimir[index + 1].pareja2?.diferencia || '0' }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>
    
    <!-- Interfaz normal cuando no es ventana de impresión -->
    <template v-else>
      <!-- Navegación Horizontal -->
      <nav class="bg-white shadow-sm fixed w-full z-10 pt-3">
        <div class="max-w-7xl mx-auto px-4">
          <div class="flex justify-between h-20">
            <!-- Logo y enlaces izquierdos -->
            <div class="flex">
              <div class="flex-shrink-0 flex items-center">
                <!-- Logo del campeonato si existe -->
                <div v-if="campeonato && campeonato.logo" class="mr-3 h-18 w-18 flex items-center justify-center">
                  <img 
                    :src="campeonato.logo" 
                    alt="Logo del campeonato"
                    style="height: 78px; max-width: 78px; object-fit: contain; display: block;"
                    @error="handleLogoError"
                    @load="() => console.log('Logo cargado correctamente')"
                  />
                </div>
                <!-- Debug info -->
                <div v-if="false" class="text-xs">
                  Logo URL: {{ campeonato?.logo }}
                </div>
                <h1 class="text-xl font-bold text-gray-900">Domino App</h1>
              </div>
              <div class="hidden sm:ml-6 sm:flex sm:space-x-8 items-center">
                <router-link 
                  to="/" 
                  class="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-gray-900"
                  :class="{ 'border-b-2 border-gray-900': $route.path === '/' }"
                >
                  Inicio
                </router-link>
              </div>
            </div>

            <!-- Enlaces derechos -->
            <div class="hidden sm:ml-6 sm:flex sm:items-center">
              <router-link 
                to="/parejas" 
                class="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-gray-900 mr-16"
                :class="{ 'border-b-2 border-gray-900': $route.path.startsWith('/parejas') }"
              >
                Parejas
              </router-link>

              <!-- Menú desplegable de Mesas -->
              <div class="relative mr-16">
                <button 
                  id="mesas-menu-button"
                  @click="showMesasMenu = !showMesasMenu"
                  @mouseenter="showMesasMenu = true"
                  class="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-gray-900"
                >
                  <span>Mesas</span>
                  <svg 
                    class="ml-2 w-5 h-5 transition-transform duration-200"
                    :class="{ 'transform rotate-180': showMesasMenu }"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div 
                  id="mesas-dropdown"
                  v-show="showMesasMenu" 
                  @mouseenter="clearCloseTimeout"
                  @mouseleave="closeMenus"
                  class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                >
                  <div class="py-1">
                    <router-link 
                      to="/mesas/asignacion" 
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      :class="{ 'bg-gray-100': $route.path === '/mesas/asignacion' }"
                      @click="showMesasMenu = false"
                    >
                      Asignación
                    </router-link>
                    <router-link 
                      to="/mesas/registro" 
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      :class="{ 'bg-gray-100': $route.path === '/mesas/registro' }"
                      @click="showMesasMenu = false"
                    >
                      Registro
                    </router-link>
                    <router-link 
                      to="/mesas/asignacion" 
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      :class="{ 'bg-gray-100': $route.path === '/mesas/asignacion' }"
                      @click="showMesasMenu = false; imprimir()"
                    >
                      Imprimir
                    </router-link>
                    <button 
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      @click="showMesasMenu = false; mostrarModalPlantilla = true"
                    >
                      Configurar Plantilla
                    </button>
                  </div>
                </div>
              </div>

              <!-- Menú desplegable de Resultados -->
              <div class="relative">
                <button 
                  id="resultados-menu-button"
                  @click="showResultadosMenu = !showResultadosMenu"
                  @mouseenter="showResultadosMenu = true"
                  class="inline-flex items-center px-1 pt-1 text-gray-700 hover:text-gray-900"
                >
                  <span>Resultados</span>
                  <svg 
                    class="ml-2 w-5 h-5 transition-transform duration-200"
                    :class="{ 'transform rotate-180': showResultadosMenu }"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div 
                  id="resultados-dropdown"
                  v-show="showResultadosMenu" 
                  @mouseenter="clearCloseTimeout"
                  @mouseleave="closeMenus"
                  class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                >
                  <div class="py-1">
                    <router-link 
                      to="/resultados" 
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      :class="{ 'bg-gray-100': $route.path === '/resultados' }"
                      @click="showResultadosMenu = false"
                    >
                      Ranking
                    </router-link>
                    <router-link 
                      to="/podium" 
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      :class="{ 'bg-gray-100': $route.path === '/podium' }"
                      @click="showResultadosMenu = false"
                    >
                      Podium
                    </router-link>
                    <router-link 
                      to="/ranking" 
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      :class="{ 'bg-gray-100': $route.path === '/ranking' }"
                      @click="showResultadosMenu = false"
                    >
                      Ranking Completo
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Contenido Principal -->
      <div class="pt-24">
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <router-view></router-view>
        </main>
      </div>

      <!-- Modal para configurar la plantilla de impresión -->
      <div v-if="mostrarModalPlantilla" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg">
          <div class="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-medium">Configurar Plantilla de Impresión</h3>
            <button @click="mostrarModalPlantilla = false" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-4">
            <PlantillaImagenConfig 
              :imagen-url-actual="plantillaImagenUrl" 
              @actualizar-plantilla="actualizarPlantilla"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style>
/* Estilos básicos */
body {
  margin: 0;
  padding: 0;
}

/* Estilos específicos para modo impresión cuando es una ventana de impresión */
.print-page {
  width: 297mm;
  height: 210mm;
  position: relative;
  page-break-after: always;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.template-image {
  width: 100%;
  height: 100%;
  object-fit: fill;
}

.form-field {
  position: absolute;
  text-align: center;
  font-family: Arial, sans-serif;
  font-size: 10pt;
  color: black;
}

/* Estilos para ventanas normales */
@media not print {
  .print-only {
    display: none !important;
  }
}

/* Estilos específicos para impresión */
@media print {
  /* Ocultar todo menos el contenido de impresión */
  body {
    margin: 0 !important;
    padding: 0 !important;
  }
  
  /* Configuración básica de página sin márgenes */
  @page {
    size: A4 landscape;
    margin: 0cm;
  }
  
  /* Ajustes específicos para ventanas de impresión */
  .print-page {
    width: 297mm;
    height: 210mm;
    page-break-after: always;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  /* Último elemento sin salto de página */
  .print-page:last-child {
    page-break-after: auto;
  }
}
</style>
