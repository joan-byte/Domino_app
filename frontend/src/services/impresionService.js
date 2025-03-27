/**
 * Servicio para gestionar la impresión de mesas.
 * Contiene la lógica para cargar datos necesarios para la impresión.
 */
import { campeonatoService, mesaService, parejaService, resultadoService } from './api';
import printService from './printService';

/**
 * Carga los datos necesarios para la impresión de mesas
 * @param {Object} campeonato - Referencia al objeto reactivo del campeonato
 * @param {Array} mesasParaImprimir - Referencia al array reactivo de mesas
 * @returns {Promise<number>} - Número de mesas cargadas para imprimir
 */
const cargarDatosImpresion = async (campeonato, mesasParaImprimir) => {
  try {
    // Obtener el campeonato actual si no está ya cargado
    if (!campeonato.value) {
      campeonato.value = await campeonatoService.obtenerActual();
      if (!campeonato.value) {
        console.error('No hay campeonato activo');
        return 0;
      }
    }

    // 1. Obtener las mesas y el ranking
    const [mesas, rankingData] = await Promise.all([
      mesaService.obtenerMesas(campeonato.value.id, campeonato.value.partida_actual),
      resultadoService.obtenerRanking(campeonato.value.id)
    ]);

    console.log('Mesas asignadas:', mesas);
    console.log('Datos del ranking:', rankingData);
    console.log('Número total de mesas:', mesas.length);

    // 2. Crear un mapa del ranking para búsqueda rápida por id de pareja
    const rankingMap = new Map();
    rankingData.forEach((r, index) => {
      rankingMap.set(r.pareja_id, {
        ...r,
        posicion: index + 1 // Guardamos la posición basada en el orden del ranking
      });
    });

    // 3. Crear las mesas para imprimir
    const mesasFiltradas = mesas
      .filter(mesa => mesa.pareja1_id || mesa.pareja2_id) // Filtrar mesas vacías
      .map(mesa => {
        // Obtener datos del ranking para cada pareja
        const rankingPareja1 = rankingMap.get(mesa.pareja1_id);
        const rankingPareja2 = rankingMap.get(mesa.pareja2_id);

        return {
          id: mesa.id,
          pareja1: {
            id: mesa.pareja1_id,
            nombre: rankingPareja1?.nombre || '',
            ranking_posicion: rankingPareja1?.posicion || '-',
            partidas_ganadas: rankingPareja1?.pg || 0,
            diferencia: rankingPareja1?.pp || 0
          },
          pareja2: {
            id: mesa.pareja2_id,
            nombre: rankingPareja2?.nombre || '',
            ranking_posicion: rankingPareja2?.posicion || '-',
            partidas_ganadas: rankingPareja2?.pg || 0,
            diferencia: rankingPareja2?.pp || 0
          }
        };
      })
      .sort((a, b) => Number(a.id) - Number(b.id));

    // Asignar a la variable reactiva
    mesasParaImprimir.value = mesasFiltradas;

    console.log('Mesas preparadas para imprimir:', mesasParaImprimir.value);
    console.log('Total de mesas a imprimir:', mesasParaImprimir.value.length);
    
    // Asegurarse de que haya al menos una mesa
    if (mesasParaImprimir.value.length === 0) {
      console.error('No hay mesas para imprimir');
      return 0;
    }

    // Verificar si el logo del campeonato necesita URL completa
    if (campeonato.value.logo && !campeonato.value.logo.startsWith('http')) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      campeonato.value.logo = `${baseUrl}${campeonato.value.logo.startsWith('/') ? '' : '/'}${campeonato.value.logo}`;
      console.log('URL completa del logo:', campeonato.value.logo);
    }

    return mesasParaImprimir.value.length;
  } catch (error) {
    console.error('Error al cargar datos para impresión:', error);
    return 0;
  }
};

/**
 * Ejecuta el proceso de impresión: carga datos y abre el diálogo de impresión
 * @param {Object} campeonato - Referencia al objeto reactivo del campeonato 
 * @param {Array} mesasParaImprimir - Referencia al array reactivo de mesas
 * @param {String} plantillaImagenUrl - URL de la imagen de plantilla
 * @returns {Promise<void>}
 */
const ejecutarImpresion = async (campeonato, mesasParaImprimir, plantillaImagenUrl) => {
  try {
    // Cargar los datos y esperar a que se complete
    const mesasCount = await cargarDatosImpresion(campeonato, mesasParaImprimir);
    
    if (mesasCount === 0) {
      throw new Error('No hay mesas para imprimir');
    }
    
    // Usar el servicio de impresión para generar el HTML y abrir la ventana
    await printService.imprimirMesas(
      mesasParaImprimir.value,
      campeonato.value,
      plantillaImagenUrl
    );
    
    return true;
  } catch (error) {
    console.error('Error al imprimir:', error);
    throw error;
  }
};

export default {
  cargarDatosImpresion,
  ejecutarImpresion
}; 