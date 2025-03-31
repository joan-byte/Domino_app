import { ref, reactive } from 'vue';
import posicionamientoService from '../services/posicionamientoService';

/**
 * Valores por defecto para las posiciones
 */
const DEFAULT_POSITIONS = {
  logo: {
    izquierda: { top: 15, left: 20, width: 120, height: 70 },
    derecha: { top: 15, left: 690, width: 120, height: 70 }
  },
  titulo: {
    izquierda: { top: 50, left: 200, width: 400, fontSize: 24 },
    derecha: { top: 50, left: 620, width: 400, fontSize: 24 }
  },
  mesa: {
    izquierda: { top: 100, left: 50, width: 150, fontSize: 20 },
    derecha: { top: 100, left: 620, width: 150, fontSize: 20 }
  },
  partida: {
    izquierda: { top: 100, left: 250, width: 150, fontSize: 20 },
    derecha: { top: 100, left: 820, width: 150, fontSize: 20 }
  },
  pareja1: {
    nombre: {
      izquierda: { top: 150, left: 50, width: 200, fontSize: 16 },
      derecha: { top: 150, left: 620, width: 200, fontSize: 16 }
    },
    pos: {
      izquierda: { top: 150, left: 260, width: 80, fontSize: 16 },
      derecha: { top: 150, left: 830, width: 80, fontSize: 16 }
    },
    pg: {
      izquierda: { top: 150, left: 350, width: 80, fontSize: 16 },
      derecha: { top: 150, left: 920, width: 80, fontSize: 16 }
    },
    dif: {
      izquierda: { top: 150, left: 440, width: 80, fontSize: 16 },
      derecha: { top: 150, left: 1010, width: 80, fontSize: 16 }
    }
  },
  pareja2: {
    nombre: {
      izquierda: { top: 180, left: 50, width: 200, fontSize: 16 },
      derecha: { top: 180, left: 620, width: 200, fontSize: 16 }
    },
    pos: {
      izquierda: { top: 180, left: 260, width: 80, fontSize: 16 },
      derecha: { top: 180, left: 830, width: 80, fontSize: 16 }
    },
    pg: {
      izquierda: { top: 180, left: 350, width: 80, fontSize: 16 },
      derecha: { top: 180, left: 920, width: 80, fontSize: 16 }
    },
    dif: {
      izquierda: { top: 180, left: 440, width: 80, fontSize: 16 },
      derecha: { top: 180, left: 1010, width: 80, fontSize: 16 }
    }
  }
};

/**
 * Composable para manejar el almacenamiento y recuperación de posiciones
 * @param {Object} options - Opciones de configuración
 * @param {Boolean} options.useLocalStorage - Si se debe usar localStorage
 * @param {Boolean} options.useService - Si se debe usar el servicio
 * @param {String} options.storageKey - Clave para almacenar en localStorage
 * @returns {Object} - Objeto con propiedades y métodos para manejar el almacenamiento
 */
export function usePositionStorage(options = {}) {
  const {
    useLocalStorage = true,
    useService = false,
    storageKey = 'posiciones'
  } = options;

  // Estado reactivo para almacenar todas las posiciones
  const positions = reactive(JSON.parse(JSON.stringify(DEFAULT_POSITIONS)));
  const isLoaded = ref(false);
  const lastSaved = ref(null);

  /**
   * Cargar posiciones desde localStorage y/o servicio
   * @returns {Promise<boolean>} - true si se cargaron posiciones, false en caso contrario
   */
  const loadPositions = async () => {
    try {
      let loaded = false;
      
      // Intentar cargar desde localStorage
      if (useLocalStorage) {
        const savedPositions = localStorage.getItem(storageKey);
        if (savedPositions) {
          const parsedPositions = JSON.parse(savedPositions);
          Object.assign(positions, parsedPositions);
          loaded = true;
        }
      }
      
      // Intentar cargar posiciones específicas del logo desde el servicio
      if (useService) {
        try {
          // Lado izquierdo
          const logoIzquierda = posicionamientoService.obtenerPosicionPersonalizadaLogo('izquierda');
          if (logoIzquierda) {
            positions.logo.izquierda = logoIzquierda;
            loaded = true;
          }
          
          // Lado derecho
          const logoDerecha = posicionamientoService.obtenerPosicionPersonalizadaLogo('derecha');
          if (logoDerecha) {
            positions.logo.derecha = logoDerecha;
            loaded = true;
          }
        } catch (serviceError) {
          console.error('Error al cargar posiciones desde el servicio:', serviceError);
        }
      }
      
      isLoaded.value = true;
      return loaded;
    } catch (error) {
      console.error('Error al cargar posiciones:', error);
      // En caso de error, restablecer a valores predeterminados
      resetPositions();
      return false;
    }
  };

  /**
   * Guardar posiciones en localStorage y/o servicio
   * @returns {Promise<boolean>} - true si se guardaron posiciones, false en caso contrario
   */
  const savePositions = async () => {
    try {
      // Guardar en localStorage si está habilitado
      if (useLocalStorage) {
        localStorage.setItem(storageKey, JSON.stringify(positions));
      }
      
      // Guardar en el servicio si está habilitado
      if (useService) {
        try {
          // Guardar logo izquierdo
          posicionamientoService.guardarPosicionPersonalizadaLogo('izquierda', positions.logo.izquierda);
          
          // Guardar logo derecho
          posicionamientoService.guardarPosicionPersonalizadaLogo('derecha', positions.logo.derecha);
        } catch (serviceError) {
          console.error('Error al guardar posiciones en el servicio:', serviceError);
          return false;
        }
      }
      
      lastSaved.value = new Date();
      return true;
    } catch (error) {
      console.error('Error al guardar posiciones:', error);
      return false;
    }
  };

  /**
   * Resetear posiciones a valores predeterminados
   */
  const resetPositions = () => {
    Object.assign(positions, JSON.parse(JSON.stringify(DEFAULT_POSITIONS)));
  };

  /**
   * Actualizar posición de un elemento específico
   * @param {String} elementType - Tipo de elemento (logo, titulo, etc.)
   * @param {String} side - Lado (izquierda, derecha)
   * @param {String} subElement - Subelemento opcional (nombre, pos, etc.)
   * @param {Object} position - Posición a actualizar
   */
  const updateElementPosition = (elementType, side, subElement, position) => {
    // Validar parámetros de entrada
    if (!elementType || !side || !position) {
      console.warn('usePositionStorage: Parámetros incompletos para actualizar posición');
      return;
    }
    
    console.log('updateElementPosition llamado con:', {
      elementType,
      side,
      subElement,
      position: { ...position }
    });
    
    try {
      if (subElement) {
        // Para elementos con subelementos (pareja1, pareja2)
        if (!positions[elementType]) positions[elementType] = {};
        if (!positions[elementType][subElement]) positions[elementType][subElement] = {};
        if (!positions[elementType][subElement][side]) positions[elementType][subElement][side] = {};
        
        // Crear copia del objeto para evitar referencias compartidas
        const previousValue = { ...positions[elementType][subElement][side] };
        positions[elementType][subElement][side] = {
          ...positions[elementType][subElement][side],
          ...position
        };
        
        console.log(`Posición actualizada para ${elementType}.${subElement}.${side}:`, {
          antes: previousValue,
          después: { ...positions[elementType][subElement][side] },
          cambios: Object.keys(position)
        });
      } else {
        // Para elementos directos (logo, titulo, etc.)
        if (!positions[elementType]) positions[elementType] = {};
        if (!positions[elementType][side]) positions[elementType][side] = {};
        
        // Crear copia del objeto para evitar referencias compartidas
        const previousValue = { ...positions[elementType][side] };
        positions[elementType][side] = {
          ...positions[elementType][side],
          ...position
        };
        
        console.log(`Posición actualizada para ${elementType}.${side}:`, {
          antes: previousValue,
          después: { ...positions[elementType][side] },
          cambios: Object.keys(position)
        });
      }
    } catch (error) {
      console.error('Error al actualizar posición en usePositionStorage:', error);
    }
  };

  /**
   * Obtener posición de un elemento específico
   * @param {String} elementType - Tipo de elemento (logo, titulo, etc.)
   * @param {String} side - Lado (izquierda, derecha)
   * @param {String} subElement - Subelemento opcional (nombre, pos, etc.)
   * @returns {Object} - Posición del elemento
   */
  const getElementPosition = (elementType, side, subElement = null) => {
    try {
      // Para elementos con subelementos (pareja1, pareja2)
      if (subElement) {
        if (!positions[elementType]) return DEFAULT_POSITIONS[elementType][subElement][side];
        if (!positions[elementType][subElement]) return DEFAULT_POSITIONS[elementType][subElement][side];
        if (!positions[elementType][subElement][side]) return DEFAULT_POSITIONS[elementType][subElement][side];
        
        // Devolver copia del objeto para evitar modificar el original
        return { ...positions[elementType][subElement][side] };
      }
      
      // Para elementos directos (logo, titulo, etc.)
      if (!positions[elementType]) return DEFAULT_POSITIONS[elementType][side];
      if (!positions[elementType][side]) return DEFAULT_POSITIONS[elementType][side];
      
      // Devolver copia del objeto para evitar modificar el original
      return { ...positions[elementType][side] };
    } catch (error) {
      console.error('Error al obtener posición en usePositionStorage:', error);
      // En caso de error, devolver posición por defecto
      if (subElement) {
        return { ...DEFAULT_POSITIONS[elementType][subElement][side] };
      }
      return { ...DEFAULT_POSITIONS[elementType][side] };
    }
  };

  return {
    positions,
    isLoaded,
    lastSaved,
    loadPositions,
    savePositions,
    resetPositions,
    updateElementPosition,
    getElementPosition
  };
} 