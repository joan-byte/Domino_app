import { ref } from 'vue';

/**
 * Composable para manejar la funcionalidad de redimensionamiento de elementos
 * @param {Object} options - Opciones de configuración
 * @param {Object} options.initialSize - Tamaño inicial {width, height}
 * @param {Number} options.minWidth - Ancho mínimo
 * @param {Number} options.maxWidth - Ancho máximo
 * @param {Number} options.minHeight - Altura mínima
 * @param {Number} options.maxHeight - Altura máxima
 * @param {Boolean} options.preserveAspectRatio - Si se debe preservar la relación de aspecto
 * @param {Number} options.aspectRatio - Relación de aspecto a mantener (ancho/alto)
 * @param {Function} options.onSizeChange - Callback cuando cambia el tamaño
 * @param {Function} options.onResizeEnd - Callback cuando termina el redimensionamiento
 * @returns {Object} - Objeto con propiedades y métodos para manejar el redimensionamiento
 */
export function useResizable(options = {}) {
  const {
    initialSize = { width: 100, height: 100 },
    minWidth = 20,
    maxWidth = Infinity,
    minHeight = 20,
    maxHeight = Infinity,
    preserveAspectRatio = false,
    aspectRatio = 1,
    onSizeChange = null,
    onResizeEnd = null
  } = options;

  // Estado reactivo
  const size = ref({ ...initialSize });
  const isResizing = ref(false);
  const startSize = ref({ width: 0, height: 0 });
  const startPos = ref({ x: 0, y: 0 });

  /**
   * Iniciar el redimensionamiento del elemento
   * @param {MouseEvent} event - Evento del mouse
   */
  const startResize = (event) => {
    // Solo procesar clic izquierdo (0)
    if (event.button !== 0) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    isResizing.value = true;
    
    // Guardar posición inicial del mouse
    startPos.value = {
      x: event.clientX,
      y: event.clientY
    };
    
    // Guardar tamaño inicial del elemento
    startSize.value = {
      width: size.value.width,
      height: size.value.height
    };
    
    // Agregar event listeners para el movimiento y finalización
    document.addEventListener('mousemove', onResize);
    document.addEventListener('mouseup', stopResize);
  };

  /**
   * Procesar el movimiento durante el redimensionamiento
   * @param {MouseEvent} event - Evento del mouse
   */
  const onResize = (event) => {
    if (!isResizing.value) return;
    
    event.preventDefault();
    
    // Calcular cambio en ancho y alto
    const deltaX = event.clientX - startPos.value.x;
    const deltaY = event.clientY - startPos.value.y;
    
    let newWidth = startSize.value.width + deltaX;
    let newHeight = startSize.value.height + deltaY;
    
    // Aplicar restricción de relación de aspecto si es necesario
    if (preserveAspectRatio) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        newHeight = newWidth / aspectRatio;
      } else {
        newWidth = newHeight * aspectRatio;
      }
    }
    
    // Aplicar límites
    newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
    
    // Actualizar tamaño
    size.value = {
      width: newWidth,
      height: newHeight
    };
    
    // Llamar al callback si existe
    if (onSizeChange) {
      onSizeChange(size.value);
    }
  };

  /**
   * Finalizar el redimensionamiento
   * @param {MouseEvent} event - Evento del mouse
   */
  const stopResize = (event) => {
    if (!isResizing.value) return;
    
    event.preventDefault();
    isResizing.value = false;
    
    // Remover event listeners
    document.removeEventListener('mousemove', onResize);
    document.removeEventListener('mouseup', stopResize);
    
    // Llamar al callback si existe
    if (onResizeEnd) {
      onResizeEnd(size.value);
    }
  };

  /**
   * Actualizar el tamaño programáticamente
   * @param {Object} newSize - Nuevo tamaño {width, height}
   */
  const updateSize = (newSize) => {
    // Aplicar límites
    const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newSize.width));
    const constrainedHeight = Math.max(minHeight, Math.min(maxHeight, newSize.height));
    
    size.value = {
      ...size.value,
      width: constrainedWidth,
      height: constrainedHeight
    };
    
    // Llamar al callback si existe
    if (onSizeChange) {
      onSizeChange(size.value);
    }
  };

  /**
   * Resetear al tamaño inicial
   */
  const resetSize = () => {
    size.value = { ...initialSize };
    
    // Llamar al callback si existe
    if (onSizeChange) {
      onSizeChange(size.value);
    }
  };

  return {
    size,
    isResizing,
    startResize,
    stopResize,
    updateSize,
    resetSize
  };
} 