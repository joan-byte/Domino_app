<template>
  <div class="controlador-lateral">
    <h3 class="titulo">Configurar lado</h3>
    
    <div class="opciones">
      <label class="opcion">
        <input 
          type="radio" 
          name="lado" 
          value="izquierda" 
          v-model="ladoSeleccionadoLocal"
          class="radio-input"
        />
        <span class="radio-label">Izquierda</span>
      </label>
      
      <label class="opcion">
        <input 
          type="radio" 
          name="lado" 
          value="derecha" 
          v-model="ladoSeleccionadoLocal"
          class="radio-input"
        />
        <span class="radio-label">Derecha</span>
      </label>
      
      <label class="opcion">
        <input 
          type="radio" 
          name="lado" 
          value="ambos" 
          v-model="ladoSeleccionadoLocal"
          class="radio-input"
        />
        <span class="radio-label">Ambos lados</span>
      </label>
    </div>
    
    <div class="descripcion">
      <p v-if="ladoSeleccionadoLocal === 'izquierda'">
        Configura la posición de los elementos en el lado izquierdo de la plantilla.
      </p>
      <p v-else-if="ladoSeleccionadoLocal === 'derecha'">
        Configura la posición de los elementos en el lado derecho de la plantilla.
      </p>
      <p v-else>
        Configura la posición de los elementos en ambos lados de la plantilla simultáneamente.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

/**
 * Props del componente
 */
const props = defineProps({
  // Lado seleccionado actualmente
  ladoSeleccionado: {
    type: String,
    default: 'izquierda',
    validator: (value) => ['izquierda', 'derecha', 'ambos'].includes(value)
  }
});

const emit = defineEmits(['update:lado-seleccionado']);

// Variable local para manejar la selección
const ladoSeleccionadoLocal = ref(props.ladoSeleccionado);

// Observar cambios en el modelo y emitir eventos
watch(ladoSeleccionadoLocal, (nuevoValor) => {
  emit('update:lado-seleccionado', nuevoValor);
});

// Observar cambios en las props
watch(() => props.ladoSeleccionado, (nuevoValor) => {
  ladoSeleccionadoLocal.value = nuevoValor;
});
</script>

<style scoped>
.controlador-lateral {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: #f9fafb;
  margin-bottom: 1rem;
}

.titulo {
  font-size: 1rem;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: #1f2937;
}

.opciones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.opcion {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-input {
  appearance: none;
  width: 1rem;
  height: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 50%;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
}

.radio-input:checked {
  background-color: #2563eb;
  border-color: #2563eb;
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='4'/%3e%3c/svg%3e");
  background-position: center;
  background-repeat: no-repeat;
}

.radio-label {
  margin-left: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

.descripcion {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.descripcion p {
  margin: 0;
}
</style> 