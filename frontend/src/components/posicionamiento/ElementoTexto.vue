<template>
  <ElementoArrastrable
    :position="position"
    :size="size"
    :min-left="0"
    :max-left="maxLeft"
    :min-top="0"
    :max-top="1000"
    :min-width="50"
    :max-width="600"
    :min-height="20"
    :max-height="200"
    :draggable="true"
    :resizable="true"
    :preserve-aspect-ratio="false"
    :additional-styles="{
      ...estiloTexto,
      overflow: 'visible' /* Cambio para que la etiqueta pueda verse fuera del contenedor */
    }"
    :element-type="tipoElemento"
    :element-side="lado"
    :element-subtype="subtipoElemento"
    @update:position="updatePosition"
    @update:size="updateSize"
    @drag-end="onDragEnd"
    @resize-end="onResizeEnd"
  >
    <!-- Etiqueta descriptiva mejorada - ahora dentro del elemento arrastrable -->
    <div class="etiqueta-descriptiva">
      {{ etiquetaDescriptiva }}
    </div>
    
    <div class="contenido-texto">
      {{ textoMostrado }}
    </div>
  </ElementoArrastrable>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import ElementoArrastrable from './ElementoArrastrable.vue';

/**
 * Props del componente
 */
const props = defineProps({
  // Información de posicionamiento
  posicion: {
    type: Object,
    required: true
  },
  // Lado (izquierda o derecha)
  lado: {
    type: String,
    default: 'izquierda',
    validator: (value) => ['izquierda', 'derecha'].includes(value)
  },
  // Tipo de elemento (titulo, mesa, partida, etc.)
  tipoElemento: {
    type: String,
    required: true
  },
  // Subtipo de elemento (nombre, pos, pg, dif)
  subtipoElemento: {
    type: String,
    default: null
  },
  // Texto a mostrar
  texto: {
    type: String,
    default: 'Texto'
  },
  // Alineación del texto
  alineacion: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'center', 'right'].includes(value)
  },
  // Color del texto
  color: {
    type: String,
    default: '#000000'
  },
  // Estilo del texto (normal, bold, italic)
  estiloFuente: {
    type: String,
    default: 'normal',
    validator: (value) => ['normal', 'bold', 'italic', 'bold italic'].includes(value)
  },
  // Ancho máximo disponible
  anchoMaximo: {
    type: Number,
    default: 842 // Ancho A4 apaisado
  }
});

const emit = defineEmits(['update:posicion']);

// Calcular el límite derecho según el lado y tipo de elemento
const maxLeft = computed(() => {
  // Ampliar significativamente los límites para permitir mayor libertad de movimiento
  // Especialmente en el lado derecho donde hay problemas de visibilidad
  if (props.lado === 'derecha') {
    // Dar más espacio para mover libremente en el lado derecho
    return props.anchoMaximo * 1.5; // Permitir movimiento más allá del ancho visible
  }
  
  // Para el lado izquierdo, mantener lógica más permisiva
  return props.anchoMaximo * 0.75;
});

// Extraer posición y tamaño del prop posicion
const position = ref({
  top: props.posicion.top,
  left: props.posicion.left
});

const size = ref({
  width: props.posicion.width,
  height: props.posicion.fontSize ? props.posicion.fontSize * 1.5 : 30
});

// Flags para controlar actualización
const isUpdatingFromProps = ref(false);
const isEmittingUpdate = ref(false);

// Texto a mostrar en el elemento
const textoMostrado = computed(() => {
  return props.texto || `${props.tipoElemento}${props.subtipoElemento ? ` (${props.subtipoElemento})` : ''}`;
});

// Estilo del texto
const estiloTexto = computed(() => {
  const baseStyle = {
    display: 'flex',
    justifyContent: props.alineacion === 'left' ? 'flex-start' : props.alineacion === 'right' ? 'flex-end' : 'center',
    alignItems: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: props.color,
    fontSize: `${props.posicion.fontSize || 16}px`,
    fontWeight: props.estiloFuente.includes('bold') ? 'bold' : 'normal',
    fontStyle: props.estiloFuente.includes('italic') ? 'italic' : 'normal',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    border: '1px dashed #ccc'
  };
  
  // Aumentar la visibilidad para los elementos en el lado derecho
  if (props.lado === 'derecha') {
    return {
      ...baseStyle,
      zIndex: 30, // Mayor z-index para elementos en el lado derecho
      backgroundColor: 'rgba(255, 255, 255, 0.7)', // Más opaco para mejor visibilidad
    };
  }
  
  return baseStyle;
});

// Calcular la etiqueta descriptiva según el tipo y subtipo
const etiquetaDescriptiva = computed(() => {
  if (props.tipoElemento === 'titulo') {
    return 'Nombre Campeonato';
  } else if (props.tipoElemento === 'mesa') {
    return 'Mesa';
  } else if (props.tipoElemento === 'partida') {
    return 'Partida';
  } else if (props.tipoElemento.startsWith('pareja')) {
    const numPareja = props.tipoElemento.charAt(props.tipoElemento.length - 1);
    if (props.subtipoElemento === 'nombre') {
      return `Pareja ${numPareja} - Nombre`;
    } else if (props.subtipoElemento === 'pos') {
      return `Pareja ${numPareja} - Posición`;
    } else if (props.subtipoElemento === 'pg') {
      return `Pareja ${numPareja} - PG`;
    } else if (props.subtipoElemento === 'dif') {
      return `Pareja ${numPareja} - Dif`;
    }
    return `Pareja ${numPareja}`;
  }
  return props.tipoElemento;
});

// Actualizar posición cuando cambie el prop
watch(() => props.posicion, (newValue) => {
  // Evitar reacciones en cadena
  if (isEmittingUpdate.value) return;
  
  isUpdatingFromProps.value = true;
  
  // Verificar cambios antes de actualizar para romper ciclos
  if (position.value.top !== newValue.top || position.value.left !== newValue.left) {
    position.value = {
      top: newValue.top,
      left: newValue.left
    };
  }
  
  if (size.value.width !== newValue.width) {
    size.value = {
      width: newValue.width,
      height: newValue.fontSize ? newValue.fontSize * 1.5 : 30
    };
  }
  
  nextTick(() => {
    isUpdatingFromProps.value = false;
  });
}, { deep: true });

// Manejadores de eventos
const updatePosition = (newPosition) => {
  if (isUpdatingFromProps.value) return;
  
  console.log('ElementoTexto - updatePosition:', {
    tipo: props.tipoElemento,
    lado: props.lado,
    anterior: { ...position.value },
    nueva: { ...newPosition }
  });
  
  // Asegurar que actualizamos todos los valores
  position.value = { ...newPosition };
  emitUpdate();
};

const updateSize = (newSize) => {
  if (isUpdatingFromProps.value) return;
  
  console.log('ElementoTexto - updateSize:', {
    tipo: props.tipoElemento,
    lado: props.lado,
    anterior: { ...size.value },
    nueva: { ...newSize }
  });
  
  // Al cambiar el ancho, actualizamos el ancho
  // pero mantenemos la altura basada en el tamaño de fuente
  size.value = {
    width: newSize.width,
    height: newSize.height
  };
  
  // Ajustar el tamaño de fuente proporcional al alto
  const newFontSize = Math.round(newSize.height / 1.5);
  
  // Emitir la actualización con todos los valores
  emitUpdate(newFontSize);
};

const onDragEnd = () => {
  if (!isUpdatingFromProps.value) {
    emitUpdate();
  }
};

const onResizeEnd = () => {
  if (!isUpdatingFromProps.value) {
    emitUpdate();
  }
};

// Emitir actualización de posición
const emitUpdate = (newFontSize = null) => {
  if (isEmittingUpdate.value) return;
  
  isEmittingUpdate.value = true;
  
  const updatedPosition = {
    top: position.value.top,
    left: position.value.left,
    width: size.value.width,
    fontSize: newFontSize || props.posicion.fontSize || 16
  };
  
  console.log('ElementoTexto - emitUpdate:', {
    tipo: props.tipoElemento,
    lado: props.lado,
    posición: { ...updatedPosition }
  });
  
  nextTick(() => {
    emit('update:posicion', updatedPosition);
    nextTick(() => {
      isEmittingUpdate.value = false;
    });
  });
};
</script>

<style scoped>
.elemento-texto-container {
  position: relative;
}

.etiqueta-descriptiva {
  position: absolute;
  top: -20px;
  left: 0;
  color: #22c55e; /* Verde para diferenciar del logo */
  font-size: 12px;
  font-weight: bold;
  z-index: 1000;
  pointer-events: none;
  white-space: nowrap;
  /* Eliminar fondo, borde y sombra */
}

.contenido-texto {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  /* La justificación se hereda del estilo computado estiloTexto */
}

/* Ocultar la etiqueta descriptiva en la impresión */
@media print {
  .etiqueta-descriptiva {
    display: none !important;
  }
}

/* Estilos específicos si son necesarios */
</style> 