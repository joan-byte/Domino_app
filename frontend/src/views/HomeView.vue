<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <strong class="font-bold">Error: </strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <div v-if="!campeonato && !error" class="text-center py-8">
      <h2 class="text-2xl font-bold mb-4">No hay ningún campeonato activo</h2>
      <p class="text-gray-600 mb-6">Para comenzar, crea un nuevo campeonato</p>
      <button
        @click="mostrarFormularioCreacion"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Crear Nuevo Campeonato
      </button>
    </div>

    <div v-if="campeonato" class="bg-white shadow-lg rounded-lg p-6">
      <div class="flex justify-between items-start mb-6">
        <h2 class="text-2xl font-bold">{{ campeonato.nombre }}</h2>
        <div class="space-x-2">
          <button
            @click="mostrarFormularioEdicion"
            class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
          >
            Modificar
          </button>
          <button
            @click="confirmarEliminacion"
            class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Eliminar
          </button>
        </div>
      </div>
      
      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="text-lg font-semibold mb-3">Información General</h3>
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Logo del campeonato si existe, ahora soporta base64 y maneja errores -->
          <div v-if="campeonato.logo" class="flex justify-center mb-4 md:mb-0">
            <img 
              :src="campeonato.logo" 
              alt="Logo del campeonato" 
              class="h-24 w-auto object-contain"
              @error="$event.target.src='/default_logo.png'"
            />
          </div>
          <div class="space-y-2 flex-1">
            <p><span class="font-medium">Fecha de inicio:</span> {{ formatearFecha(campeonato.fecha_inicio) }}</p>
            <p><span class="font-medium">Duración:</span> {{ campeonato.dias_duracion }} días</p>
            <p><span class="font-medium">Número de partidas:</span> {{ campeonato.numero_partidas }}</p>
            <p><span class="font-medium">GB:</span> {{ campeonato.gb ? 'Sí' : 'No' }}</p>
            <p v-if="campeonato.gb"><span class="font-medium">GBP:</span> {{ campeonato.gb_valor }}</p>
            <p><span class="font-medium">PM:</span> {{ campeonato.pm }}</p>
            <p><span class="font-medium">Partida actual:</span> {{ campeonato.partida_actual }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de creación/edición de campeonato -->
    <div v-if="mostrarModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
            {{ modoEdicion ? 'Modificar Campeonato' : 'Crear Nuevo Campeonato' }}
          </h3>
          <form @submit.prevent="modoEdicion ? actualizarCampeonato() : crearCampeonato()" class="space-y-4">
            <div>
              <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                id="nombre"
                name="nombre"
                v-model="nuevoCampeonato.nombre"
                type="text"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <!-- Campo para logo del campeonato - Mejorado para mostrar datos base64 -->
            <div>
              <label for="logoFile" class="block text-sm font-medium text-gray-700">Logo del Campeonato (opcional)</label>
              <div class="mt-1 flex flex-col space-y-2">
                <!-- Vista previa si hay un logo (funciona con URLs y base64) -->
                <img v-if="nuevoCampeonato.logo" :src="nuevoCampeonato.logo" alt="Vista previa del logo" class="h-20 w-auto object-contain"/>
                <!-- Input para cargar la imagen -->
                <div class="flex items-center space-x-2">
                  <input
                    ref="logoFileInput"
                    id="logoFile"
                    name="logoFile"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleLogoUpload"
                  />
                  <button 
                    type="button" 
                    @click="$refs.logoFileInput.click()"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    Seleccionar imagen
                  </button>
                  <span v-if="logoFileName" class="text-sm text-gray-600">{{ logoFileName }}</span>
                  <button 
                    v-if="nuevoCampeonato.logo" 
                    type="button" 
                    @click="eliminarLogo"
                    class="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                    aria-label="Eliminar logo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <p class="mt-1 text-sm text-gray-500">
                Sube una imagen para usar como logo del campeonato (formato recomendado: PNG o JPG)
              </p>
            </div>
            
            <div>
              <label for="fecha_inicio" class="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
              <input
                id="fecha_inicio"
                name="fecha_inicio"
                v-model="nuevoCampeonato.fecha_inicio"
                type="date"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label for="dias_duracion" class="block text-sm font-medium text-gray-700">Días de Duración</label>
              <input
                id="dias_duracion"
                name="dias_duracion"
                v-model.number="nuevoCampeonato.dias_duracion"
                type="number"
                required
                min="1"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label for="numero_partidas" class="block text-sm font-medium text-gray-700">Número de Partidas</label>
              <input
                id="numero_partidas"
                name="numero_partidas"
                v-model.number="nuevoCampeonato.numero_partidas"
                type="number"
                required
                min="1"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label for="pm" class="block text-sm font-medium text-gray-700">Puntuación Máxima (PM)</label>
              <input
                id="pm"
                name="pm"
                v-model.number="nuevoCampeonato.pm"
                type="number"
                required
                min="0"
                max="500"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label for="gbCheckbox" class="block text-sm font-medium text-gray-700">General Bolting</label>
              <div class="flex items-center">
                <input
                  id="gbCheckbox"
                  name="gb"
                  type="checkbox"
                  v-model="nuevoCampeonato.gb"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2 block text-sm text-gray-900">GB</span>
              </div>
            </div>

            <!-- Campo GBP Valor -->
            <div v-if="nuevoCampeonato.gb">
              <label for="gb_valor" class="block text-sm font-medium text-gray-700">GBP</label>
              <input
                id="gb_valor"
                name="gb_valor"
                v-model.number="nuevoCampeonato.gb_valor"
                type="number"
                required
                min="1"
                max="999"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                @click="cerrarModal"
                class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {{ modoEdicion ? 'Guardar Cambios' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="mostrarConfirmacion" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Confirmar Eliminación</h3>
          <p class="text-sm text-gray-500 mb-4">
            ¿Estás seguro de que deseas eliminar este campeonato? Esta acción no se puede deshacer.
          </p>
          <div class="flex justify-end space-x-3">
            <button
              @click="mostrarConfirmacion = false"
              class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded"
            >
              Cancelar
            </button>
            <button
              @click="eliminarCampeonato"
              class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { campeonatoService, fileService } from '../services/api';
import { windowManager } from '../services/windowManager';

const router = useRouter();
const campeonato = ref(null);
const error = ref(null);
const mostrarModal = ref(false);
const mostrarConfirmacion = ref(false);
const modoEdicion = ref(false);
const logoFileName = ref('');
const nuevoCampeonato = ref({
  nombre: '',
  fecha_inicio: new Date().toISOString().split('T')[0],
  dias_duracion: 1,
  numero_partidas: 1,
  gb: false,
  gb_valor: null,
  pm: 300,
  logo: null
});

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const cargarCampeonatoActual = async () => {
  try {
    campeonato.value = await campeonatoService.obtenerActual();
    error.value = null;
  } catch (e) {
    if (e.response?.status === 404) {
      campeonato.value = null;
      error.value = null;
    } else {
      error.value = 'Error al cargar el campeonato';
    }
  }
};

const mostrarFormularioCreacion = () => {
  modoEdicion.value = false;
  mostrarModal.value = true;
  nuevoCampeonato.value = {
    nombre: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    dias_duracion: 1,
    numero_partidas: 1,
    gb: false,
    gb_valor: null,
    pm: 300,
    logo: null
  };
};

const mostrarFormularioEdicion = () => {
  modoEdicion.value = true;
  mostrarModal.value = true;
  nuevoCampeonato.value = {
    nombre: campeonato.value.nombre,
    fecha_inicio: campeonato.value.fecha_inicio,
    dias_duracion: campeonato.value.dias_duracion,
    numero_partidas: campeonato.value.numero_partidas,
    gb: campeonato.value.gb,
    gb_valor: campeonato.value.gb_valor,
    pm: campeonato.value.pm,
    logo: campeonato.value.logo
  };
};

const cerrarModal = () => {
  mostrarModal.value = false;
  modoEdicion.value = false;
  nuevoCampeonato.value = {
    nombre: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    dias_duracion: 1,
    numero_partidas: 1,
    gb: false,
    gb_valor: null,
    pm: 300,
    logo: null
  };
};

const crearCampeonato = async () => {
  try {
    // Hacer una copia del objeto de campeonato para no modificar el original
    const campeonatoData = { ...nuevoCampeonato.value };
    
    // Verificar si el logo es base64 (comienza con "data:")
    if (campeonatoData.logo && campeonatoData.logo.startsWith('data:')) {
      console.log('Logo en formato base64 detectado. Procesando...');
      
      // En este caso, se guarda directamente el formato base64
      // (al estar directamente en la base de datos, no se necesita ninguna conversión adicional)
      console.log('Longitud de datos base64:', campeonatoData.logo.length);
    } else {
      console.log('Logo en formato URL detectado.');
    }
    
    // Llamar al servicio para crear el campeonato
    const campeonatoCreado = await campeonatoService.crear(campeonatoData);
    cerrarModal();
    await cargarCampeonatoActual();
  } catch (e) {
    console.error('Error al crear el campeonato:', e);
    error.value = e.response?.data?.detail || 'Error al crear el campeonato';
  }
};

const actualizarCampeonato = async () => {
  try {
    // Hacer una copia del objeto de campeonato para no modificar el original
    const campeonatoData = { ...nuevoCampeonato.value };
    
    // Verificar si el logo es base64 (comienza con "data:")
    if (campeonatoData.logo && campeonatoData.logo.startsWith('data:')) {
      console.log('Logo en formato base64 detectado. Procesando para actualización...');
      // Se maneja igual que en la creación
    }
    
    await campeonatoService.actualizar(campeonato.value.id, campeonatoData);
    cerrarModal();
    await cargarCampeonatoActual();
  } catch (e) {
    console.error('Error al actualizar el campeonato:', e);
    error.value = e.response?.data?.detail || 'Error al actualizar el campeonato';
  }
};

const confirmarEliminacion = () => {
  mostrarConfirmacion.value = true;
};

const eliminarCampeonato = async () => {
  try {
    // Primero limpiamos el localStorage
    localStorage.clear(); // Limpiamos todo el localStorage para asegurarnos
    
    await campeonatoService.eliminar(campeonato.value.id);
    mostrarConfirmacion.value = false;
    campeonato.value = null;
    error.value = null;
    
    // No necesitamos cargar el campeonato actual aquí ya que no debería haber ninguno
    // await cargarCampeonatoActual();
  } catch (e) {
    console.error('Error:', e);
    error.value = 'Error al eliminar el campeonato';
  }
};

const navegarAParejas = () => router.push('/parejas');
const navegarAMesas = () => router.push('/mesas');
const navegarARanking = () => router.push('/ranking');

// Watcher para actualizar gb_valor cuando cambia numero_partidas o gb
watch([() => nuevoCampeonato.value.numero_partidas, () => nuevoCampeonato.value.gb], ([numPartidas, gb]) => {
  if (gb && (!nuevoCampeonato.value.gb_valor || nuevoCampeonato.value.gb_valor === 0)) {
    nuevoCampeonato.value.gb_valor = Math.floor(numPartidas / 2);
  } else if (!gb) {
    nuevoCampeonato.value.gb_valor = null;
  }
});

const handleLogoUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  logoFileName.value = file.name;
  error.value = null;
  
  try {
    console.log('Iniciando carga de logo:', file.name);
    
    // Método primario: Intentar cargar el archivo al servidor
    try {
      const response = await fileService.uploadLogo(file);
      
      // Actualizar el valor del logo con la URL recibida
      if (response && response.logo_path) {
        nuevoCampeonato.value.logo = response.logo_path;
        console.log('Logo cargado exitosamente con método primario:', nuevoCampeonato.value.logo);
        return; // Éxito, salimos de la función
      }
    } catch (uploadError) {
      console.error('Error en método primario de carga, intentando método alternativo:', uploadError);
      // Continuamos con el método alternativo si el primario falla
    }
    
    // Método alternativo: Convertir la imagen a base64
    console.log('Usando método alternativo (base64)...');
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const base64Data = e.target.result;
        
        // Actualizar directamente con los datos base64
        nuevoCampeonato.value.logo = base64Data;
        console.log('Logo cargado exitosamente con método alternativo (base64)');
      } catch (e) {
        console.error('Error con método alternativo:', e);
        error.value = 'Error al procesar la imagen. Intenta con una imagen más pequeña.';
        logoFileName.value = '';
      }
    };
    
    reader.onerror = (e) => {
      console.error('Error al leer el archivo:', e);
      error.value = 'Error al leer la imagen. Intenta con otra imagen.';
      logoFileName.value = '';
    };
    
    // Iniciar la lectura como base64
    reader.readAsDataURL(file);
    
  } catch (e) {
    console.error('Error general al subir el logo:', e);
    error.value = 'Error al subir la imagen del logo';
    logoFileName.value = '';
  }
};

const eliminarLogo = () => {
  nuevoCampeonato.value.logo = null;
  logoFileName.value = '';
  if (document.querySelector('input[type="file"]')) {
    document.querySelector('input[type="file"]').value = '';
  }
};

onMounted(async () => {
  await cargarCampeonatoActual();
  
  // Verificar si venimos de finalizar un campeonato
  const showPodium = localStorage.getItem('showPodium');
  if (showPodium === 'true') {
    // Mantener el podium en la segunda pantalla
    const baseUrl = window.location.origin;
    windowManager.openSecondWindow(`${baseUrl}/podium`, 'Podium del Campeonato');
    // Limpiar el flag después de mostrar el podium
    localStorage.removeItem('showPodium');
  }
});
</script> 