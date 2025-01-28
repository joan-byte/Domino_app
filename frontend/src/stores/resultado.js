import { defineStore } from 'pinia';
import { ref } from 'vue';
import { resultadoService } from '../services/api';

export const useResultadoStore = defineStore('resultado', () => {
    const loading = ref(false);
    const error = ref(null);
    const ranking = ref([]);

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

    const obtenerResultadosPorMesa = async (mesaId) => {
        loading.value = true;
        error.value = null;
        try {
            return await resultadoService.obtenerPorMesa(mesaId);
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
        obtenerRanking,
        obtenerRankingFinal,
        obtenerResultadosPorMesa,
        obtenerResultadosPorPareja,
        obtenerResultadosCampeonato
    };
}); 