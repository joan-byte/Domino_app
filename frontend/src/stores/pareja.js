import { defineStore } from 'pinia';
import { parejaService } from '../services/api';

export const useParejaStore = defineStore('pareja', {
    state: () => ({
        parejas: [],
        loading: false,
        error: null,
    }),

    getters: {
        parejasActivas: (state) => state.parejas.filter(p => p.activa),
        totalParejas: (state) => state.parejas.length,
    },

    actions: {
        async fetchParejas(campeonatoId) {
            this.loading = true;
            this.error = null;
            try {
                this.parejas = await parejaService.listar(campeonatoId);
            } catch (error) {
                this.error = error.response?.data?.detail || 'Error al obtener las parejas';
                this.parejas = [];
            } finally {
                this.loading = false;
            }
        },

        async crearPareja(pareja) {
            this.loading = true;
            this.error = null;
            try {
                const nuevaPareja = await parejaService.crear(pareja);
                this.parejas.push(nuevaPareja);
                return true;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Error al crear la pareja';
                return false;
            } finally {
                this.loading = false;
            }
        },

        async actualizarPareja(id, pareja) {
            this.loading = true;
            this.error = null;
            try {
                const parejaActualizada = await parejaService.actualizar(id, pareja);
                const index = this.parejas.findIndex(p => p.id === id);
                if (index !== -1) {
                    this.parejas[index] = parejaActualizada;
                }
                return true;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Error al actualizar la pareja';
                return false;
            } finally {
                this.loading = false;
            }
        },

        async toggleActivaPareja(id) {
            this.loading = true;
            this.error = null;
            try {
                await parejaService.toggleActiva(id);
                const pareja = this.parejas.find(p => p.id === id);
                if (pareja) {
                    pareja.activa = !pareja.activa;
                }
                return true;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Error al cambiar el estado de la pareja';
                return false;
            } finally {
                this.loading = false;
            }
        },

        async eliminarPareja(id) {
            this.loading = true;
            this.error = null;
            try {
                await parejaService.eliminar(id);
                this.parejas = this.parejas.filter(p => p.id !== id);
                return true;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Error al eliminar la pareja';
                return false;
            } finally {
                this.loading = false;
            }
        },
    },
}); 