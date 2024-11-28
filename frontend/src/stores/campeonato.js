import { defineStore } from 'pinia';
import { campeonatoService } from '../services/api';

export const useCampeonatoStore = defineStore('campeonato', {
    state: () => ({
        campeonato: null,
        loading: false,
        error: null,
    }),

    getters: {
        isActive: (state) => !!state.campeonato,
        currentPartida: (state) => state.campeonato?.partida_actual || 0,
    },

    actions: {
        async fetchCampeonatoActual() {
            this.loading = true;
            this.error = null;
            try {
                this.campeonato = await campeonatoService.obtenerActual();
            } catch (error) {
                this.error = error.response?.data?.detail || 'Error al obtener el campeonato';
                this.campeonato = null;
            } finally {
                this.loading = false;
            }
        },

        async crearCampeonato(campeonato) {
            this.loading = true;
            this.error = null;
            try {
                this.campeonato = await campeonatoService.crear(campeonato);
                return true;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Error al crear el campeonato';
                return false;
            } finally {
                this.loading = false;
            }
        },

        async actualizarCampeonato(id, campeonato) {
            this.loading = true;
            this.error = null;
            try {
                this.campeonato = await campeonatoService.actualizar(id, campeonato);
                return true;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Error al actualizar el campeonato';
                return false;
            } finally {
                this.loading = false;
            }
        },

        async eliminarCampeonato(id) {
            this.loading = true;
            this.error = null;
            try {
                await campeonatoService.eliminar(id);
                this.campeonato = null;
                return true;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Error al eliminar el campeonato';
                return false;
            } finally {
                this.loading = false;
            }
        },
    },
}); 