<template>
  <!-- Contenido normal -->
  <div class="screen-only container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Asignación de Mesas</h1>
        <h2 class="text-lg text-gray-600">{{ campeonato?.nombre || 'Cargando...' }}</h2>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-xl font-semibold text-gray-800">
          Partida {{ campeonato?.partida_actual || 1 }}
        </div>
      </div>
    </div>

    <!-- Tabla de asignación -->
    <div class="flex-grow flex flex-col">
      <div class="h-[calc(15*2.5rem)] overflow-auto bg-white shadow-lg rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50 sticky top-0">
            <tr>
              <th class="px-0.5 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Nº Pareja</th>
              <th class="px-0.5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Pareja</th>
              <th class="px-0.5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
              <th class="px-0.5 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Mesa</th>
              <th class="px-0.5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(pareja, index) in parejasVisibles" :key="pareja.id" :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
              <td class="px-0.5 py-2 whitespace-nowrap text-sm text-gray-900 text-center">{{ pareja.numero }}</td>
              <td class="px-0.5 py-2 whitespace-nowrap text-sm text-gray-900">{{ pareja.nombre }}</td>
              <td class="px-0.5 py-2 whitespace-nowrap text-sm text-gray-900">{{ pareja.club_pertenencia }}</td>
              <td class="px-0.5 py-2 whitespace-nowrap text-sm text-gray-900 text-center">{{ pareja.mesa }}</td>
              <td class="px-0.5 py-2 whitespace-nowrap text-sm">
                <span :class="pareja.activa ? 'text-green-600' : 'text-red-600'">
                  {{ pareja.activa ? 'Activa' : 'Inactiva' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-6 py-3 bg-gray-50 text-center text-sm text-gray-600 border-t">
        Página {{ paginaActual + 1 }} de {{ totalPaginas }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { campeonatoService, mesaService, parejaService, resultadoService } from '../services/api';
import { useResultadoStore } from '../stores/resultado';

const campeonato = ref(null);
const parejasMesas = ref([]);
const error = ref(null);
const paginaActual = ref(0);
const intervalId = ref(null);
const PAREJAS_POR_PAGINA = 15; // Número de parejas a mostrar por página
const INTERVALO_CAMBIO = 10000; // 10 segundos en milisegundos

const resultadoStore = useResultadoStore();
const resultados = ref([]);

// Calcular el número total de páginas basado en la cantidad de parejas
const totalPaginas = computed(() => {
  return Math.ceil(parejasMesas.value.length / PAREJAS_POR_PAGINA);
});

// Obtener las parejas visibles en la página actual
const parejasVisibles = computed(() => {
  const inicio = paginaActual.value * PAREJAS_POR_PAGINA;
  const fin = inicio + PAREJAS_POR_PAGINA;
  return parejasMesas.value.slice(inicio, fin);
});

// Cambiar a la siguiente página o volver al inicio si estamos en la última
const cambiarPagina = () => {
  const maxPagina = totalPaginas.value - 1;
  if (paginaActual.value >= maxPagina) {
    paginaActual.value = 0; // Volver a la primera página
  } else {
    paginaActual.value++; // Ir a la siguiente página
  }
};

// Iniciar el intervalo para cambiar páginas automáticamente
const iniciarRotacionPaginas = () => {
  detenerRotacionPaginas(); // Primero detener cualquier intervalo existente
  if (totalPaginas.value > 1) {
    // Solo iniciar rotación si hay más de una página
    console.log('Iniciando rotación automática de páginas cada 10 segundos');
    intervalId.value = setInterval(cambiarPagina, INTERVALO_CAMBIO);
  }
};

// Detener el intervalo de rotación de páginas
const detenerRotacionPaginas = () => {
  if (intervalId.value) {
    console.log('Deteniendo rotación automática de páginas');
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
};

// Observar cambios en las parejas para reiniciar la rotación cuando cambian los datos
watch(parejasMesas, () => {
  // Si cambia el conjunto de parejas, reiniciar la paginación
  if (document.visibilityState === 'visible') {
    iniciarRotacionPaginas();
  }
}, { deep: true });

const mesasParaImprimir = computed(() => {
  if (!parejasMesas.value?.length || !campeonato.value) return [];
  
  const mesasCompletas = [];
  const mesas = new Map();

  // Obtener el ranking ordenado
  const rankingOrdenado = [...parejasMesas.value].sort((a, b) => {
    // Si es la primera partida (después del sorteo), ordenar según las mesas
    if (campeonato.value?.partida_actual === 1) {
      // Obtener los números de mesa
      const mesaA = Number(a.mesa);
      const mesaB = Number(b.mesa);
      
      if (mesaA === mesaB) {
        // Si están en la misma mesa, la pareja1 va primero (menor ID)
        return a.id - b.id;
      }
      // Ordenar por número de mesa
      return mesaA - mesaB;
    }

    // Para el resto de partidas, ordenar por criterios de ranking
    // Primero por GB (A antes que B)
    const aGB = a.gb ? 1 : 0;
    const bGB = b.gb ? 1 : 0;
    if (aGB !== bGB) return aGB - bGB;
    
    // Obtener todos los resultados de cada pareja
    const resultadosA = resultados.value?.filter(r => r.pareja_id === a.id) || [];
    const resultadosB = resultados.value?.filter(r => r.pareja_id === b.id) || [];
    
    // Calcular totales
    const aPG = resultadosA.reduce((sum, r) => sum + (r.pg || 0), 0);
    const bPG = resultadosB.reduce((sum, r) => sum + (r.pg || 0), 0);
    const aPP = resultadosA.reduce((sum, r) => sum + (r.pp || 0), 0);
    const bPP = resultadosB.reduce((sum, r) => sum + (r.pp || 0), 0);
    const aRT = resultadosA.reduce((sum, r) => sum + (r.rt || 0), 0);
    const bRT = resultadosB.reduce((sum, r) => sum + (r.rt || 0), 0);
    const aMG = resultadosA.reduce((sum, r) => sum + (r.mg || 0), 0);
    const bMG = resultadosB.reduce((sum, r) => sum + (r.mg || 0), 0);
    
    // Comparar en orden:
    // 1. PG (descendente)
    if (aPG !== bPG) return bPG - aPG;
    
    // 2. PP (descendente)
    if (aPP !== bPP) return bPP - aPP;
    
    // 3. RT (descendente)
    if (aRT !== bRT) return bRT - aRT;
    
    // 4. MG (ascendente)
    if (aMG !== bMG) return aMG - bMG;
    
    // Si todo es igual, ordenar por ID
    return a.id - b.id;
  });

  // Crear mapa de posiciones
  const posiciones = new Map();
  let posicionA = 1;
  let posicionB = 1;
  rankingOrdenado.forEach((pareja, index) => {
    // En la primera partida, la posición es el orden del sorteo
    if (campeonato.value?.partida_actual === 1) {
      posiciones.set(pareja.id, index + 1);
    } else {
      // Para el resto de partidas, calcular posiciones por grupo
      if (pareja.gb && !rankingOrdenado[index - 1]?.gb) {
        posicionB = 1;
        posiciones.set(pareja.id, posicionB);
      } else if (pareja.gb) {
        posiciones.set(pareja.id, posicionB);
        posicionB++;
      } else {
        posiciones.set(pareja.id, posicionA);
        posicionA++;
      }
    }
  });
  
  // Primero, agrupar las parejas por mesa
  parejasMesas.value.forEach(pareja => {
    if (pareja?.mesa && pareja.mesa !== '-') {
      if (!mesas.has(pareja.mesa)) {
        mesas.set(pareja.mesa, {
          id: pareja.mesa,
          parejas: []
        });
      }
      
      const resultadosPareja = resultados.value?.filter(r => r.pareja_id === pareja.id) || [];
      const pg = resultadosPareja.reduce((sum, r) => sum + (r.pg || 0), 0);
      const pp = resultadosPareja.reduce((sum, r) => sum + (r.pp || 0), 0);
      const gb = resultadosPareja.some(r => r.gb) || false;
      
      mesas.get(pareja.mesa).parejas.push({
        id: pareja.id,
        nombre: pareja.nombre || '',
        pg: pg,
        pp: pp,
        gb: gb,
        posicion: posiciones.get(pareja.id)
      });
    }
  });

  // Filtrar solo las mesas con exactamente 2 parejas y ordenar las parejas por posición
  mesas.forEach((mesa, id) => {
    if (mesa.parejas.length === 2) {
      // Ordenar las parejas: ranking superior (posición más baja) a la izquierda
      mesa.parejas.sort((a, b) => {
        // Si ambas son del mismo grupo (A o B), ordenar por posición
        if (a.gb === b.gb) {
          return b.posicion - a.posicion; // Posición más baja (mejor ranking) va a la izquierda
        }
        // Si son de grupos diferentes, la del grupo A va primero
        return a.gb ? 1 : -1;
      });

      mesasCompletas.push({
        id: id,
        pareja1: mesa.parejas[0], // Ranking superior (Pos 1) a la izquierda
        pareja2: mesa.parejas[1]  // Ranking inferior (Pos 2) a la derecha
      });
    }
  });

  // Ordenar por número de mesa
  return mesasCompletas.sort((a, b) => Number(a.id) - Number(b.id));
});

const cargarDatos = async () => {
  try {
    campeonato.value = await campeonatoService.obtenerActual();
    if (!campeonato.value) {
      error.value = 'No hay campeonato activo';
      return;
    }

    const parejas = await parejaService.obtenerParejas(campeonato.value.id);
    const mesas = await mesaService.obtenerMesas(
      campeonato.value.id,
      campeonato.value.partida_actual
    );
    const resultadosData = await resultadoService.obtenerResultadosCampeonato(campeonato.value.id);
    resultados.value = resultadosData;

    const mesaPorPareja = new Map();
    mesas.forEach(mesa => {
      if (mesa.pareja1_id) mesaPorPareja.set(mesa.pareja1_id, mesa.id);
      if (mesa.pareja2_id) mesaPorPareja.set(mesa.pareja2_id, mesa.id);
    });

    parejasMesas.value = parejas
      .map(pareja => ({
        id: pareja.id,
        numero: pareja.id,
        nombre: pareja.nombre,
        club_pertenencia: pareja.club_pertenencia,
        mesa: mesaPorPareja.get(pareja.id) || '-',
        activa: pareja.activa
      }))
      .sort((a, b) => a.id - b.id);

    // Reiniciar a la primera página cuando se cargan nuevos datos
    paginaActual.value = 0;
    // Iniciar la rotación automática de páginas
    iniciarRotacionPaginas();

  } catch (e) {
    console.error('Error al cargar los datos:', e);
    error.value = 'Error al cargar los datos';
  }
};

onMounted(() => {
  cargarDatos(); // Cargar datos iniciales
  
  // Iniciar o detener la rotación según la visibilidad de la página
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Reiniciar rotación cuando la página se hace visible
      iniciarRotacionPaginas();
    } else {
      // Detener rotación cuando la página no es visible
      detenerRotacionPaginas();
    }
  });
});

onUnmounted(() => {
  // Limpiar intervalo y evento al desmontar el componente
  detenerRotacionPaginas();
  document.removeEventListener('visibilitychange', () => {});
});
</script>

<style>
@media print {
  @page {
    size: A4 landscape;
    margin: 0;
  }

  /* Ocultar contenido de pantalla */
  .screen-only {
    display: none !important;
  }

  /* Contenedor principal de impresión */
  .print-only {
    display: block !important;
  }

  /* Página de impresión */
  .print-page {
    width: 297mm;
    height: 210mm;
    display: flex;
    justify-content: space-between;
    padding: 15mm 15mm;
    box-sizing: border-box;
    background: white;
    page-break-after: always;
  }

  /* Contenedor de mesa */
  .mesa-wrapper {
    width: 128.5mm;
    height: 180mm;
    background: white;
  }

  /* Contenedor interno de mesa */
  .mesa-container {
    height: 100%;
    width: 128.5mm;
    border: 1px solid #000;
    display: flex;
    flex-direction: column;
  }

  /* Cabecera */
  .border-b.border-black.p-4 {
    border-bottom: 1px solid #000;
    padding: 4mm;
    height: 25mm;
  }

  /* Contenedor principal de las parejas */
  .flex.flex-1.relative {
    display: flex;
    height: calc(100% - 25mm);
    width: 128.5mm;
  }

  /* Mitades izquierda y derecha */
  .w-1\/2 {
    width: 64.25mm;
    min-width: 64.25mm;
    max-width: 64.25mm;
    display: flex;
    flex-direction: column;
  }

  /* Información de pareja */
  .border.border-black.p-2 {
    width: 64.25mm;
    min-width: 64.25mm;
    max-width: 64.25mm;
    border: 1px solid #000;
    padding: 2mm;
    box-sizing: border-box;
  }

  /* Líneas numeradas */
  .border.border-black.flex-1.p-2 {
    width: 64.25mm;
    min-width: 64.25mm;
    max-width: 64.25mm;
    flex: 1;
    border: 1px solid #000;
    padding: 2mm;
    box-sizing: border-box;
  }

  /* Total y espacio final */
  .mt-2 {
    width: 64.25mm;
    min-width: 64.25mm;
    max-width: 64.25mm;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .border.border-black.p-2 {
    width: 64.25mm;
    min-width: 64.25mm;
    max-width: 64.25mm;
    border: 1px solid #000;
    padding: 2mm;
    box-sizing: border-box;
  }

  .espacio-final {
    flex: 1;
    display: flex;
    border: 1px solid #000;
    border-top: none;
    min-height: 25mm;
  }

  .recuadro-firma {
    width: 100%;
    height: 100%;
    padding: 2mm;
    font-weight: bold;
  }

  /* Ajustes para nombres largos */
  .jugador-nombre {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: calc(64.25mm - 4mm); /* Ancho total menos padding */
    display: inline-block;
  }

  .jugador-linea {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 2mm;
    min-height: 12pt;
    max-height: 12pt;
    overflow: hidden;
  }

  .stats-container {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .posicion {
    flex: 0 0 auto;
    margin-left: 2mm;
  }

  .stats {
    flex: 0 0 40pt;
    display: flex;
    gap: 2mm;
    justify-content: flex-end;
  }

  .nombre-pareja {
    display: flex;
    flex-direction: column;
    gap: 0.5mm;
  }
}

/* Estilos normales */
.print-only {
  display: none;
}

.screen-only {
  display: block;
}
</style> 