import { ref } from 'vue';

/**
 * Composable para manejar la funcionalidad de arrastre de elementos
 * @param {Object} options - Opciones de configuración
 * @param {Object} options.initialPosition - Posición inicial {top, left}
 * @param {Number} options.minLeft - Límite izquierdo mínimo
 * @param {Number} options.maxLeft - Límite derecho máximo
 * @param {Number} options.minTop - Límite superior mínimo
 * @param {Number} options.maxTop - Límite inferior máximo
 * @param {Function} options.onPositionChange - Callback cuando cambia la posición
 * @param {Function} options.onDragEnd - Callback cuando termina el arrastre
 * @returns {Object} - Objeto con propiedades y métodos para manejar el arrastre
 */
export function useDraggable(options = {}) {
  const {
    initialPosition = { top: 0, left: 0 },
    minLeft = 0,
    maxLeft = Infinity,
    minTop = 0,
    maxTop = Infinity,
    onPositionChange = null,
    onDragEnd = null
  } = options;

  // Estado reactivo
  const position = ref({ ...initialPosition });
  const isDragging = ref(false);
  const startPos = ref({ x: 0, y: 0 });
  const elementOffset = ref({ x: 0, y: 0 });

  /**
   * Iniciar el arrastre del elemento
   * @param {MouseEvent} event - Evento del mouse
   */
  const startDrag = (event) => {
    // Solo procesar clic izquierdo (0)
    if (event.button !== 0) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    isDragging.value = true;
    
    // Guardar posición inicial del mouse
    startPos.value = {
      x: event.clientX,
      y: event.clientY
    };
    
    // Guardar offset inicial del elemento
    elementOffset.value = {
      x: position.value.left,
      y: position.value.top
    };
    
    // Agregar event listeners para el movimiento y finalización
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  /**
   * Procesar el movimiento durante el arrastre
   * @param {MouseEvent} event - Evento del mouse
   */
  const onDrag = (event) => {
    if (!isDragging.value) return;
    
    event.preventDefault();
    
    // Calcular la nueva posición
    const newLeft = elementOffset.value.x + (event.clientX - startPos.value.x);
    const newTop = elementOffset.value.y + (event.clientY - startPos.value.y);
    
    // Aplicar límites con un pequeño margen de tolerancia para facilitar el movimiento
    const constrainedLeft = Math.max(minLeft - 5, Math.min(maxLeft + 5, newLeft));
    const constrainedTop = Math.max(minTop, Math.min(maxTop, newTop));
    
    console.log('Arrastrando:', {
      calculatedPosition: { left: newLeft, top: newTop },
      constrainedPosition: { left: constrainedLeft, top: constrainedTop },
      limits: { minLeft, maxLeft, minTop, maxTop },
      mouseOffsets: { x: event.clientX - startPos.value.x, y: event.clientY - startPos.value.y }
    });
    
    // Actualizar posición
    position.value = {
      left: constrainedLeft,
      top: constrainedTop
    };
    
    // Llamar al callback si existe
    if (onPositionChange) {
      onPositionChange(position.value);
    }
  };

  /**
   * Finalizar el arrastre
   * @param {MouseEvent} event - Evento del mouse
   */
  const stopDrag = (event) => {
    if (!isDragging.value) return;
    
    event.preventDefault();
    isDragging.value = false;
    
    // Remover event listeners
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    
    // Llamar al callback si existe
    if (onDragEnd) {
      onDragEnd(position.value);
    }
  };

  /**
   * Actualizar la posición programáticamente
   * @param {Object} newPosition - Nueva posición {top, left}
   */
  const updatePosition = (newPosition) => {
    position.value = {
      ...position.value,
      ...newPosition
    };
    
    // Llamar al callback si existe
    if (onPositionChange) {
      onPositionChange(position.value);
    }
  };

  /**
   * Resetear a la posición inicial
   */
  const resetPosition = () => {
    position.value = { ...initialPosition };
    
    // Llamar al callback si existe
    if (onPositionChange) {
      onPositionChange(position.value);
    }
  };

  return {
    position,
    isDragging,
    startDrag,
    stopDrag,
    updatePosition,
    resetPosition
  };
} 