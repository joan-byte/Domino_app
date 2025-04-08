<template>
  <div class="min-h-screen flex flex-col">
    <div class="container mx-auto px-4 py-6 flex-grow flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Ranking</h1>
          <h2 class="text-lg text-gray-600">{{ campeonato?.nombre || 'Cargando...' }}</h2>
        </div>
        <div class="text-xl font-semibold text-gray-800">
          Partida {{ campeonato?.partida_actual ?? 0 }} de {{ campeonato?.numero_partidas }}
        </div>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="flex-grow flex justify-center items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>

      <!-- Mensaje de error -->
      <div v-else-if="error" class="flex-grow flex flex-col justify-center items-center">
        <div class="text-red-600">{{ error }}</div>
        <button @click="cargarRanking" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Reintentar
        </button>
      </div>

      <!-- Mensaje cuando no hay datos -->
      <div v-else-if="!ranking?.length" class="flex-grow flex justify-center items-center text-gray-600">
        No hay datos de ranking disponibles
      </div>

      <!-- Tabla de Ranking -->
      <div v-else class="flex-grow flex flex-col">
        <div class="h-[calc(15*2.5rem+3.5rem)] overflow-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-0.5 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posi
                </th>
                <th class="px-0.5 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Part.
                </th>
                <th class="px-0.5 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GB
                </th>
                <th class="px-0.5 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PG
                </th>
                <th class="px-0.5 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dif Ultim. Part
                </th>
                <th class="px-0.5 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dif.
                </th>
                <th class="px-0.5 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pareja
                </th>
                <th class="px-0.5 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th class="px-0.5 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider flex-grow">
                  Club
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(pareja, index) in parejasVisibles" :key="pareja.numero" 
                  :class="{'bg-gray-50': index % 2 === 0}">
                <td class="px-0.5 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                  {{ index + 1 + (paginaActual * PAREJAS_POR_PAGINA) }}
                </td>
                <td class="px-0.5 py-2 whitespace-nowrap text-sm text-center" :class="{
                  'text-gray-900': pareja.ultima_partida === campeonato?.partida_actual,
                  'text-red-600': pareja.ultima_partida < campeonato?.partida_actual
                }">
                  {{ pareja.ultima_partida }}
                </td>
                <td class="px-0.5 py-2 whitespace-nowrap text-sm text-center">
                  <span class="text-sm font-medium">
                    {{ pareja.gb ? 'B' : 'A' }}
                  </span>
                </td>
                <td class="px-0.5 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                  {{ pareja.pg || 0 }}
                </td>
                <td class="px-0.5 py-2 whitespace-nowrap text-sm text-center" :class="{
                  'text-red-600': pareja.ultima_partida < campeonato?.partida_actual,
                  'text-gray-900': pareja.ultima_partida === campeonato?.partida_actual
                }">
                  <span v-if="pareja.ultima_partida < campeonato?.partida_actual">-----</span>
                  <template v-else>
                    <!-- Mostrar la ecuación y solo el resultado en rojo si es negativo -->
                    <span v-html="obtenerFormulaDiferencia(pareja)"></span>
                  </template>
                </td>
                <td class="px-0.5 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                  {{ pareja.pp }}
                </td>
                <td class="px-0.5 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                  {{ pareja.numero }}
                </td>
                <td class="px-0.5 py-2 text-sm text-gray-900 text-center">
                  {{ pareja.nombre }}
                </td>
                <td class="px-0.5 py-2 text-sm text-gray-500 text-center">
                  {{ pareja.club || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Indicador de página -->
        <div class="px-6 py-3 bg-gray-50 text-center text-sm text-gray-600 border-t">
          Página {{ paginaActual + 1 }} de {{ totalPaginas }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useCampeonatoStore } from '../stores/campeonato';
import { useResultadoStore } from '../stores/resultado';
import { resultadoService } from '../services/api';
import { useRoute } from 'vue-router';
import { mesaService } from '../services/api';

const campeonatoStore = useCampeonatoStore();
const resultadoStore = useResultadoStore();
const route = useRoute();

const { campeonato } = storeToRefs(campeonatoStore);
const { ranking } = storeToRefs(resultadoStore);

const loading = ref(false);
const error = ref(null);
// Almacenar los resultados de la última partida (necesario para la nueva columna)
const resultadosUltimaPartida = ref([]);

const PAREJAS_POR_PAGINA = 15;
const INTERVALO_CAMBIO = 10000; // 10 segundos
const INTERVALO_RECARGA = 10000; // 10 segundos para recargar datos

const paginaActual = ref(0);
const intervalId = ref(null);
const intervalRecargaId = ref(null);

// Función para verificar si la diferencia es negativa
const esDiferenciaNegativa = (pareja) => {
  // Buscar resultado por ID o numero de pareja
  const parejaId = pareja.id || pareja.numero;
  
  // Buscar el resultado para esta pareja
  const resultado = resultadosUltimaPartida.value.find(r => r.pareja_id == parejaId);
  if (!resultado) return false;
  
  const mesaId = resultado.mesa_id;
  
  // Buscar todas las parejas en esta mesa
  const parejasMesa = resultadosUltimaPartida.value.filter(r => r.mesa_id == mesaId);
  if (parejasMesa.length !== 2) return false;
  
  // Obtener la pareja contraria
  const resultadoContrario = parejasMesa.find(r => r.pareja_id != parejaId);
  if (!resultadoContrario) return false;
  
  // Determinar qué campo usar para los puntos
  let puntosPareja = 0;
  let puntosContraria = 0;
  let campoEncontrado = false;
  
  // Comprobar estos campos en orden de prioridad
  const campos = ['puntos', 'rt', 'rt_partida', 'puntos_totales', 'puntos_pareja'];
  
  for (const campo of campos) {
    if (resultado[campo] !== undefined && resultadoContrario[campo] !== undefined) {
      puntosPareja = parseInt(resultado[campo]);
      puntosContraria = parseInt(resultadoContrario[campo]);
      campoEncontrado = true;
      break;
    }
  }
  
  if (!campoEncontrado) return false;
  
  // Calcular la diferencia y verificar si es negativa
  const diferencia = puntosPareja - puntosContraria;
  return diferencia < 0;
};

// Función para obtener la fórmula de diferencia con el valor final posiblemente en rojo
const obtenerFormulaDiferencia = (pareja) => {
  const resultado = calcularDiferencia(pareja);
  
  if (resultado.tipo === 'error') {
    return resultado.valor;
  }
  
  // Caso especial: Pareja jugó sola
  if (resultado.tipo === 'solo') {
    return `${resultado.diferencia} - 0 = ${resultado.diferencia}`;
  }
  
  // Construir la fórmula con formato HTML para mostrar solo la diferencia en rojo cuando es negativa
  const puntosPareja = resultado.puntosPareja;
  const puntosContraria = resultado.puntosContraria;
  const diferencia = resultado.diferencia;
  
  if (diferencia < 0) {
    // Mostrar solo la diferencia en rojo
    return `${puntosPareja} - ${puntosContraria} = <span class="text-red-600">${diferencia}</span>`;
  } else {
    // Mostrar todo en el color normal
    return `${puntosPareja} - ${puntosContraria} = ${diferencia}`;
  }
};

// Función auxiliar que calcula la diferencia y devuelve un objeto con los datos
const calcularDiferencia = (pareja) => {
  // Si la pareja no tiene la partida actual, error
  if (pareja.ultima_partida < campeonato.value?.partida_actual) {
    return { tipo: 'error', valor: "-----" };
  }
  
  // Si no hay resultados cargados, error
  if (!resultadosUltimaPartida.value || resultadosUltimaPartida.value.length === 0) {
    return { tipo: 'error', valor: "-----" };
  }
  
  // Buscar resultado por ID o numero de pareja
  const parejaId = pareja.id || pareja.numero;
  
  // Buscar el resultado para esta pareja
  const resultado = resultadosUltimaPartida.value.find(r => {
    return r.pareja_id == parejaId;
  });
  
  if (!resultado) {
    return { tipo: 'error', valor: "-----" };
  }
  
  // Mostrar detalle del resultado para depuración
  console.log(`Detalle de resultado pareja ${parejaId}:`, resultado);
  
  const mesaId = resultado.mesa_id;
  
  // Buscar todas las parejas en esta mesa
  const parejasMesa = resultadosUltimaPartida.value.filter(r => r.mesa_id == mesaId);
  
  // Caso especial: Mesa con una sola pareja
  if (parejasMesa.length === 1 && parejasMesa[0].pareja_id == parejaId) {
    // RP está limitado por PM (Puntuación Máxima)
    const pm = campeonato.value?.pm || 300;
    const rp = Math.min(resultado.rt, pm);
    console.log(`Pareja ${parejaId} jugó sola. RP = ${rp}`);
    return {
      tipo: 'solo',
      diferencia: rp // La diferencia es su propio RP
    };
  }
  
  // Si no hay exactamente 2 parejas en la mesa (y no es el caso de una sola), error
  if (parejasMesa.length !== 2) {
    return { tipo: 'error', valor: "-----" };
  }
  
  // Obtener la pareja contraria
  const resultadoContrario = parejasMesa.find(r => r.pareja_id != parejaId);
  
  if (!resultadoContrario) {
    return { tipo: 'error', valor: "-----" };
  }
  
  // Mostrar detalle del resultado contrario para depuración
  console.log(`Detalle de resultado contrario:`, resultadoContrario);
  
  // Determinar qué campo usar para los puntos
  let puntosPareja = 0;
  let puntosContraria = 0;
  let campoUsado = null;
  
  // Comprobar estos campos en orden de prioridad (RP primero)
  // Se priorizan los campos que tienen "partida" en su nombre o "rp"
  const campos = ['rp', 'rp_partida', 'puntos_partida', 'rt_partida', 'puntos', 'rt', 'puntos_totales', 'puntos_pareja'];
  
  for (const campo of campos) {
    if (resultado[campo] !== undefined && resultadoContrario[campo] !== undefined) {
      puntosPareja = parseInt(resultado[campo]);
      puntosContraria = parseInt(resultadoContrario[campo]);
      campoUsado = campo;
      console.log(`Usando campo '${campo}' para los puntos: ${puntosPareja} vs ${puntosContraria}`);
      break;
    }
  }
  
  // Si no encontramos ningún campo específico, verificar si existe alguna propiedad con "rp" en su nombre
  if (!campoUsado) {
    const camposResultado = Object.keys(resultado);
    const posibleCampoRP = camposResultado.find(campo => 
      campo.toLowerCase().includes('rp') || 
      campo.toLowerCase().includes('partida')
    );
    
    if (posibleCampoRP && resultado[posibleCampoRP] !== undefined && resultadoContrario[posibleCampoRP] !== undefined) {
      puntosPareja = parseInt(resultado[posibleCampoRP]);
      puntosContraria = parseInt(resultadoContrario[posibleCampoRP]);
      campoUsado = posibleCampoRP;
      console.log(`Encontrado campo alternativo '${posibleCampoRP}': ${puntosPareja} vs ${puntosContraria}`);
    }
  }
  
  if (!campoUsado) {
    console.error("No se encontró un campo RP válido para los puntos de partida");
    // Como último recurso, imprimir todas las propiedades para depuración
    console.log("Todas las propiedades de resultado:", resultado);
    return { tipo: 'error', valor: "-----" };
  }
  
  // Calcular la diferencia
  const diferencia = puntosPareja - puntosContraria;
  
  // Verificar en los datos si hay un campo de diferencia pre-calculado
  let diferenciaPreCalculada = null;
  const camposDiferencia = ['pp_partida', 'dif_partida', 'diferencia_partida'];
  
  for (const campo of camposDiferencia) {
    if (resultado[campo] !== undefined) {
      diferenciaPreCalculada = parseInt(resultado[campo]);
      console.log(`Encontrado campo de diferencia pre-calculada '${campo}': ${diferenciaPreCalculada}`);
      break;
    }
  }
  
  // Si encontramos una diferencia pre-calculada y no coincide con nuestra diferencia calculada, usar la pre-calculada
  if (diferenciaPreCalculada !== null && diferenciaPreCalculada !== diferencia) {
    console.log(`AVISO: La diferencia calculada (${diferencia}) no coincide con la diferencia pre-calculada (${diferenciaPreCalculada}). Usando la pre-calculada.`);
    return {
      tipo: 'datos',
      puntosPareja,
      puntosContraria,
      diferencia: diferenciaPreCalculada,
      campoUsado
    };
  }
  
  // Devolver un objeto con todos los valores calculados
  return {
    tipo: 'datos',
    puntosPareja,
    puntosContraria,
    diferencia,
    campoUsado
  };
};

const sortedRanking = computed(() => {
  if (!ranking.value || !Array.isArray(ranking.value)) {
    console.error('ranking.value no es un array o es null:', ranking.value);
    return [];
  }
  
  return [...ranking.value].sort((a, b) => {
    // Aplicar los criterios en orden:
    // 1. GB ascendente (grupo A antes que B)
    const aGB = a.gb ? 1 : 0;
    const bGB = b.gb ? 1 : 0;
    if (aGB !== bGB) return aGB - bGB;

    // 2. PG total descendente (sumatorio de Partidas Ganadas)
    const aPG = a.pg || 0;
    const bPG = b.pg || 0;
    if (aPG !== bPG) return bPG - aPG;

    // 3. PP/Dif total descendente (sumatorio de Diferencia)
    const aPP = a.pp || 0;
    const bPP = b.pp || 0;
    if (aPP !== bPP) return bPP - aPP;

    // 4. RT/PT total descendente (sumatorio de Puntos Totales)
    const aRT = a.rt || 0;
    const bRT = b.rt || 0;
    if (aRT !== bRT) return bRT - aRT;

    // 5. MG total ascendente (sumatorio de Manos Ganadas)
    const aMG = a.mg || 0;
    const bMG = b.mg || 0;
    if (aMG !== bMG) return aMG - bMG;

    // 6. Si todo es igual, mantener el orden del sorteo inicial como desempate
    return (a.ordenSorteo || 0) - (b.ordenSorteo || 0);
  });
});

const parejasVisibles = computed(() => {
  const sorted = sortedRanking.value;
  
  if (!sorted || !Array.isArray(sorted)) {
    console.error('sortedRanking no es un array o es null:', sorted);
    return [];
  }
  
  const inicio = paginaActual.value * PAREJAS_POR_PAGINA;
  const parejas = sorted.slice(inicio, inicio + PAREJAS_POR_PAGINA);
  return parejas;
});

// Funciones para la paginación
const cambiarPagina = () => {
  if (totalPaginas.value > 1) {
    // Si estamos en la última página, volver a la primera
    if (paginaActual.value >= totalPaginas.value - 1) {
      paginaActual.value = 0;
    } else {
      paginaActual.value++;
    }
  }
};

const iniciarRotacionPaginas = () => {
  // Detener el intervalo existente si hay uno
  detenerRotacionPaginas();
  
  // Solo iniciar la rotación si hay más de una página
  if (totalPaginas.value > 1) {
    intervalId.value = setInterval(cambiarPagina, INTERVALO_CAMBIO);
  }
};

const detenerRotacionPaginas = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
};

const totalPaginas = computed(() => 
  Math.ceil((ranking.value?.length || 0) / PAREJAS_POR_PAGINA)
);

// Función para cargar los resultados de la última partida
const cargarResultadosUltimaPartida = async () => {
  if (!campeonato.value || !campeonato.value.id || !campeonato.value.partida_actual) {
    console.log("No hay campeonato activo o partida actual");
    return;
  }
  
  try {
    console.log(`Cargando resultados de partida ${campeonato.value.partida_actual} para campeonato ${campeonato.value.id}`);
    
    // Obtenemos todos los resultados del campeonato
    const todosResultados = await resultadoService.obtenerResultadosCampeonato(campeonato.value.id);
    console.log(`Total de resultados obtenidos: ${todosResultados.length}`);
    
    // Mostrar TODOS los campos de los resultados para depuración
    if (todosResultados.length > 0) {
      console.log('Estructura completa del primer resultado:', todosResultados[0]);
      console.log('Campos disponibles:', Object.keys(todosResultados[0]));
    }
    
    // Asegurarnos de que la comparación de partida sea correcta (convertir a entero si es necesario)
    const partidaActual = parseInt(campeonato.value.partida_actual);
    
    // Filtrar por partida actual
    const resultadosPartida = todosResultados.filter(r => {
      const partidaResultado = parseInt(r.partida);
      return partidaResultado === partidaActual;
    });
    
    console.log(`Resultados filtrados para partida ${partidaActual}: ${resultadosPartida.length}`);
    
    // Analizar los resultados por mesa
    if (resultadosPartida.length > 0) {
      // Agrupar por mesas
      const mesas = {};
      resultadosPartida.forEach(r => {
        if (!mesas[r.mesa_id]) {
          mesas[r.mesa_id] = [];
        }
        mesas[r.mesa_id].push(r);
      });
      
      console.log("Mesas con resultados:", Object.keys(mesas));
      
      // Analizar cada mesa
      for (const [mesaId, parejas] of Object.entries(mesas)) {
        console.log(`Mesa ${mesaId} tiene ${parejas.length} parejas`);
        
        // Verificar si se puede calcular la diferencia
        if (parejas.length === 2) {
          const pareja1 = parejas[0];
          const pareja2 = parejas[1];
          
          console.log(`Pareja1 (ID: ${pareja1.pareja_id}), Pareja2 (ID: ${pareja2.pareja_id})`);
          
          // Intentar encontrar los campos que tienen los puntos
          ['puntos', 'rt', 'rt_partida', 'puntos_totales', 'puntos_pareja'].forEach(campo => {
            if (pareja1[campo] !== undefined && pareja2[campo] !== undefined) {
              console.log(`Puntos encontrados en campo '${campo}': ${pareja1[campo]} vs ${pareja2[campo]}`);
              console.log(`Diferencia: ${pareja1[campo] - pareja2[campo]}`);
            }
          });
        }
      }
    }
    
    // Guardar los resultados para usarlos en obtenerDifUltimaPartida
    resultadosUltimaPartida.value = resultadosPartida;
  } catch (e) {
    console.error('Error al cargar resultados de la última partida:', e);
  }
};

const iniciarRecargaAutomatica = async () => {
  try {
    // Detener cualquier intervalo existente
    detenerRecargaAutomatica();
    
    // Realizar la primera carga inmediatamente
    await cargarRanking();
    
    // Configurar el nuevo intervalo usando una función async
    intervalRecargaId.value = setInterval(async () => {
      if (document.visibilityState === 'visible') {
        try {
          // Obtener el campeonato actualizado
          const campeonatoActualizado = await campeonatoStore.obtenerActual();
          if (!campeonatoActualizado) {
            console.error('No se pudo obtener el campeonato en la actualización automática');
            return;
          }
          
          await campeonatoStore.$patch({ campeonato: campeonatoActualizado });

          // Obtener y actualizar el ranking
          const nuevosResultados = await resultadoStore.obtenerRanking(campeonatoActualizado.id);
          if (nuevosResultados) {
            await resultadoStore.$patch({ ranking: nuevosResultados });
          }
          
          // Cargar también los resultados de la última partida
          await cargarResultadosUltimaPartida();
        } catch (error) {
          console.error('Error en la actualización automática:', error);
        }
      }
    }, INTERVALO_RECARGA);
  } catch (e) {
    console.error('Error al iniciar la recarga automática:', e);
  }
};

const detenerRecargaAutomatica = () => {
  if (intervalRecargaId.value) {
    clearInterval(intervalRecargaId.value);
    intervalRecargaId.value = null;
  }
};

const cargarRanking = async () => {
  if (!campeonato.value?.id) {
    console.error('No hay campeonato activo al intentar cargar el ranking');
    error.value = 'No hay campeonato activo';
    return;
  }
  
  loading.value = true;
  error.value = null;
  
  try {
    // 1. Obtener el campeonato actualizado y esperar a que se complete
    const campeonatoActualizado = await campeonatoStore.obtenerActual();
    if (!campeonatoActualizado) {
      throw new Error('No se pudo obtener el campeonato actualizado');
    }
    
    // 2. Actualizar el store con el campeonato
    await campeonatoStore.$patch({ campeonato: campeonatoActualizado });
    
    // 3. Cargar los resultados de la última partida
    await cargarResultadosUltimaPartida();

    // 4. Si es la primera partida, necesitamos el orden del sorteo
    if (campeonatoActualizado.partida_actual === 1) {
      // Obtener las mesas y esperar a que se complete
      const mesasData = await mesaService.obtenerMesas(
        campeonatoActualizado.id, 
        campeonatoActualizado.partida_actual
      );
      
      if (!mesasData || !mesasData.length) {
        throw new Error('No se encontraron mesas para la primera partida');
      }

      // Ordenar las mesas por número
      const mesasOrdenadas = [...mesasData].sort((a, b) => Number(a.id) - Number(b.id));

      // Crear mapa de orden por pareja
      const ordenPorPareja = new Map();
      let posicion = 1;
      
      // Asignar posiciones a parejas1
      mesasOrdenadas.forEach(mesa => {
        if (mesa.pareja1_id) {
          ordenPorPareja.set(mesa.pareja1_id, posicion++);
        }
      });
      
      // Asignar posiciones a parejas2
      mesasOrdenadas.forEach(mesa => {
        if (mesa.pareja2_id) {
          ordenPorPareja.set(mesa.pareja2_id, posicion++);
        }
      });

      // 5. Obtener el ranking y esperar a que se complete
      const rankingData = await resultadoStore.obtenerRanking(campeonatoActualizado.id);
      if (!rankingData) {
        throw new Error('No se pudo obtener el ranking');
      }

      // 6. Actualizar el ranking con el orden del sorteo
      const rankingActualizado = rankingData.map(pareja => ({
        ...pareja,
        mesa: mesasData.find(m => m.pareja1_id === pareja.id || m.pareja2_id === pareja.id)?.id || '-',
        ordenSorteo: ordenPorPareja.get(pareja.id) || 0
      }));

      await resultadoStore.$patch({ ranking: rankingActualizado });
    } else {
      // Para el resto de partidas, obtener el ranking directamente
      const rankingData = await resultadoStore.obtenerRanking(campeonatoActualizado.id);
      if (!rankingData) {
        throw new Error('No se pudo obtener el ranking');
      }
      
      await resultadoStore.$patch({ ranking: rankingData });
    }
  } catch (e) {
    console.error('Error al cargar los datos:', e);
    if (e.response) {
      console.error('Detalles del error:', {
        status: e.response.status,
        data: e.response.data,
        headers: e.response.headers
      });
    }
    error.value = e.message || 'Error al cargar los datos';
  } finally {
    loading.value = false;
  }
};

// Añadir watches para asegurar la reactividad
watch(() => campeonato.value, (newCampeonato) => {
  // Silencioso
}, { deep: true });

watch(() => ranking.value, (newRanking) => {
  // Verificar si necesitamos iniciar/detener la rotación de páginas
  if (totalPaginas.value > 1 && !intervalId.value) {
    iniciarRotacionPaginas();
  } else if (totalPaginas.value <= 1 && intervalId.value) {
    detenerRotacionPaginas();
  }
}, { deep: true });

// Variable para almacenar la función de limpieza del evento de visibilidad
let handleVisibilityChange = null;

onMounted(async () => {
  try {
    // Obtener el campeonato inicial
    const campeonatoInicial = await campeonatoStore.obtenerActual();
    
    if (!campeonatoInicial) {
      console.error('No se pudo obtener el campeonato inicial');
      error.value = 'No hay campeonato activo';
      return;
    }
    
    if (!campeonatoInicial.id) {
      console.error('El campeonato obtenido no tiene ID');
      error.value = 'Campeonato inválido';
      return;
    }
    
    // Actualizar el store con el campeonato
    await campeonatoStore.$patch({ campeonato: campeonatoInicial });
    
    // Realizar la carga inicial del ranking
    const rankingInicial = await resultadoStore.obtenerRanking(campeonatoInicial.id);
    
    // Cargar los resultados de la última partida
    await cargarResultadosUltimaPartida();
    
    // Verificar y mostrar información de diagnóstico sobre el estado de parejas y resultados
    console.log('=== DIAGNÓSTICO INICIAL ===');
    console.log(`Partida actual: ${campeonatoInicial.partida_actual}`);
    console.log(`Total resultados última partida: ${resultadosUltimaPartida.value.length}`);
    
    if (ranking.value && ranking.value.length > 0) {
      const parejasEnPartidaActual = ranking.value.filter(p => p.ultima_partida === campeonatoInicial.partida_actual);
      console.log(`Parejas en partida actual (${campeonatoInicial.partida_actual}): ${parejasEnPartidaActual.length}`);
      
      if (parejasEnPartidaActual.length > 0) {
        const muestra = parejasEnPartidaActual.slice(0, 2);
        console.log('Ejemplos de parejas en partida actual:', muestra);
        
        // Para cada pareja, verificar si tiene resultados
        muestra.forEach(pareja => {
          const resultadoPareja = resultadosUltimaPartida.value.find(r => r.pareja_id == pareja.id || r.pareja_id == pareja.numero);
          console.log(`Pareja ${pareja.id}: tiene resultado: ${resultadoPareja ? 'SÍ' : 'NO'}`);
          
          if (resultadoPareja) {
            console.log('Resultado encontrado:', resultadoPareja);
          }
        });
      }
    }
    
    // Iniciar la recarga automática
    await iniciarRecargaAutomatica();
    
    // Verificar si necesitamos iniciar la rotación de páginas
    if (totalPaginas.value > 1) {
      iniciarRotacionPaginas();
    }
    
    // Configurar el evento de visibilidad
    handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        await iniciarRecargaAutomatica();
        if (totalPaginas.value > 1) {
          iniciarRotacionPaginas();
        }
      } else {
        detenerRotacionPaginas();
        detenerRecargaAutomatica();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
  } catch (e) {
    console.error('Error en la inicialización:', e);
    if (e.response) {
      console.error('Detalles del error:', {
        status: e.response.status,
        data: e.response.data,
        headers: e.response.headers
      });
    }
    error.value = e.message || 'Error al inicializar el ranking';
  }
});

// Registrar el hook onUnmounted al nivel de setup, no dentro de una función asíncrona
onUnmounted(() => {
  detenerRotacionPaginas();
  detenerRecargaAutomatica();
  
  // Eliminar el evento de visibilitychange solo si se ha registrado
  if (handleVisibilityChange) {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  }
});

watch(route, async (to, from) => {
  if (to.name === 'resultados') {
    await iniciarRecargaAutomatica();
    iniciarRotacionPaginas();
  } else {
    detenerRotacionPaginas();
    detenerRecargaAutomatica();
  }
}, { deep: true });
</script>

<style scoped>
.border-primary-500 {
  border-color: #3B82F6;
}
</style> 