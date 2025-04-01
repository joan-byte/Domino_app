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
      
      // Siempre marcar como cargado, incluso si no se cargaron posiciones
      // porque en ese caso se usarán los valores predeterminados
      isLoaded.value = true;
      console.log('loadPositions completado. isLoaded =', isLoaded.value, 'posiciones cargadas =', loaded);
      
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
  const resetPositions = (customPositions = null) => {
    // Si se proporcionan posiciones personalizadas, usarlas en lugar de las predeterminadas
    if (customPositions) {
      Object.assign(positions, JSON.parse(JSON.stringify(customPositions)));
    } else {
      // De lo contrario, usar las posiciones por defecto
      Object.assign(positions, JSON.parse(JSON.stringify(DEFAULT_POSITIONS)));
    }
    
    // Marcar como cargado
    isLoaded.value = true;
    
    console.log('Posiciones restablecidas correctamente. isLoaded =', isLoaded.value);
  };

  /**
   * Obtener todas las posiciones actuales
   * @returns {Object} - Copia de todas las posiciones actuales
   */
  const getAllPositions = () => {
    return JSON.parse(JSON.stringify(positions));
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
        // Caso especial para elementos con subelementos (pareja1, pareja2)
        
        // Asegurar que existe la estructura completa de objetos
        if (!positions[elementType]) positions[elementType] = {};
        if (!positions[elementType][side]) positions[elementType][side] = {};
        if (!positions[elementType][side][subElement]) positions[elementType][side][subElement] = {};
        
        // Crear copia del objeto para evitar referencias compartidas
        const previousValue = { ...positions[elementType][side][subElement] };
        
        // Actualizar la posición asegurándose de establecer un valor válido
        positions[elementType][side][subElement] = {
          ...positions[elementType][side][subElement],
          ...position
        };
        
        console.log(`Posición actualizada para ${elementType}.${side}.${subElement}:`, {
          antes: previousValue,
          después: { ...positions[elementType][side][subElement] },
          cambios: Object.keys(position)
        });
        
        // Verificación adicional para nombres de pareja
        if ((elementType === 'pareja1' || elementType === 'pareja2') && subElement === 'nombre') {
          console.log(`%c VERIFICACIÓN CRÍTICA: ${elementType}.${side}.${subElement}`, 
                    'background: purple; color: white; padding: 3px;');
          console.log('Posición final en memoria:', { ...positions[elementType][side][subElement] });
        }
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
      // Verificar si el tipo de elemento existe en DEFAULT_POSITIONS
      const defaultExists = DEFAULT_POSITIONS && 
                           DEFAULT_POSITIONS[elementType] && 
                           (subElement ? 
                             (DEFAULT_POSITIONS[elementType][subElement] && DEFAULT_POSITIONS[elementType][subElement][side]) : 
                             DEFAULT_POSITIONS[elementType][side]);
      
      // Para elementos con subelementos (pareja1, pareja2)
      if (subElement) {
        if (!positions[elementType]) {
          return defaultExists ? 
                 { ...DEFAULT_POSITIONS[elementType][subElement][side] } : 
                 { top: 0, left: 0, width: 100, height: 20 };
        }
        if (!positions[elementType][subElement]) {
          return defaultExists ? 
                 { ...DEFAULT_POSITIONS[elementType][subElement][side] } : 
                 { top: 0, left: 0, width: 100, height: 20 };
        }
        if (!positions[elementType][subElement][side]) {
          return defaultExists ? 
                 { ...DEFAULT_POSITIONS[elementType][subElement][side] } : 
                 { top: 0, left: 0, width: 100, height: 20 };
        }
        
        // Devolver copia del objeto para evitar modificar el original
        return { ...positions[elementType][subElement][side] };
      }
      
      // Para elementos directos (logo, titulo, etc.)
      if (!positions[elementType]) {
        return defaultExists ? 
               { ...DEFAULT_POSITIONS[elementType][side] } : 
               { top: 0, left: 0, width: 100, height: 20 };
      }
      if (!positions[elementType][side]) {
        return defaultExists ? 
               { ...DEFAULT_POSITIONS[elementType][side] } : 
               { top: 0, left: 0, width: 100, height: 20 };
      }
      
      // Devolver copia del objeto para evitar modificar el original
      return { ...positions[elementType][side] };
    } catch (error) {
      console.error('Error al obtener posición en usePositionStorage:', error);
      // En caso de error, devolver un objeto de posición básico
      return { top: 0, left: 0, width: 100, height: 20 };
    }
  };

  const loadFromLocalStorage = () => {
    try {
      console.log('Cargando posiciones directamente desde localStorage');
      const posicionesGuardadasJSON = localStorage.getItem(storageKey);
      
      if (posicionesGuardadasJSON) {
        const posicionesGuardadas = JSON.parse(posicionesGuardadasJSON);
        console.log('Posiciones recuperadas de localStorage:', posicionesGuardadas);
        
        // Actualizar el estado con las posiciones recuperadas
        Object.assign(positions, posicionesGuardadas);
        isLoaded.value = true;
        
        console.log('Posiciones cargadas correctamente desde localStorage');
        return true;
      } else {
        console.warn('No se encontraron posiciones guardadas en localStorage');
        return false;
      }
    } catch (error) {
      console.error('Error al cargar posiciones desde localStorage:', error);
      return false;
    }
  };

  return {
    positions,
    isLoaded,
    lastSaved,
    loadPositions,
    savePositions,
    resetPositions,
    getAllPositions,
    updateElementPosition,
    getElementPosition,
    loadFromLocalStorage
  };
} 