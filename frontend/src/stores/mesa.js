import { defineStore } from 'pinia';
import { ref } from 'vue';
import { mesaService } from '../services/api';

export const useMesaStore = defineStore('mesa', () => {
    const mesas = ref([]);
    const error = ref(null);
    const loading = ref(false);

    const fetchMesas = async (campeonatoId, partida) => {
        loading.value = true;
        try {
            const response = await mesaService.obtenerMesas(campeonatoId);
            mesas.value = response;
            return response;
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
        const parejasActivas = parejas.filter(p => p.activa);
        if (parejasActivas.length < 4) {
            error.value = 'Se necesitan al menos 4 parejas activas para crear las mesas';
            return false;
        }
        return true;
    };

    const todasMesasConResultados = () => {
        return mesas.value.every(mesa => {
            return mesa.resultados && mesa.resultados.length > 0;
        });
    };

    const getMesaById = (id) => {
        return mesas.value.find(m => m.id === id);
    };

    return {
        mesas,
        error,
        loading,
        fetchMesas,
        crearMesasPorSorteo,
        eliminarMesas,
        puedeCrearMesas,
        todasMesasConResultados,
        getMesaById
    };
}); 