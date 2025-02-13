import { defineStore } from 'pinia';
import { ref } from 'vue';
import { resultadoService } from '../services/api';

export const useResultadoStore = defineStore('resultado', () => {
    const loading = ref(false);
    const error = ref(null);
    const ranking = ref([]);

    const crear = async (resultado1, resultado2 = null) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await resultadoService.crear(resultado1, resultado2);
            await obtenerRanking(resultado1.campeonato_id);
            return response;
        } catch (e) {
            error.value = e.response?.data?.detail || 'Error al crear el resultado';
            throw e;
        } finally {
            loading.value = false;
        }
    };

    const actualizarResultados = async (mesaId, resultado1, resultado2 = null) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await resultadoService.actualizarPorMesa(mesaId, resultado1, resultado2);
            await obtenerRanking(resultado1.campeonato_id);
            return response;
        } catch (e) {
            error.value = e.response?.data?.detail || 'Error al actualizar los resultados';
            throw e;
        } finally {
            loading.value = false;
        }
    };

    const obtenerResultadosCampeonato = async (campeonatoId) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await resultadoService.obtenerResultadosCampeonato(campeonatoId);
            return response;
        } catch (e) {
            error.value = e.response?.data?.detail || 'Error al obtener los resultados del campeonato';
            return [];
        } finally {
            loading.value = false;
        }
    };

    const obtenerRanking = async (campeonatoId) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await resultadoService.obtenerRanking(campeonatoId);
            if (!Array.isArray(response)) {
                throw new Error('Formato de respuesta inválido');
            }
            ranking.value = response;
            return response;
        } catch (e) {
            error.value = e.response?.data?.detail || 'Error al obtener el ranking';
            ranking.value = [];
            throw e;
        } finally {
            loading.value = false;
        }
    };

    const obtenerRankingFinal = async (campeonatoId) => {
        return obtenerRanking(campeonatoId);
    };

    const obtenerResultadosPorMesa = async (mesaId, partida) => {
        loading.value = true;
        error.value = null;
        try {
            return await resultadoService.obtenerPorMesa(mesaId, partida);
        } catch (e) {
            error.value = e.response?.data?.detail || 'Error al obtener los resultados';
            return [];
        } finally {
            loading.value = false;
        }
    };

    const obtenerResultadosPorPareja = async (parejaId) => {
        loading.value = true;
        error.value = null;
        try {
            return await resultadoService.obtenerResultadosPorPareja(parejaId);
        } catch (e) {
            error.value = e.response?.data?.detail || 'Error al obtener los resultados';
            return [];
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        error,
        ranking,
        crear,
        actualizarResultados,
        obtenerRanking,
        obtenerRankingFinal,
        obtenerResultadosPorMesa,
        obtenerResultadosPorPareja,
        obtenerResultadosCampeonato
    };
}); 