import { defineStore } from 'pinia';
import { resultadoService } from '../services/api';

export const useResultadoStore = defineStore('resultado', {
    state: () => ({
        loading: false,
        error: null,
    }),

    actions: {
        async crearResultados(resultado1, resultado2) {
            this.loading = true;
            this.error = null;
            try {
                await resultadoService.crear(resultado1, resultado2);
                return true;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Error al registrar los resultados';
                return false;
            } finally {
                this.loading = false;
            }
        },

        async actualizarResultados(mesaId, resultado1, resultado2) {
            this.loading = true;
            this.error = null;
            try {
                await resultadoService.actualizarPorMesa(mesaId, resultado1, resultado2);
                return true;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Error al actualizar los resultados';
                return false;
            } finally {
                this.loading = false;
            }
        },

        async obtenerResultadosPorMesa(mesaId) {
            this.loading = true;
            this.error = null;
            try {
                return await resultadoService.obtenerPorMesa(mesaId);
            } catch (error) {
                this.error = error.response?.data?.detail || 'Error al obtener los resultados';
                return [];
            } finally {
                this.loading = false;
            }
        },

        async obtenerRanking(campeonatoId) {
            this.loading = true;
            this.error = null;
            try {
                return await resultadoService.obtenerRanking(campeonatoId);
            } catch (error) {
                this.error = error.response?.data?.detail || 'Error al obtener el ranking';
                return [];
            } finally {
                this.loading = false;
            }
        },
    },
}); 