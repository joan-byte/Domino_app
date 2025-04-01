<template>
  <div class="logo-posicionamiento">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold">Posicionamiento de Información</h2>
      <!-- Botón volver en modo independiente -->
      <button 
        v-if="enModoIndependiente" 
        @click="volverAtras" 
        class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
      >
        Volver
      </button>
    </div>
    
    <!-- Controles de posicionamiento -->
    <div class="controles mb-4">
      <ControladorLateral
        v-model:lado-seleccionado="ladoSeleccionado"
      />
      
      <BotonesAccion
        :ultimo-guardado="ultimoGuardado"
        @guardar="guardarPosiciones"
        @resetear="resetearPosiciones"
      />
    </div>
    
    <!-- Área de previsualización -->
    <VisualizadorPlantilla
      :plantilla-imagen-url="plantillaImagenUrlEfectiva"
      :escala-inicial="escala"
      @update:escala="escala = $event"
    >
      <!-- Logo del campeonato - Lado izquierdo -->
      <ElementoLogo
        v-if="mostrarElemento('logo', 'izquierda')"
        :posicion="obtenerPosicion('logo', 'izquierda')"
        :logo-url="campeonatoEfectivo?.logo"
        lado="izquierda"
        :ancho-maximo="anchoA4"
        @update:posicion="actualizarPosicion('logo', 'izquierda', $event)"
      />
      
      <!-- Logo del campeonato - Lado derecho -->
      <ElementoLogo
        v-if="mostrarElemento('logo', 'derecha')"
        :posicion="obtenerPosicion('logo', 'derecha')"
        :logo-url="campeonatoEfectivo?.logo"
        lado="derecha"
        :ancho-maximo="anchoA4"
        @update:posicion="actualizarPosicion('logo', 'derecha', $event)"
      />
      
      <!-- Título del campeonato - Lado izquierdo -->
      <ElementoTexto
        v-if="mostrarElemento('titulo', 'izquierda')"
        :posicion="obtenerPosicion('titulo', 'izquierda')"
        :tipo-elemento="'titulo'"
        :texto="campeonatoEfectivo?.nombre || 'Título del campeonato'"
        lado="izquierda"
        :ancho-maximo="anchoA4"
        alineacion="center"
        estilo-fuente="bold"
        @update:posicion="actualizarPosicion('titulo', 'izquierda', $event)"
      />
      
      <!-- Título del campeonato - Lado derecho -->
      <ElementoTexto
        v-if="mostrarElemento('titulo', 'derecha')"
        :posicion="obtenerPosicion('titulo', 'derecha')"
        :tipo-elemento="'titulo'"
        :texto="campeonatoEfectivo?.nombre || 'Título del campeonato'"
        lado="derecha"
        :ancho-maximo="anchoA4"
        alineacion="center"
        estilo-fuente="bold"
        @update:posicion="actualizarPosicion('titulo', 'derecha', $event)"
      />
      
      <!-- Mesa - Lado izquierdo -->
      <!-- Valor: ID de la mesa actual -->
      <ElementoTexto
        v-if="mostrarElemento('mesa', 'izquierda')"
        :posicion="obtenerPosicion('mesa', 'izquierda')"
        :tipo-elemento="'mesa'"
        :texto="String(campeonatoEfectivo?.mesa_actual || '')"
        lado="izquierda"
        :ancho-maximo="anchoA4"
        @update:posicion="actualizarPosicion('mesa', 'izquierda', $event)"
      />
      
      <!-- Mesa - Lado derecho -->
      <!-- Valor: ID de la siguiente mesa -->
      <ElementoTexto
        v-if="mostrarElemento('mesa', 'derecha')"
        :posicion="obtenerPosicion('mesa', 'derecha')"
        :tipo-elemento="'mesa'"
        :texto="String(campeonatoEfectivo?.mesa_siguiente?.id || '')"
        lado="derecha"
        :ancho-maximo="anchoA4"
        @update:posicion="actualizarPosicion('mesa', 'derecha', $event)"
      />
      
      <!-- Partida - Lado izquierdo -->
      <!-- Valor: Número de partida actual del campeonato -->
      <ElementoTexto
        v-if="mostrarElemento('partida', 'izquierda')"
        :posicion="obtenerPosicion('partida', 'izquierda')"
        :tipo-elemento="'partida'"
        :texto="String(campeonatoEfectivo?.partida_actual || '')"
        lado="izquierda"
        :ancho-maximo="anchoA4"
        @update:posicion="actualizarPosicion('partida', 'izquierda', $event)"
      />
      
      <!-- Partida - Lado derecho -->
      <!-- Valor: Número de partida actual del campeonato -->
      <ElementoTexto
        v-if="mostrarElemento('partida', 'derecha')"
        :posicion="obtenerPosicion('partida', 'derecha')"
        :tipo-elemento="'partida'"
        :texto="String(campeonatoEfectivo?.partida_actual || '')"
        lado="derecha"
        :ancho-maximo="anchoA4"
        @update:posicion="actualizarPosicion('partida', 'derecha', $event)"
      />
      
      <!-- Pareja 1 - Lado izquierdo -->
      <!-- Valor: Nombre de la pareja (formato: "Jugador1 / Jugador2") -->
      <ElementoTexto
        v-if="mostrarElemento('pareja1', 'izquierda', 'nombre')"
        :posicion="obtenerPosicion('pareja1', 'izquierda', 'nombre')"
        :tipo-elemento="'pareja1'"
        subtipo-elemento="nombre"
        :texto="formatearNombrePareja(campeonatoEfectivo?.pareja1)"
        lado="izquierda"
        :ancho-maximo="anchoA4"
        @update:posicion="actualizarPosicion('pareja1', 'izquierda', 'nombre', $event)"
      />
      
      <!-- Valor: Posición en el ranking de la pareja -->
      <ElementoTexto
        v-if="mostrarElemento('pareja1', 'izquierda', 'pos')"
        :posicion="obtenerPosicion('pareja1', 'izquierda', 'pos')"
        :tipo-elemento="'pareja1'"
        subtipo-elemento="pos"
        :texto="String(campeonatoEfectivo?.pareja1?.pos || '')"
        lado="izquierda"
        :ancho-maximo="anchoA4"
        alineacion="center"
        @update:posicion="actualizarPosicion('pareja1', 'izquierda', 'pos', $event)"
      />
      
      <!-- Valor: Partidas ganadas de la pareja -->
      <ElementoTexto
        v-if="mostrarElemento('pareja1', 'izquierda', 'pg')"
        :posicion="obtenerPosicion('pareja1', 'izquierda', 'pg')"
        :tipo-elemento="'pareja1'"
        subtipo-elemento="pg"
        :texto="String(campeonatoEfectivo?.pareja1?.pg || '')"
        lado="izquierda"
        :ancho-maximo="anchoA4"
        alineacion="center"
        @update:posicion="actualizarPosicion('pareja1', 'izquierda', 'pg', $event)"
      />
      
      <!-- Valor: Diferencia de puntos de la pareja -->
      <ElementoTexto
        v-if="mostrarElemento('pareja1', 'izquierda', 'dif')"
        :posicion="obtenerPosicion('pareja1', 'izquierda', 'dif')"
        :tipo-elemento="'pareja1'"
        subtipo-elemento="dif"
        :texto="formatearDiferencia(campeonatoEfectivo?.pareja1?.dif)"
        lado="izquierda"
        :ancho-maximo="anchoA4"
        alineacion="center"
        @update:posicion="actualizarPosicion('pareja1', 'izquierda', 'dif', $event)"
      />
      
      <!-- Pareja 1 - Lado derecho -->
      <!-- Valor: Nombre de la pareja (formato: "Jugador1 / Jugador2") -->
      <ElementoTexto
        v-if="mostrarElemento('pareja1', 'derecha', 'nombre')"
        :posicion="obtenerPosicion('pareja1', 'derecha', 'nombre')"
        :tipo-elemento="'pareja1'"
        subtipo-elemento="nombre"
        :texto="formatearNombrePareja(campeonatoEfectivo?.mesa_siguiente?.pareja1)"
        lado="derecha"
        :ancho-maximo="anchoA4"
        @update:posicion="actualizarPosicion('pareja1', 'derecha', 'nombre', $event)"
      />
      
      <!-- Valor: Posición en el ranking de la pareja -->
      <ElementoTexto
        v-if="mostrarElemento('pareja1', 'derecha', 'pos')"
        :posicion="obtenerPosicion('pareja1', 'derecha', 'pos')"
        :tipo-elemento="'pareja1'"
        subtipo-elemento="pos"
        :texto="String(campeonatoEfectivo?.mesa_siguiente?.pareja1?.pos || '')"
        lado="derecha"
        :ancho-maximo="anchoA4"
        alineacion="center"
        @update:posicion="actualizarPosicion('pareja1', 'derecha', 'pos', $event)"
      />
      
      <!-- Valor: Partidas ganadas de la pareja -->
      <ElementoTexto
        v-if="mostrarElemento('pareja1', 'derecha', 'pg')"
        :posicion="obtenerPosicion('pareja1', 'derecha', 'pg')"
        :tipo-elemento="'pareja1'"
        subtipo-elemento="pg"
        :texto="String(campeonatoEfectivo?.mesa_siguiente?.pareja1?.pg || '')"
        lado="derecha"
        :ancho-maximo="anchoA4"
        alineacion="center"
        @update:posicion="actualizarPosicion('pareja1', 'derecha', 'pg', $event)"
      />
      
      <!-- Valor: Diferencia de puntos de la pareja -->
      <ElementoTexto
        v-if="mostrarElemento('pareja1', 'derecha', 'dif')"
        :posicion="obtenerPosicion('pareja1', 'derecha', 'dif')"
        :tipo-elemento="'pareja1'"
        subtipo-elemento="dif"
        :texto="formatearDiferencia(campeonatoEfectivo?.mesa_siguiente?.pareja1?.dif)"
        lado="derecha"
        :ancho-maximo="anchoA4"
        alineacion="center"
        @update:posicion="actualizarPosicion('pareja1', 'derecha', 'dif', $event)"
      />
      
      <!-- Pareja 2 - Lado izquierdo -->
      <!-- Valor: Nombre de la pareja (formato: "Jugador1 / Jugador2") -->
      <ElementoTexto
        v-if="mostrarElemento('pareja2', 'izquierda', 'nombre')"
        :posicion="obtenerPosicion('pareja2', 'izquierda', 'nombre')"
        :tipo-elemento="'pareja2'"
        subtipo-elemento="nombre"
        :texto="formatearNombrePareja(campeonatoEfectivo?.pareja2)"
        lado="izquierda"
        :ancho-maximo="anchoA4"
        @update:posicion="actualizarPosicion('pareja2', 'izquierda', 'nombre', $event)"
      />
      
      <!-- Valor: Posición en el ranking de la pareja -->
      <ElementoTexto
        v-if="mostrarElemento('pareja2', 'izquierda', 'pos')"
        :posicion="obtenerPosicion('pareja2', 'izquierda', 'pos')"
        :tipo-elemento="'pareja2'"
        subtipo-elemento="pos"
        :texto="String(campeonatoEfectivo?.pareja2?.pos || '')"
        lado="izquierda"
        :ancho-maximo="anchoA4"
        alineacion="center"
        @update:posicion="actualizarPosicion('pareja2', 'izquierda', 'pos', $event)"
      />
      
      <!-- Valor: Partidas ganadas de la pareja -->
      <ElementoTexto
        v-if="mostrarElemento('pareja2', 'izquierda', 'pg')"
        :posicion="obtenerPosicion('pareja2', 'izquierda', 'pg')"
        :tipo-elemento="'pareja2'"
        subtipo-elemento="pg"
        :texto="String(campeonatoEfectivo?.pareja2?.pg || '')"
        lado="izquierda"
        :ancho-maximo="anchoA4"
        alineacion="center"
        @update:posicion="actualizarPosicion('pareja2', 'izquierda', 'pg', $event)"
      />
      
      <!-- Valor: Diferencia de puntos de la pareja -->
      <ElementoTexto
        v-if="mostrarElemento('pareja2', 'izquierda', 'dif')"
        :posicion="obtenerPosicion('pareja2', 'izquierda', 'dif')"
        :tipo-elemento="'pareja2'"
        subtipo-elemento="dif"
        :texto="formatearDiferencia(campeonatoEfectivo?.pareja2?.dif)"
        lado="izquierda"
        :ancho-maximo="anchoA4"
        alineacion="center"
        @update:posicion="actualizarPosicion('pareja2', 'izquierda', 'dif', $event)"
      />
      
      <!-- Pareja 2 - Lado derecho -->
      <!-- Valor: Nombre de la pareja (formato: "Jugador1 / Jugador2") -->
      <ElementoTexto
        v-if="mostrarElemento('pareja2', 'derecha', 'nombre')"
        :posicion="obtenerPosicion('pareja2', 'derecha', 'nombre')"
        :tipo-elemento="'pareja2'"
        subtipo-elemento="nombre"
        :texto="formatearNombrePareja(campeonatoEfectivo?.mesa_siguiente?.pareja2)"
        lado="derecha"
        :ancho-maximo="anchoA4"
        @update:posicion="actualizarPosicion('pareja2', 'derecha', 'nombre', $event)"
      />
      
      <!-- Valor: Posición en el ranking de la pareja -->
      <ElementoTexto
        v-if="mostrarElemento('pareja2', 'derecha', 'pos')"
        :posicion="obtenerPosicion('pareja2', 'derecha', 'pos')"
        :tipo-elemento="'pareja2'"
        subtipo-elemento="pos"
        :texto="String(campeonatoEfectivo?.mesa_siguiente?.pareja2?.pos || '')"
        lado="derecha"
        :ancho-maximo="anchoA4"
        alineacion="center"
        @update:posicion="actualizarPosicion('pareja2', 'derecha', 'pos', $event)"
      />
      
      <!-- Valor: Partidas ganadas de la pareja -->
      <ElementoTexto
        v-if="mostrarElemento('pareja2', 'derecha', 'pg')"
        :posicion="obtenerPosicion('pareja2', 'derecha', 'pg')"
        :tipo-elemento="'pareja2'"
        subtipo-elemento="pg"
        :texto="String(campeonatoEfectivo?.mesa_siguiente?.pareja2?.pg || '')"
        lado="derecha"
        :ancho-maximo="anchoA4"
        alineacion="center"
        @update:posicion="actualizarPosicion('pareja2', 'derecha', 'pg', $event)"
      />
      
      <!-- Valor: Diferencia de puntos de la pareja -->
      <ElementoTexto
        v-if="mostrarElemento('pareja2', 'derecha', 'dif')"
        :posicion="obtenerPosicion('pareja2', 'derecha', 'dif')"
        :tipo-elemento="'pareja2'"
        subtipo-elemento="dif"
        :texto="formatearDiferencia(campeonatoEfectivo?.mesa_siguiente?.pareja2?.dif)"
        lado="derecha"
        :ancho-maximo="anchoA4"
        alineacion="center"
        @update:posicion="actualizarPosicion('pareja2', 'derecha', 'dif', $event)"
      />
    </VisualizadorPlantilla>
  </div>
</template>

<script>
// Definición de props en un bloque script normal
export default {
  props: {
    plantillaImagenUrl: {
      type: String,
      required: false
    },
    campeonato: {
      type: Object,
      required: false
    },
    posicionLogoGuardada: {
      type: Object,
      default: () => ({
        izquierda: { top: 15, left: 20, width: 120, height: 70 },
        derecha: { top: 15, left: 690, width: 120, height: 70 }
      })
    }
  }
}
</script>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { campeonatoService, plantillaService } from '../../services/api';

// Importar componentes
import {
  ElementoArrastrable,
  ElementoLogo,
  ElementoTexto,
  ControladorLateral,
  BotonesAccion,
  VisualizadorPlantilla
} from './index';

// Importar composables
import { usePositionStorage } from '../../composables/usePositionStorage';

// Constantes
const anchoA4 = 842; // Ancho A4 apaisado
const altoA4 = 595;  // Alto A4 apaisado

// Posiciones por defecto (basadas en las posiciones actuales)
const POSICIONES_POR_DEFECTO = {
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
      pos: { top: 142, left: 412, width: 30, height: 20 },
      pg: { top: 142, left: 442, width: 30, height: 20 },
      dif: { top: 142, left: 472, width: 50, height: 20 }
    },
    derecha: {
      nombre: { top: 142, left: 570, width: 300, height: 20 },
      pos: { top: 142, left: 870, width: 30, height: 20 },
      pg: { top: 142, left: 900, width: 30, height: 20 },
      dif: { top: 142, left: 930, width: 50, height: 20 }
    }
  },
  pareja2: {
    izquierda: {
      nombre: { top: 169, left: 112, width: 300, height: 20 },
      pos: { top: 169, left: 412, width: 30, height: 20 },
      pg: { top: 169, left: 442, width: 30, height: 20 },
      dif: { top: 169, left: 472, width: 50, height: 20 }
    },
    derecha: {
      nombre: { top: 169, left: 570, width: 300, height: 20 },
      pos: { top: 169, left: 870, width: 30, height: 20 },
      pg: { top: 169, left: 900, width: 30, height: 20 },
      dif: { top: 169, left: 930, width: 50, height: 20 }
    }
  }
};

// Definición de props
const props = defineProps({
  plantillaImagenUrl: {
    type: String,
    required: false
  },
  campeonato: {
    type: Object,
    required: false
  },
  posicionLogoGuardada: {
    type: Object,
    default: () => ({
      izquierda: { top: 15, left: 20, width: 120, height: 70 },
      derecha: { top: 15, left: 690, width: 120, height: 70 }
    })
  }
});

const emit = defineEmits(['actualizar-posicion-logo']);

// Router para navegación
const router = useRouter();

// Estado local
const ladoSeleccionado = ref('izquierda');
const escala = ref(1);
const ultimoGuardado = ref(null);

// Variables para modo independiente
const enModoIndependiente = computed(() => {
  return !props.plantillaImagenUrl || !props.campeonato;
});

const campeonatoLocal = ref(null);
const plantillaImagenLocal = ref('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0id2hpdGUiLz48dGV4dCB4PSI2MDAiIHk9IjMwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJibGFjayI+Q2FyZ3VlIGxhIGltYWdlbiBkZSBwbGFudGlsbGEgZGVzZGUgbGEgb3BjacOzbiAnQ29uZmlndXJhciBQbGFudGlsbGEnPC90ZXh0Pjwvc3ZnPg==');
const posicionLogoLocal = ref({
  izquierda: { top: 15, left: 20, width: 120, height: 70 },
  derecha: { top: 15, left: 690, width: 120, height: 70 }
});

// Obtener plantillaImagenUrl efectiva (prop o cargada localmente)
const plantillaImagenUrlEfectiva = computed(() => {
  return enModoIndependiente.value ? plantillaImagenLocal.value : props.plantillaImagenUrl;
});

// Obtener campeonato efectivo (prop o cargado localmente)
const campeonatoEfectivo = computed(() => {
  return enModoIndependiente.value ? campeonatoLocal.value : props.campeonato;
});

// Usar el composable para manejar posiciones
const positionStorage = usePositionStorage({
  useLocalStorage: true,
  useService: enModoIndependiente.value,
  storageKey: 'posiciones'
});

// Métodos para manejar posiciones
const obtenerPosicion = (elementType, side, subElement = null) => {
  return positionStorage.getElementPosition(elementType, side, subElement);
};

const actualizarPosicion = (elementType, side, subElementOrPosition, position = null) => {
  // Si el tercer parámetro es un objeto, entonces no hay subElemento
  if (typeof subElementOrPosition === 'object' && subElementOrPosition !== null) {
    try {
      // Prevención de actualizaciones recursivas
      console.log(`Actualizando posición de ${elementType} en lado ${side}:`, subElementOrPosition);
      
      // Dar prioridad al manejo del título para que pueda moverse libremente
      if (elementType === 'titulo') {
        // Asegurar que la posición left se actualiza correctamente
        console.log(`Moviendo título horizontal: ${subElementOrPosition.left}`);
      }
      
      positionStorage.updateElementPosition(elementType, side, null, subElementOrPosition);
    } catch (error) {
      console.error(`Error al actualizar posición: ${error.message}`);
    }
  } else {
    try {
      console.log(`Actualizando posición de ${elementType} (${subElementOrPosition}) en lado ${side}:`, position);
      positionStorage.updateElementPosition(elementType, side, subElementOrPosition, position);
    } catch (error) {
      console.error(`Error al actualizar posición: ${error.message}`);
    }
  }
};

// Método para determinar si se debe mostrar un elemento según el lado seleccionado
const mostrarElemento = (elementType, side, subElement = null) => {
  // Siempre mostrar todos los elementos cuando estamos configurando un lado específico
  if (ladoSeleccionado.value === side) {
    return true;
  }
  
  // Si se selecciona "ambos", mostrar todos los elementos
  return ladoSeleccionado.value === 'ambos';
};

// Método para guardar posiciones
const guardarPosiciones = async () => {
  const resultado = await positionStorage.savePositions();
  
  if (resultado) {
    ultimoGuardado.value = new Date();
    
    // En modo independiente, no es necesario emitir evento
    if (!enModoIndependiente.value) {
      // Emitir evento para actualizar la posición del logo en el componente padre
      emit('actualizar-posicion-logo', {
        izquierda: positionStorage.getElementPosition('logo', 'izquierda'),
        derecha: positionStorage.getElementPosition('logo', 'derecha')
      });
    }
  }
  
  return resultado;
};

// Método para resetear posiciones
const resetearPosiciones = () => {
  // Usar las posiciones guardadas en localStorage en lugar de las posiciones por defecto
  const posicionesGuardadas = localStorage.getItem('posiciones');
  
  if (posicionesGuardadas) {
    try {
      const posiciones = JSON.parse(posicionesGuardadas);
      positionStorage.resetPositions(posiciones);
    } catch (error) {
      console.error('Error al cargar posiciones guardadas:', error);
      positionStorage.resetPositions(POSICIONES_POR_DEFECTO);
    }
  } else {
    // Si no hay posiciones guardadas, usar las posiciones por defecto
    positionStorage.resetPositions(POSICIONES_POR_DEFECTO);
  }
};

// Método para volver atrás
const volverAtras = () => {
  router.back();
};

// Cargar posiciones y datos al montar el componente
onMounted(async () => {
  // Cargar posiciones guardadas o usar las posiciones por defecto
  await positionStorage.loadPositions(POSICIONES_POR_DEFECTO);
  
  // En modo independiente, cargar datos adicionales
  if (enModoIndependiente.value) {
    try {
      // Cargar el campeonato actual
      campeonatoLocal.value = await campeonatoService.obtenerActual();
      
      if (campeonatoLocal.value && campeonatoLocal.value.logo && !campeonatoLocal.value.logo.startsWith('http')) {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        campeonatoLocal.value.logo = `${baseUrl}${campeonatoLocal.value.logo.startsWith('/') ? '' : '/'}${campeonatoLocal.value.logo}`;
      }
      
      // Intentar cargar la plantilla desde el servidor primero
      try {
        const serverTemplateUrl = await plantillaService.obtenerPlantilla();
        if (serverTemplateUrl) {
          plantillaImagenLocal.value = serverTemplateUrl;
        } else {
          // Si no hay plantilla en el servidor, intentar cargar desde localStorage
          const storedTemplateUrl = localStorage.getItem('plantilla_mesas_url');
          if (storedTemplateUrl) {
            plantillaImagenLocal.value = storedTemplateUrl;
          }
        }
      } catch (error) {
        console.error('Error al cargar la plantilla desde el servidor:', error);
        // Intentar cargar desde localStorage como fallback
        const storedTemplateUrl = localStorage.getItem('plantilla_mesas_url');
        if (storedTemplateUrl) {
          plantillaImagenLocal.value = storedTemplateUrl;
        }
      }
    } catch (error) {
      console.error('Error al inicializar el componente:', error);
    }
  }
});

// Métodos para formatear nombres y diferencias
const formatearNombrePareja = (pareja) => {
  if (pareja) {
    const [jugador1, jugador2] = pareja.split(' / ');
    return `${jugador1} / ${jugador2}`;
  }
  return '';
};

const formatearDiferencia = (diferencia) => {
  if (diferencia) {
    return diferencia.toString();
  }
  return '';
};
</script>

<style scoped>
.logo-posicionamiento {
  padding: 1rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.controles {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

@media print {
  .controles,
  button {
    display: none !important;
  }
  
  .logo-posicionamiento {
    padding: 0;
    box-shadow: none;
    background-color: transparent;
  }
}
</style> 