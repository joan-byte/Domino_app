import { defineStore } from 'pinia';
import { ref } from 'vue';
import { mesaService, resultadoService } from '../services/api';

export const useMesaStore = defineStore('mesa', () => {
    const mesas = ref([]);
    const error = ref(null);
    const loading = ref(false);

    const obtenerMesas = async (campeonatoId, partida) => {
        loading.value = true;
        try {
            const mesasData = await mesaService.obtenerMesas(campeonatoId, partida);
            
            // Obtener los resultados para cada mesa
            const mesasConResultados = await Promise.all(mesasData.map(async mesa => {
                try {
                    const resultados = await resultadoService.obtenerPorMesa(mesa.id, partida);
                    return {
                        ...mesa,
                        tiene_resultado: resultados && resultados.length > 0,
                        resultados: resultados || []
                    };
                } catch (e) {
                    console.error(`Error al cargar resultados para mesa ${mesa.id}:`, e);
                    return {
                        ...mesa,
                        tiene_resultado: false,
                        resultados: []
                    };
                }
            }));

            mesas.value = mesasConResultados;
            return mesasConResultados;
        } catch (e) {
            error.value = e.response?.data?.detail || 'Error al obtener las mesas';
            mesas.value = [];
            throw e;
        } finally {
            loading.value = false;
        }
    };

    const crearMesasPorSorteo = async (campeonatoId) => {
        loading.value = true;
        try {
            const response = await mesaService.crearMesas(campeonatoId);
            mesas.value = response;
            return true;
        } catch (e) {
            error.value = e.response?.data?.detail || 'Error al crear las mesas por sorteo';
            return false;
        } finally {
            loading.value = false;
        }
    };

    const crearMesasPorRanking = async (campeonatoId) => {
        loading.value = true;
        try {
            const response = await mesaService.crearMesasPorRanking(campeonatoId);
            mesas.value = response;
            return true;
        } catch (e) {
            error.value = e.response?.data?.detail || 'Error al crear las mesas por ranking';
            return false;
        } finally {
            loading.value = false;
        }
    };

    const eliminarMesas = async (campeonatoId) => {
        loading.value = true;
        try {
            await mesaService.eliminarMesas(campeonatoId);
            mesas.value = [];
            return true;
        } catch (e) {
            error.value = e.response?.data?.detail || 'Error al eliminar las mesas';
            throw e;
        } finally {
            loading.value = false;
        }
    };

    const puedeCrearMesas = (parejas) => {
        if (!parejas || parejas.length === 0) return false;
        return parejas.length >= 2;
    };

    const todasMesasConResultados = () => {
        return mesas.value.every(mesa => mesa.tiene_resultado);
    };

    const getMesaById = (id) => {
        return mesas.value.find(mesa => mesa.id === id);
    };

    return {
        mesas,
        error,
        loading,
        obtenerMesas,
        crearMesasPorSorteo,
        crearMesasPorRanking,
        eliminarMesas,
        puedeCrearMesas,
        todasMesasConResultados,
        getMesaById
    };
}); 