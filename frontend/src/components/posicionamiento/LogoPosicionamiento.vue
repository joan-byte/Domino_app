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
    
    <!-- Indicador de carga mientras se inicializan las posiciones -->
    <div v-if="!positionStorage.isLoaded.value" class="estado-carga">
      <div class="indicador-carga"></div>
      <p>Cargando posiciones...</p>
    </div>
    
    <!-- Área de previsualización -->
    <VisualizadorPlantilla
      v-else
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
  try {
    // Intentar obtener posiciones directamente desde localStorage primero
    const posicionesLocalStorageJSON = localStorage.getItem('posiciones');
    if (posicionesLocalStorageJSON) {
      const posicionesLocalStorage = JSON.parse(posicionesLocalStorageJSON);
      
      // Verificar si existe la posición específica en localStorage
      let posicionEnLocalStorage = null;
      
      if (subElement) {
        // Para elementos con subelementos (pareja1, pareja2)
        if (posicionesLocalStorage?.[elementType]?.[side]?.[subElement]) {
          posicionEnLocalStorage = posicionesLocalStorage[elementType][side][subElement];
          console.log(`obtenerPosicion: Encontrada en localStorage para ${elementType}.${side}.${subElement}:`, posicionEnLocalStorage);
          return posicionEnLocalStorage;
        }
      } else {
        // Para elementos directos (logo, titulo, etc.)
        if (posicionesLocalStorage?.[elementType]?.[side]) {
          posicionEnLocalStorage = posicionesLocalStorage[elementType][side];
          console.log(`obtenerPosicion: Encontrada en localStorage para ${elementType}.${side}:`, posicionEnLocalStorage);
          return posicionEnLocalStorage;
        }
      }
    }
    
    // Si no se encontró en localStorage, intentar con positionStorage
    if (!positionStorage.isLoaded.value) {
      console.warn('obtenerPosicion: positionStorage no está cargado aún');
      // Devolver una posición por defecto segura
      return subElement ? 
        POSICIONES_POR_DEFECTO[elementType]?.[side]?.[subElement] || { top: 0, left: 0, width: 100, height: 20 } :
        POSICIONES_POR_DEFECTO[elementType]?.[side] || { top: 0, left: 0, width: 100, height: 20 };
    }
    
    const posicion = positionStorage.getElementPosition(elementType, side, subElement);
    
    // Verificar que la posición es válida
    if (!posicion || typeof posicion !== 'object' || !('top' in posicion) || !('left' in posicion)) {
      console.warn(`obtenerPosicion: posición inválida para ${elementType}.${subElement || ''}.${side}`);
      return { top: 0, left: 0, width: 100, height: 20 };
    }
    
    return posicion;
  } catch (error) {
    console.error(`Error en obtenerPosicion(${elementType}, ${side}, ${subElement}):`, error);
    return { top: 0, left: 0, width: 100, height: 20 };
  }
};

// Método para actualizar posiciones
const actualizarPosicion = (elementType, side, subElementOrPosition, position = null) => {
  try {
    // Log para verificar qué se está actualizando
    console.log(`Actualizando posición:`, {
      elementType,
      side,
      subElementOrPosition,
      position
    });
    
    // Si subElementOrPosition es un objeto, asumimos que es la posición directamente
    // y no hay subtipo (para elementos como logo, titulo, etc.)
    if (typeof subElementOrPosition === 'object') {
      position = subElementOrPosition;
      subElementOrPosition = null;
    }
    
    // Verificación específica para elementos pos, pg y dif
    if ((elementType === 'pareja1' || elementType === 'pareja2') && 
        (subElementOrPosition === 'pos' || subElementOrPosition === 'pg' || subElementOrPosition === 'dif')) {
      console.log(`%c 🔍 VERIFICANDO ANCHO PARA ${elementType}.${side}.${subElementOrPosition}:`, 
                 'background: #FF9800; color: black; padding: 3px;');
      console.log('Ancho actual:', position.width);
      
      // Verificar que el ancho no sea menor que el permitido
      // (aunque esto no debería ocurrir gracias a las restricciones del componente)
      if (position.width < 10 && subElementOrPosition === 'pos') {
        console.warn(`Ancho demasiado pequeño para ${elementType}.${side}.${subElementOrPosition}: ${position.width}px, ajustando a 10px`);
        position.width = 10;
      } else if (position.width < 15 && (subElementOrPosition === 'pg' || subElementOrPosition === 'dif')) {
        console.warn(`Ancho demasiado pequeño para ${elementType}.${side}.${subElementOrPosition}: ${position.width}px, ajustando a 15px`);
        position.width = 15;
      }
    }
    
    // Verificación específica para nombres de pareja
    if ((elementType === 'pareja1' || elementType === 'pareja2') && 
        (subElementOrPosition === 'nombre')) {
      console.log(`%c ⚠️ ACTUALIZANDO POSICIÓN CRÍTICA: ${elementType}.${side}.${subElementOrPosition}`, 
                 'background: orange; color: black; padding: 3px;');
      console.log('Nueva posición:', position);
    }
    
    // Dar prioridad al manejo del título para que pueda moverse libremente
    if (elementType === 'titulo') {
      // Asegurar que la posición left se actualiza correctamente
      console.log(`Moviendo título horizontal: ${position?.left || 'N/A'}`);
    }
    
    // Actualizar la posición en el almacenamiento
    positionStorage.updateElementPosition(elementType, side, subElementOrPosition, position);
    
    // Guardar inmediatamente en localStorage para persistencia
    localStorage.setItem('posiciones', JSON.stringify(positionStorage.getAllPositions()));
    console.log('Posiciones guardadas automáticamente en localStorage después de actualizar', elementType, subElementOrPosition, side);
    
    // Para posiciones críticas, verificar que se hayan guardado correctamente
    if ((elementType === 'pareja1' || elementType === 'pareja2') && 
        (subElementOrPosition === 'pos' || subElementOrPosition === 'pg' || subElementOrPosition === 'dif' || subElementOrPosition === 'nombre')) {
      const posicionesActuales = JSON.parse(localStorage.getItem('posiciones') || '{}');
      console.log(`%c ✅ Verificación de guardado para ${elementType}.${side}.${subElementOrPosition}:`, 
                 'background: green; color: white; padding: 3px;');
      console.log('Posición guardada en localStorage:', 
                 posicionesActuales?.[elementType]?.[side]?.[subElementOrPosition]);
    }
  } catch (error) {
    console.error(`Error al actualizar posición: ${error.message}`);
  }
};

// Método para determinar si se debe mostrar un elemento según el lado seleccionado
const mostrarElemento = (elementType, side, subElement = null) => {
  try {
    // Validar que todos los parámetros son válidos
    if (!elementType || !side) {
      return false;
    }
    
    // Durante la inicialización, permitir que se muestren todos los elementos
    // sin comprobar si existen posiciones
    if (!positionStorage.isLoaded.value) {
      return ladoSeleccionado.value === side || ladoSeleccionado.value === 'ambos';
    }
    
    // Una vez cargadas las posiciones, verificar si existe la posición
    // Siempre mostrar todos los elementos cuando estamos configurando un lado específico
    if (ladoSeleccionado.value === side) {
      return true;
    }
    
    // Si se selecciona "ambos", mostrar todos los elementos
    return ladoSeleccionado.value === 'ambos';
  } catch (error) {
    console.error(`Error en mostrarElemento(${elementType}, ${side}, ${subElement}):`, error);
    return false;
  }
};

// Método para guardar posiciones
const guardarPosiciones = async () => {
  try {
    // Marcar las posiciones actuales antes de guardar
    const posicionesAntesDeGuardar = JSON.parse(JSON.stringify(positionStorage.getAllPositions()));
    console.log('%c POSICIONES ANTES DE GUARDAR:', 'background: #FF9800; color: black; font-weight: bold;', posicionesAntesDeGuardar);
    
    // Verificar específicamente las posiciones críticas
    console.log('%c Verificando posiciones críticas antes de guardar:', 'color: #E91E63; font-weight: bold;');
    
    // Verificar nombres de pareja
    console.log('pareja1.izquierda.nombre:', posicionesAntesDeGuardar?.pareja1?.izquierda?.nombre);
    console.log('pareja2.izquierda.pos (ancho):', posicionesAntesDeGuardar?.pareja2?.izquierda?.pos?.width);
    console.log('pareja2.izquierda.pg (ancho):', posicionesAntesDeGuardar?.pareja2?.izquierda?.pg?.width);
    console.log('pareja2.izquierda.dif (ancho):', posicionesAntesDeGuardar?.pareja2?.izquierda?.dif?.width);
    
    // Guardar directamente en localStorage para uso inmediato en la impresión
    localStorage.setItem('posiciones', JSON.stringify(posicionesAntesDeGuardar));
    
    // Evitar guardar a través del servicio/composable ya que esto podría estar causando el problema
    // Solo usar el localStorage para guardar las posiciones
    console.log('%c ⚠️ SOLO GUARDANDO EN LOCALSTORAGE, EVITANDO POSITIONSTORAGE.SAVEPOSITIONS', 'background: red; color: white; padding: 5px;');
    
    // Forzar que se establezca el último guardado para indicar éxito
    ultimoGuardado.value = new Date();
    
    // Verificar nuevamente después de guardar para confirmar que se guardaron correctamente
    const posicionesGuardadasJSON = localStorage.getItem('posiciones');
    console.log('%c POSICIONES GUARDADAS EN LOCALSTORAGE:', 'background: #4CAF50; color: white; font-weight: bold;', posicionesGuardadasJSON);
    
    if (posicionesGuardadasJSON) {
      const posicionesGuardadas = JSON.parse(posicionesGuardadasJSON);
      console.log('%c Verificando posiciones guardadas en localStorage:', 'color: #4CAF50; font-weight: bold;');
      console.log('pareja1.izquierda.nombre guardado:', posicionesGuardadas?.pareja1?.izquierda?.nombre);
      console.log('pareja2.izquierda.pos (ancho) guardado:', posicionesGuardadas?.pareja2?.izquierda?.pos?.width);
      console.log('pareja2.izquierda.pg (ancho) guardado:', posicionesGuardadas?.pareja2?.izquierda?.pg?.width);
      console.log('pareja2.izquierda.dif (ancho) guardado:', posicionesGuardadas?.pareja2?.izquierda?.dif?.width);
    }
    
    // En modo independiente, no es necesario emitir evento
    if (!enModoIndependiente.value) {
      // Emitir evento para actualizar la posición del logo en el componente padre
      emit('actualizar-posicion-logo', {
        izquierda: positionStorage.getElementPosition('logo', 'izquierda'),
        derecha: positionStorage.getElementPosition('logo', 'derecha')
      });
    }
    
    // Mostrar alerta personalizada sin afectar al estado
    if (process.env.NODE_ENV === 'development') {
      console.log('%c 🔄 Alerta será mostrada. Guardando una copia de seguridad:', 'background: #FF5722; color: white;');
      // Hacer una copia de seguridad antes de mostrar la alerta
      const backupPosiciones = JSON.parse(JSON.stringify(posicionesAntesDeGuardar));
      
      // Usar setTimeout para mostrar la alerta después de que el estado esté asegurado
      setTimeout(() => {
        alert('Posiciones guardadas correctamente');
        
        // Verificar si las posiciones cambiaron después de la alerta
        const posicionesPostAlerta = positionStorage.getAllPositions();
        console.log('%c Comparando posiciones después de la alerta:', 'background: #9C27B0; color: white;');
        console.log('¿Coinciden con las guardadas?', JSON.stringify(posicionesPostAlerta) === JSON.stringify(backupPosiciones));
        
        // Si las posiciones cambiaron, restaurar desde la copia de seguridad
        if (JSON.stringify(posicionesPostAlerta) !== JSON.stringify(backupPosiciones)) {
          console.log('%c ⚠️ Las posiciones cambiaron después de la alerta. Restaurando...', 'background: red; color: white;');
          
          // Restaurar desde localStorage para evitar cualquier manipulación
          localStorage.setItem('posiciones', JSON.stringify(backupPosiciones));
          
          // Forzar una recarga de las posiciones desde localStorage
          positionStorage.loadFromLocalStorage();
          
          console.log('%c Posiciones restauradas:', 'color: green;', positionStorage.getAllPositions());
        }
      }, 100);
    }
    
    return true;
  } catch (error) {
    console.error('Error al guardar posiciones:', error);
    return false;
  }
};

// Método para resetear posiciones
const resetearPosiciones = () => {
  try {
    // Primero usamos las posiciones por defecto exactas (sin escalado)
    positionStorage.resetPositions(POSICIONES_POR_DEFECTO);
    
    // Luego las guardamos en localStorage para que el servicio de impresión las utilice
    localStorage.setItem('posiciones', JSON.stringify(POSICIONES_POR_DEFECTO));
    console.log('Posiciones restablecidas a los valores por defecto para una impresión exacta');
    
    // Notificar al usuario
    ultimoGuardado.value = new Date();
  } catch (error) {
    console.error('Error al resetear posiciones:', error);
  }
};

// Método para volver atrás
const volverAtras = () => {
  router.back();
};

// Cargar posiciones y datos al montar el componente
onMounted(async () => {
  try {
    // Inicializar las posiciones por defecto inmediatamente
    console.log('Inicializando posiciones por defecto:', POSICIONES_POR_DEFECTO);
    positionStorage.resetPositions(POSICIONES_POR_DEFECTO);
    
    // Intentar cargar posiciones guardadas
    const posicionesGuardadas = await positionStorage.loadPositions();
    console.log('Posiciones cargadas:', posicionesGuardadas ? 'Sí' : 'No, usando valores por defecto');
    
    // Si no hay posiciones guardadas, asegurar que se usen las por defecto
    if (!posicionesGuardadas) {
      console.log('Aplicando posiciones por defecto');
      positionStorage.resetPositions(POSICIONES_POR_DEFECTO);
    }
    
    // Forzar a que isLoaded sea true para que se renderice el componente
    setTimeout(() => {
      if (!positionStorage.isLoaded.value) {
        console.log('Forzando isLoaded a true después de timeout');
        positionStorage.isLoaded.value = true;
      }
    }, 500); // Dar tiempo suficiente para que todo se inicialice
    
    // En modo independiente, cargar datos adicionales
    if (enModoIndependiente.value) {
      try {
        // Cargar el campeonato actual
        campeonatoLocal.value = await campeonatoService.obtenerActual();
        console.log('Campeonato cargado:', campeonatoLocal.value);
        
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
        console.error('Error al inicializar datos en modo independiente:', error);
        // Continuar con valores por defecto
      }
    }
  } catch (error) {
    console.error('Error general al inicializar el componente:', error);
    // Asegurar que siempre tengamos posiciones válidas
    positionStorage.resetPositions(POSICIONES_POR_DEFECTO);
    positionStorage.isLoaded.value = true; // Forzar a true para permitir el renderizado
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

/* Estilos para el indicador de carga */
.estado-carga {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 200px;
  text-align: center;
  color: #3b82f6;
  font-size: 0.875rem;
}

.indicador-carga {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  margin-bottom: 1rem;
  animation: girar 1s linear infinite;
}

@keyframes girar {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media print {
  .controles,
  button,
  .estado-carga {
    display: none !important;
  }
  
  .logo-posicionamiento {
    padding: 0;
    box-shadow: none;
    background-color: transparent;
  }
}
</style> 