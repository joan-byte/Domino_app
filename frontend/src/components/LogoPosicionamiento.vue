<template>
  <div class="p-4 bg-white shadow rounded-lg">
    <h2 class="text-lg font-semibold mb-4">Posicionamiento de Información</h2>
    
    <!-- Lado a configurar - Colocarlo primero para que el usuario elija antes de ajustar -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Lado a configurar:
      </label>
      <div class="flex space-x-4">
        <label class="inline-flex items-center">
          <input 
            type="radio" 
            v-model="lado" 
            value="izquierda"
            class="form-radio h-4 w-4 text-blue-600"
          />
          <span class="ml-2 text-sm text-gray-700">Lado Izquierdo</span>
        </label>
        <label class="inline-flex items-center">
          <input 
            type="radio" 
            v-model="lado" 
            value="derecha"
            class="form-radio h-4 w-4 text-blue-600"
          />
          <span class="ml-2 text-sm text-gray-700">Lado Derecho</span>
        </label>
        <label class="inline-flex items-center">
          <input 
            type="radio" 
            v-model="lado" 
            value="ambos"
            class="form-radio h-4 w-4 text-blue-600"
          />
          <span class="ml-2 text-sm text-gray-700">Ambos Lados</span>
        </label>
      </div>
    </div>
    
    <!-- Previsualización interactiva con dimensiones fijas -->
    <div v-if="plantillaImagenUrl" class="mb-4 relative">
      <div 
        class="border border-gray-300 relative"
        style="width: 842px; height: 595px; overflow: hidden; transform-origin: top left;"
        :style="{ transform: `scale(${escalaPrevia})` }"
        ref="plantillaContainer"
      >
        <!-- Plantilla de fondo -->
        <img 
          :src="plantillaImagenUrl" 
          class="absolute top-0 left-0 w-full h-full object-contain" 
          alt="Plantilla para posicionar" 
        />
        
        <!-- Indicadores de referencia (esquinas) -->
        <div class="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-500"></div>
        <div class="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-500"></div>
        <div class="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-500"></div>
        <div class="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-500"></div>
        
        <!-- Indicador visual de qué lado se está editando (solo cuando no es ambos lados) -->
        <div v-if="lado !== 'ambos'" class="absolute inset-0 flex items-center justify-center print-hide">
          <div 
            class="absolute"
            :style="{
              top: 0,
              bottom: 0,
              left: lado === 'izquierda' ? '50%' : 0,
              right: lado === 'izquierda' ? 0 : '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              zIndex: 90
            }"
          >
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span class="bg-gray-800 text-white px-3 py-1 rounded-md text-sm">
                No editando
              </span>
            </div>
          </div>
        </div>
        
        <!-- Logo arrastrable y redimensionable (para el lado activo) -->
        <div 
          v-if="campeonato?.logo"
          ref="logoDraggable"
          :style="{
            position: 'absolute',
            top: `${posicionLogo.top}px`,
            left: `${posicionLogo.left}px`,
            width: `${posicionLogo.width}px`,
            height: `${posicionLogo.height}px`,
            cursor: isDragging ? 'grabbing' : 'grab',
            zIndex: 100
          }"
          @mousedown="iniciarArrastre"
          class="border-2 border-blue-500 hover:border-blue-700"
        >
          <img 
            :src="campeonato.logo" 
            alt="Logo para posicionar" 
            class="w-full h-full object-contain"
          />
          
          <!-- Manejadores de redimensionamiento -->
          <div 
            class="w-6 h-6 bg-blue-500 rounded-full absolute -bottom-3 -right-3 cursor-se-resize"
            @mousedown.stop="iniciarRedimension"
          ></div>
        </div>
        
        <!-- Logo del lado derecho (versión no interactiva, solo para previsualización) -->
        <div 
          v-if="campeonato?.logo && lado === 'ambos'"
          :style="{
            position: 'absolute',
            top: `${posicionLogo.top}px`,
            left: `${posicionLogoDerecha.left}px`,
            width: `${posicionLogo.width}px`,
            height: `${posicionLogo.height}px`,
            zIndex: 99,
            pointerEvents: 'none',
            border: '2px dashed #3B82F6'
          }"
        >
          <img 
            :src="campeonato.logo" 
            alt="Previsualización logo lado derecho" 
            class="w-full h-full object-contain opacity-70"
          />
        </div>
      </div>
      
      <div class="mt-2 text-xs text-gray-600 flex items-center">
        <span>Escala de visualización:</span> 
        <input 
          type="range" 
          v-model="escalaPrevia" 
          min="0.3" 
          max="1" 
          step="0.1" 
          class="mx-2"
        />
        <span>{{ Math.round(escalaPrevia * 100) }}%</span>
      </div>
      
      <p class="mt-1 text-xs text-gray-500">
        Arrastra el logo a la posición deseada y ajusta su tamaño. 
        <span class="font-medium">Actualmente editando: {{ ladoEditandoTexto }}</span>
      </p>
      <p class="mt-1 text-xs text-blue-600">
        <strong>Nota:</strong> El área de posicionamiento tiene tamaño exacto A4 apaisado para mejorar precisión.
      </p>
      <p class="my-2 text-xs text-gray-500 flex justify-between">
        <span>Dimensiones A4 apaisado: 842×595 px</span>
        <span>X: {{posicionLogo.left}}, Y: {{posicionLogo.top}}</span>
      </p>
    </div>

    <!-- Controles manuales -->
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Posición X (desde izquierda)
        </label>
        <input 
          type="number" 
          v-model.number="posicionLogo.left" 
          class="w-full p-2 border border-gray-300 rounded-md"
          min="0"
          :max="maxWidth"
          step="1"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Posición Y (desde arriba)
        </label>
        <input 
          type="number" 
          v-model.number="posicionLogo.top" 
          class="w-full p-2 border border-gray-300 rounded-md"
          min="0"
          :max="maxHeight"
          step="1"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Ancho
        </label>
        <input 
          type="number" 
          v-model.number="posicionLogo.width" 
          class="w-full p-2 border border-gray-300 rounded-md"
          min="20"
          :max="maxWidth"
          step="1"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Alto
        </label>
        <input 
          type="number" 
          v-model.number="posicionLogo.height" 
          class="w-full p-2 border border-gray-300 rounded-md"
          min="20"
          :max="maxHeight"
          step="1"
        />
      </div>
    </div>
    
    <!-- Botones de acción -->
    <div class="flex justify-between">
      <button 
        @click="guardarPosicion" 
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Guardar Posición
      </button>
      
      <button 
        @click="resetearPosicion" 
        class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        Posición Predeterminada
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  plantillaImagenUrl: {
    type: String,
    required: true
  },
  campeonato: {
    type: Object,
    default: null
  },
  posicionLogoGuardada: {
    type: Object,
    default: () => ({
      izquierda: { top: DEFAULT_TOP, left: DEFAULT_LEFT_POS, width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT },
      derecha: { top: DEFAULT_TOP, left: DEFAULT_RIGHT_POS, width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT }
    })
  }
});

const emit = defineEmits(['actualizar-posicion-logo']);

// Elementos del DOM
const plantillaContainer = ref(null);
const logoDraggable = ref(null);

// Estado interno
const lado = ref('izquierda'); // izquierda, derecha, ambos
const isDragging = ref(false);
const isResizing = ref(false);
const lastPos = reactive({ x: 0, y: 0 });
const maxWidth = ref(600);
const maxHeight = ref(400);

// Añadir nueva variable reactiva para la escala de visualización
const escalaPrevia = ref(0.8); // 80% por defecto para que quepa en pantalla

// Valores predeterminados para resetear
const DEFAULT_LEFT_POS = 60;
const DEFAULT_RIGHT_POS = 421 + 30; // Mitad de A4 apaisado (421) + margen
const DEFAULT_TOP = 30;
const DEFAULT_WIDTH = 100;
const DEFAULT_HEIGHT = 60;

// Posición y tamaño del logo para el lado derecho (en modo 'ambos')
const posicionLogoDerecha = computed(() => {
  // Si estamos en modo 'ambos', calcular la posición espejo para el lado derecho
  if (lado.value === 'ambos') {
    const valorGuardado = localStorage.getItem('logo_posicion_derecha');
    if (valorGuardado) {
      try {
        const pos = JSON.parse(valorGuardado);
        return pos;
      } catch (e) {
        console.error('Error al leer posición derecha guardada:', e);
      }
    }
    
    // Si no hay valor guardado, usar el valor predeterminado
    // Usando mitad de página (421) para posicionar en el lado derecho
    return {
      top: posicionLogo.top,
      left: 421 + 30, // Mitad + margen
      width: posicionLogo.width,
      height: posicionLogo.height
    };
  }
  
  return null;
});

// Texto descriptivo del lado que se está editando
const ladoEditandoTexto = computed(() => {
  switch (lado.value) {
    case 'izquierda': return 'Lado Izquierdo';
    case 'derecha': return 'Lado Derecho';
    case 'ambos': return 'Ambos Lados';
    default: return '';
  }
});

// Posición y tamaño del logo (valores reactivos)
const posicionLogo = reactive({
  top: DEFAULT_TOP,
  left: DEFAULT_LEFT_POS,
  width: DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT
});

// Cargar valores guardados al cambiar de lado
watch(lado, (nuevoLado) => {
  console.log(`Cambiando a lado: ${nuevoLado}`);
  
  if (nuevoLado === 'izquierda') {
    // Cargar valores para el lado izquierdo
    const posGuardada = props.posicionLogoGuardada['izquierda'];
    console.log('Posición guardada izquierda:', posGuardada);
    
    if (posGuardada) {
      posicionLogo.top = posGuardada.top;
      posicionLogo.left = posGuardada.left;
      posicionLogo.width = posGuardada.width;
      posicionLogo.height = posGuardada.height;
    } else {
      // Intentar cargar desde localStorage
      const savedPosString = localStorage.getItem('logo_posicion_izquierda');
      if (savedPosString) {
        try {
          const savedPos = JSON.parse(savedPosString);
          posicionLogo.top = savedPos.top;
          posicionLogo.left = savedPos.left;
          posicionLogo.width = savedPos.width;
          posicionLogo.height = savedPos.height;
        } catch (e) {
          console.error('Error al cargar posición guardada izquierda:', e);
          // Valores predeterminados
          posicionLogo.top = DEFAULT_TOP;
          posicionLogo.left = DEFAULT_LEFT_POS;
          posicionLogo.width = DEFAULT_WIDTH;
          posicionLogo.height = DEFAULT_HEIGHT;
        }
      } else {
        // Valores predeterminados
        posicionLogo.top = DEFAULT_TOP;
        posicionLogo.left = DEFAULT_LEFT_POS;
        posicionLogo.width = DEFAULT_WIDTH;
        posicionLogo.height = DEFAULT_HEIGHT;
      }
    }
  } else if (nuevoLado === 'derecha') {
    // Cargar valores para el lado derecho
    const posGuardada = props.posicionLogoGuardada['derecha'];
    console.log('Posición guardada derecha:', posGuardada);
    
    if (posGuardada) {
      posicionLogo.top = posGuardada.top;
      posicionLogo.left = posGuardada.left;
      posicionLogo.width = posGuardada.width;
      posicionLogo.height = posGuardada.height;
    } else {
      // Intentar cargar desde localStorage
      const savedPosString = localStorage.getItem('logo_posicion_derecha');
      if (savedPosString) {
        try {
          const savedPos = JSON.parse(savedPosString);
          posicionLogo.top = savedPos.top;
          posicionLogo.left = savedPos.left;
          posicionLogo.width = savedPos.width;
          posicionLogo.height = savedPos.height;
        } catch (e) {
          console.error('Error al cargar posición guardada derecha:', e);
          // Valores predeterminados
          posicionLogo.top = DEFAULT_TOP;
          posicionLogo.left = DEFAULT_RIGHT_POS;
          posicionLogo.width = DEFAULT_WIDTH;
          posicionLogo.height = DEFAULT_HEIGHT;
        }
      } else {
        // Valores predeterminados
        posicionLogo.top = DEFAULT_TOP;
        posicionLogo.left = DEFAULT_RIGHT_POS;
        posicionLogo.width = DEFAULT_WIDTH;
        posicionLogo.height = DEFAULT_HEIGHT;
      }
    }
  } else if (nuevoLado === 'ambos') {
    // Cargar valores para ambos lados (usar el izquierdo como activo)
    const posGuardadaIzquierda = props.posicionLogoGuardada['izquierda'];
    
    if (posGuardadaIzquierda) {
      posicionLogo.top = posGuardadaIzquierda.top;
      posicionLogo.left = posGuardadaIzquierda.left;
      posicionLogo.width = posGuardadaIzquierda.width;
      posicionLogo.height = posGuardadaIzquierda.height;
    } else {
      // Intentar cargar desde localStorage
      const savedPosString = localStorage.getItem('logo_posicion_izquierda');
      if (savedPosString) {
        try {
          const savedPos = JSON.parse(savedPosString);
          posicionLogo.top = savedPos.top;
          posicionLogo.left = savedPos.left;
          posicionLogo.width = savedPos.width;
          posicionLogo.height = savedPos.height;
        } catch (e) {
          console.error('Error al cargar posición guardada izquierda:', e);
          // Valores predeterminados
          posicionLogo.top = DEFAULT_TOP;
          posicionLogo.left = DEFAULT_LEFT_POS;
          posicionLogo.width = DEFAULT_WIDTH;
          posicionLogo.height = DEFAULT_HEIGHT;
        }
      } else {
        // Valores predeterminados
        posicionLogo.top = DEFAULT_TOP;
        posicionLogo.left = DEFAULT_LEFT_POS;
        posicionLogo.width = DEFAULT_WIDTH;
        posicionLogo.height = DEFAULT_HEIGHT;
      }
    }
  }
});

// Iniciar arrastre del logo
const iniciarArrastre = (e) => {
  if (isResizing.value) return;
  
  isDragging.value = true;
  lastPos.x = e.clientX;
  lastPos.y = e.clientY;
  
  // Evento global de ratón para mover
  window.addEventListener('mousemove', moverElemento);
  window.addEventListener('mouseup', finalizarArrastre);

  // Prevenir selección de texto durante el arrastre
  e.preventDefault();
};

// Mover el logo durante el arrastre
const moverElemento = (e) => {
  if (!isDragging.value) return;
  
  const deltaX = e.clientX - lastPos.x;
  const deltaY = e.clientY - lastPos.y;
  
  lastPos.x = e.clientX;
  lastPos.y = e.clientY;
  
  const containerRect = plantillaContainer.value.getBoundingClientRect();
  
  // Ajustar por la escala de visualización
  const deltaXAjustado = deltaX / escalaPrevia.value;
  const deltaYAjustado = deltaY / escalaPrevia.value;
  
  // Calcular nuevas posiciones con límites
  let newLeft = posicionLogo.left + deltaXAjustado;
  let newTop = posicionLogo.top + deltaYAjustado;
  
  // Limitar dentro del contenedor A4 (842x595)
  const maxLeftLimit = 842 - posicionLogo.width;
  const maxTopLimit = 595 - posicionLogo.height;
  
  // Si estamos editando el lado derecho, permitir moverse más hacia la izquierda
  // pero no demasiado para evitar solapar completamente el lado izquierdo
  if (lado.value === 'derecha') {
    // Permitir mover hasta 100px a la izquierda de la mitad (321px en lugar de 421px)
    const limiteIzquierdo = Math.max(321, 421 - posicionLogo.width / 2);
    newLeft = Math.max(limiteIzquierdo, Math.min(newLeft, maxLeftLimit));
  } else {
    // Para el lado izquierdo o ambos, mantener dentro de los límites normales
    newLeft = Math.max(0, Math.min(newLeft, maxLeftLimit));
  }
  
  newTop = Math.max(0, Math.min(newTop, maxTopLimit));
  
  // Actualizar posición
  posicionLogo.left = Math.round(newLeft);
  posicionLogo.top = Math.round(newTop);
};

// Finalizar arrastre
const finalizarArrastre = () => {
  isDragging.value = false;
  window.removeEventListener('mousemove', moverElemento);
  window.removeEventListener('mouseup', finalizarArrastre);
};

// Iniciar redimensionamiento
const iniciarRedimension = (e) => {
  isResizing.value = true;
  lastPos.x = e.clientX;
  lastPos.y = e.clientY;
  
  window.addEventListener('mousemove', redimensionarElemento);
  window.addEventListener('mouseup', finalizarRedimension);
  
  e.preventDefault();
};

// Redimensionar durante el arrastre
const redimensionarElemento = (e) => {
  if (!isResizing.value) return;
  
  const deltaX = e.clientX - lastPos.x;
  const deltaY = e.clientY - lastPos.y;
  
  lastPos.x = e.clientX;
  lastPos.y = e.clientY;
  
  // Ajustar por la escala de visualización
  const deltaXAjustado = deltaX / escalaPrevia.value;
  const deltaYAjustado = deltaY / escalaPrevia.value;
  
  // Calcular nuevo tamaño con límites
  let newWidth = posicionLogo.width + deltaXAjustado;
  let newHeight = posicionLogo.height + deltaYAjustado;
  
  // Limitar tamaño mínimo y máximo (A4 apaisado = 842x595)
  newWidth = Math.max(20, Math.min(newWidth, 842 - posicionLogo.left));
  newHeight = Math.max(20, Math.min(newHeight, 595 - posicionLogo.top));
  
  // Actualizar tamaño
  posicionLogo.width = Math.round(newWidth);
  posicionLogo.height = Math.round(newHeight);
};

// Finalizar redimensionamiento
const finalizarRedimension = () => {
  isResizing.value = false;
  window.removeEventListener('mousemove', redimensionarElemento);
  window.removeEventListener('mouseup', finalizarRedimension);
};

// Guardar posición actual
const guardarPosicion = () => {
  const posicionActualizada = {};
  
  // Para el lado izquierdo o ambos
  if (lado.value === 'izquierda' || lado.value === 'ambos') {
    posicionActualizada.izquierda = {
      top: posicionLogo.top,
      left: posicionLogo.left,
      width: posicionLogo.width,
      height: posicionLogo.height
    };
  }
  
  // Para el lado derecho o ambos
  if (lado.value === 'derecha' || lado.value === 'ambos') {
    posicionActualizada.derecha = {
      top: posicionLogo.top,
      left: lado.value === 'ambos' ? DEFAULT_RIGHT_POS : posicionLogo.left,
      width: posicionLogo.width,
      height: posicionLogo.height
    };
  }
  
  console.log('Guardando posiciones:', posicionActualizada);
  
  // Guardar en localStorage
  if (posicionActualizada.izquierda) {
    localStorage.setItem('logo_posicion_izquierda', JSON.stringify(posicionActualizada.izquierda));
  }
  
  if (posicionActualizada.derecha) {
    localStorage.setItem('logo_posicion_derecha', JSON.stringify(posicionActualizada.derecha));
  }
  
  // Actualizar configuraciones en el servicio para reflejar cambios inmediatos
  try {
    const posicionamientoService = require('../services/posicionamientoService').default;
    if (posicionamientoService && typeof posicionamientoService.actualizarConfiguraciones === 'function') {
      posicionamientoService.actualizarConfiguraciones();
      console.log('Configuraciones actualizadas en el servicio');
    }
  } catch (error) {
    console.error('Error al actualizar configuraciones:', error);
  }
  
  // Emitir evento al componente padre
  emit('actualizar-posicion-logo', posicionActualizada);
};

// Resetear a posición predeterminada
const resetearPosicion = () => {
  if (lado.value === 'izquierda' || lado.value === 'ambos') {
    posicionLogo.top = DEFAULT_TOP;
    posicionLogo.left = DEFAULT_LEFT_POS;
    posicionLogo.width = DEFAULT_WIDTH;
    posicionLogo.height = DEFAULT_HEIGHT;
  }
  
  if (lado.value === 'derecha') {
    posicionLogo.top = DEFAULT_TOP;
    posicionLogo.left = DEFAULT_RIGHT_POS;
    posicionLogo.width = DEFAULT_WIDTH;
    posicionLogo.height = DEFAULT_HEIGHT;
  }
  
  guardarPosicion();
};

// Cargar tamaño máximo disponible y posición guardada al montar el componente
onMounted(() => {
  // Calcular dimensiones máximas
  if (plantillaContainer.value) {
    const containerRect = plantillaContainer.value.getBoundingClientRect();
    maxWidth.value = containerRect.width;
    maxHeight.value = containerRect.height;
  }
  
  // Cargar posición guardada según el lado seleccionado
  const posGuardada = props.posicionLogoGuardada[lado.value];
  if (posGuardada) {
    posicionLogo.top = posGuardada.top;
    posicionLogo.left = posGuardada.left;
    posicionLogo.width = posGuardada.width;
    posicionLogo.height = posGuardada.height;
  } else {
    // Intentar cargar desde localStorage
    const savedPosString = localStorage.getItem(`logo_posicion_${lado.value}`);
    if (savedPosString) {
      try {
        const savedPos = JSON.parse(savedPosString);
        posicionLogo.top = savedPos.top;
        posicionLogo.left = savedPos.left;
        posicionLogo.width = savedPos.width;
        posicionLogo.height = savedPos.height;
      } catch (e) {
        console.error('Error al cargar posición guardada:', e);
      }
    }
  }
});

// Limpiar eventos al desmontar
onUnmounted(() => {
  window.removeEventListener('mousemove', moverElemento);
  window.removeEventListener('mouseup', finalizarArrastre);
  window.removeEventListener('mousemove', redimensionarElemento);
  window.removeEventListener('mouseup', finalizarRedimension);
});
</script>

<style scoped>
.form-radio {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid #D1D5DB;
  border-radius: 50%;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
}

.form-radio:checked {
  background-color: #2563EB;
  border-color: #2563EB;
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='4'/%3e%3c/svg%3e");
  background-position: center;
  background-repeat: no-repeat;
}

.print-hide {
  @media print {
    display: none !important;
  }
}
</style> 