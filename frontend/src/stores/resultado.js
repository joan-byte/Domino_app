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
            console.error('Error al crear resultado:', e);
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
            console.error('Error al actualizar resultados:', e);
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
            console.error('Error al obtener resultados del campeonato:', e);
            error.value = e.response?.data?.detail || 'Error al obtener los resultados del campeonato';
            return [];
        } finally {
            loading.value = false;
        }
    };

    const obtenerRanking = async (campeonatoId) => {
        if (!campeonatoId) {
            console.error('Error: campeonatoId es requerido para obtener el ranking');
            error.value = 'ID de campeonato no proporcionado';
            ranking.value = [];
            return [];
        }

        loading.value = true;
        error.value = null;
        try {
            const response = await resultadoService.obtenerRanking(campeonatoId);
            
            if (!response) {
                console.error('Store: Error - no se recibió respuesta del servidor');
                throw new Error('No se recibió respuesta del servidor');
            }
            
            if (!Array.isArray(response)) {
                console.error('Store: Error - respuesta del ranking no es un array:', response);
                throw new Error('Formato de respuesta inválido');
            }
            
            ranking.value = response;
            return response;
        } catch (e) {
            console.error('Store: Error al obtener el ranking:', e);
            if (e.response) {
                console.error('Store: Detalles del error:', {
                    status: e.response.status,
                    data: e.response.data,
                    headers: e.response.headers,
                    url: e.response?.config?.url
                });
            }
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
            const response = await resultadoService.obtenerPorMesa(mesaId, partida);
            return response;
        } catch (e) {
            console.error('Error al obtener resultados de mesa:', e);
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
            const response = await resultadoService.obtenerResultadosPorPareja(parejaId);
            return response;
        } catch (e) {
            console.error('Error al obtener resultados de pareja:', e);
            error.value = e.response?.data?.detail || 'Error al obtener los resultados';
            return [];
        } finally {
            loading.value = false;
        }
    };

    const obtenerResultadosPorPartida = async (campeonatoId, partida) => {
        loading.value = true;
        error.value = null;
        try {
            // Primero obtener todos los resultados del campeonato
            const todosResultados = await resultadoService.obtenerResultadosCampeonato(campeonatoId);
            // Filtrar solo los resultados de la partida especificada
            const resultadosPartida = todosResultados.filter(r => r.partida === partida);
            return resultadosPartida;
        } catch (e) {
            console.error('Error al obtener resultados por partida:', e);
            error.value = e.response?.data?.detail || 'Error al obtener los resultados por partida';
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
        obtenerResultadosCampeonato,
        obtenerResultadosPorPartida
    };
}); 