<template>
  <div class="botones-accion">
    <button 
      @click="guardar" 
      class="boton boton-guardar"
      :disabled="guardando"
    >
      <span v-if="!guardando">Guardar Posiciones</span>
      <span v-else>Guardando...</span>
    </button>
    
    <button 
      @click="resetear" 
      class="boton boton-resetear"
      :disabled="guardando"
    >
      Resetear Posiciones
    </button>
    
    <div v-if="ultimoGuardado" class="mensaje-guardado">
      <span class="icono-check">✓</span>
      Guardado {{ tiempoTranscurrido }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

/**
 * Props del componente
 */
const props = defineProps({
  // Fecha de último guardado
  ultimoGuardado: {
    type: [Date, null],
    default: null
  }
});

const emit = defineEmits(['guardar', 'resetear']);

// Estado local
const guardando = ref(false);

// Calcular tiempo transcurrido desde el último guardado
const tiempoTranscurrido = computed(() => {
  if (!props.ultimoGuardado) return '';
  
  const ahora = new Date();
  const diferencia = Math.floor((ahora - props.ultimoGuardado) / 1000); // en segundos
  
  if (diferencia < 60) {
    return 'hace unos segundos';
  } else if (diferencia < 3600) {
    const minutos = Math.floor(diferencia / 60);
    return `hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
  } else if (diferencia < 86400) {
    const horas = Math.floor(diferencia / 3600);
    return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  } else {
    const dias = Math.floor(diferencia / 86400);
    return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
  }
});

// Método para guardar posiciones
const guardar = async () => {
  guardando.value = true;
  
  try {
    // Emitir evento de guardar y esperar a que se complete
    await emit('guardar');
  } catch (error) {
    console.error('Error al guardar posiciones:', error);
  } finally {
    guardando.value = false;
  }
};

// Método para resetear posiciones
const resetear = () => {
  // Confirmar antes de resetear
  if (confirm('¿Estás seguro de que deseas resetear todas las posiciones a sus valores predeterminados?')) {
    emit('resetear');
  }
};
</script>

<style scoped>
.botones-accion {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
  align-items: center;
}

.boton {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  outline: none;
}

.boton:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.boton-guardar {
  background-color: #2563eb;
  color: white;
}

.boton-guardar:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.boton-resetear {
  background-color: #f3f4f6;
  color: #1f2937;
  border: 1px solid #d1d5db;
}

.boton-resetear:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.mensaje-guardado {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #059669;
  margin-left: 0.5rem;
}

.icono-check {
  margin-right: 0.25rem;
  font-weight: bold;
}

@media (max-width: 640px) {
  .botones-accion {
    flex-direction: column;
    align-items: stretch;
  }
  
  .mensaje-guardado {
    margin-left: 0;
    margin-top: 0.5rem;
    justify-content: center;
  }
}
</style> 