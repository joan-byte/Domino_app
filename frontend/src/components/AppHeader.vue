<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCampeonatoStore } from '../stores/campeonato';
import { useResultadoStore } from '../stores/resultado';
import MenuMesas from './MenuMesas.vue';
import MenuResultados from './MenuResultados.vue';
import MenuConfiguracion from './MenuConfiguracion.vue';

const props = defineProps({
  campeonato: Object
});

const emit = defineEmits(['imprimir', 'mostrar-modal-plantilla', 'imprimir-ranking', 'mostrar-posicionamiento-logo']);

const route = useRoute();
const router = useRouter();
const campeonatoStore = useCampeonatoStore();
const resultadoStore = useResultadoStore();

// Estado para verificar si hay resultados en la partida actual
const hayResultadosPartidaActual = ref(true);

// Asegurarse de que los menús comiencen cerrados
const showMesasMenu = ref(false);
const showResultadosMenu = ref(false);
const showConfiguracionMenu = ref(false);

const closeMenus = (e) => {
  // Cerrar los menús si se hace clic fuera de ellos
  // Solo necesario como respaldo, ya que los menús deben cerrarse con hover
  cerrarTodosLosMenus();
};

// Manejar eventos del menú
const handleImprimir = () => {
  emit('imprimir');
};

const handleMostrarModalPlantilla = () => {
  emit('mostrar-modal-plantilla');
};

const handleImprimirRanking = () => {
  emit('imprimir-ranking');
};

const handleMostrarPosicionamientoLogo = () => {
  emit('mostrar-posicionamiento-logo');
};

// Funciones para manejar menús desplegables por hover
const updateMesasMenu = (value) => {
  showMesasMenu.value = value;
  
  // Si se abre el menú de Mesas, asegurarse que los otros estén cerrados
  if (value) {
    showResultadosMenu.value = false;
    showConfiguracionMenu.value = false;
  }
};

const updateResultadosMenu = (value) => {
  showResultadosMenu.value = value;
  
  // Si se abre el menú de Resultados, asegurarse que los otros estén cerrados
  if (value) {
    showMesasMenu.value = false;
    showConfiguracionMenu.value = false;
  }
};

const updateConfiguracionMenu = (value) => {
  showConfiguracionMenu.value = value;
  
  // Si se abre el menú de Configuración, asegurarse que los otros estén cerrados
  if (value) {
    showMesasMenu.value = false;
    showResultadosMenu.value = false;
  }
};

// Función para cerrar explícitamente todos los menús
const cerrarTodosLosMenus = () => {
  showMesasMenu.value = false;
  showResultadosMenu.value = false;
  showConfiguracionMenu.value = false;
};

// Función para verificar si hay resultados en la partida actual
const verificarResultadosPartidaActual = async () => {
  if (!props.campeonato) return;
  
  try {
    // Obtener los resultados del campeonato para la partida actual
    const resultados = await resultadoStore.obtenerResultadosPorPartida(
      props.campeonato.id, 
      props.campeonato.partida_actual
    );
    
    console.log(`Verificando resultados de partida ${props.campeonato.partida_actual}: encontrados ${resultados ? resultados.length : 0}`);
    
    // Actualizar el estado - hay resultados si la longitud es mayor a 0
    hayResultadosPartidaActual.value = resultados && resultados.length > 0;
    
    console.log(`hayResultadosPartidaActual: ${hayResultadosPartidaActual.value}`);
  } catch (error) {
    console.error('Error al verificar resultados de la partida actual:', error);
    // Por defecto asumir que NO hay resultados para permitir la opción
    hayResultadosPartidaActual.value = false;
  }
};

// Variables para almacenar referencias a intervalos
const intervalIds = ref([]);
// Variable para almacenar la función del event listener
const handlePartidaCerrada = ref(null);

// Añadir y remover listener de click global como respaldo
onMounted(() => {
  // Asegurarse de que los menús estén cerrados al montar el componente
  cerrarTodosLosMenus();
  
  // Añadir evento de clic global como respaldo para cerrar menús
  document.addEventListener('click', closeMenus);
  
  // Verificar si hay resultados en la partida actual
  verificarResultadosPartidaActual();
  
  // Configurar una verificación periódica cada 30 segundos
  const intervalId = setInterval(verificarResultadosPartidaActual, 30000);
  intervalIds.value.push(intervalId);
  
  // Crear y asignar la función para el evento personalizado 'partida-cerrada'
  handlePartidaCerrada.value = () => {
    console.log('Evento partida-cerrada recibido en AppHeader');
    // Esperar un poco antes de verificar los resultados para dar tiempo a que se actualice el backend
    setTimeout(() => {
      verificarResultadosPartidaActual();
    }, 500);
  };
  
  // Registrar el listener
  window.addEventListener('partida-cerrada', handlePartidaCerrada.value);
});

// Observar cambios en la ruta para cerrar los menús y verificar resultados
watch(() => route.path, () => {
  cerrarTodosLosMenus();
  // Verificar resultados cuando cambia la ruta
  verificarResultadosPartidaActual();
});

// Observar cambios en el campeonato
watch(() => props.campeonato, (newVal) => {
  if (newVal) {
    verificarResultadosPartidaActual();
  }
}, { deep: true });

onUnmounted(() => {
  // Limpiar eventos
  document.removeEventListener('click', closeMenus);
  
  // Remover el listener del evento personalizado si existe
  if (handlePartidaCerrada.value) {
    window.removeEventListener('partida-cerrada', handlePartidaCerrada.value);
  }
  
  // Limpiar todos los intervalos
  intervalIds.value.forEach(id => clearInterval(id));
});
</script>

<template>
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
                @error="$event.target.src='/default_logo.png'"
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
              @click="cerrarTodosLosMenus"
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
            @click="cerrarTodosLosMenus"
          >
            Parejas
          </router-link>

          <!-- Menús desplegables -->
          <MenuMesas 
            :show-menu="showMesasMenu" 
            @update:show-menu="updateMesasMenu"
            @close-menus="closeMenus"
            @imprimir="handleImprimir"
          />

          <MenuResultados 
            :show-menu="showResultadosMenu" 
            @update:show-menu="updateResultadosMenu"
            @close-menus="closeMenus" 
            @imprimir-ranking="handleImprimirRanking"
          />

          <MenuConfiguracion 
            class="ml-12" 
            :show-menu="showConfiguracionMenu" 
            :campeonato="campeonato"
            :hay-resultados-partida-actual="hayResultadosPartidaActual"
            @update:show-menu="updateConfiguracionMenu"
            @close-menus="closeMenus"
            @mostrar-modal-plantilla="handleMostrarModalPlantilla"
            @mostrar-posicionamiento-logo="handleMostrarPosicionamientoLogo"
            @rehacer-partida="handleRehacerPartida"
          />
        </div>
      </div>
    </div>
  </nav>
</template> 