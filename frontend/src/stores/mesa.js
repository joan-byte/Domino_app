import { defineStore } from 'pinia';
import { mesaService } from '../services/api';

export const useMesaStore = defineStore('mesa', {
    state: () => ({
        mesas: [],
        loading: false,
        error: null,
    }),

    getters: {
        mesasActuales: (state) => state.mesas,
        totalMesas: (state) => state.mesas.length,
        // Obtener mesa por ID
        getMesaById: (state) => (id) => state.mesas.find(m => m.id === id),
    },

    actions: {
        async fetchMesas(campeonatoId, partida) {
            this.loading = true;
            this.error = null;
            try {
                this.mesas = await mesaService.listar(campeonatoId, partida);
            } catch (error) {
                this.error = error.response?.data?.detail || 'Error al obtener las mesas';
                this.mesas = [];
            } finally {
                this.loading = false;
            }
        },

        async crearMesasPorSorteo(campeonatoId) {
            this.loading = true;
            this.error = null;
            try {
                this.mesas = await mesaService.crearPorSorteo(campeonatoId);
                return true;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Error al crear las mesas por sorteo';
                return false;
            } finally {
                this.loading = false;
            }
        },

        async crearMesasPorRanking(campeonatoId) {
            this.loading = true;
            this.error = null;
            try {
                this.mesas = await mesaService.crearPorRanking(campeonatoId);
                return true;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Error al crear las mesas por ranking';
                return false;
            } finally {
                this.loading = false;
            }
        },

        // Método para verificar si todas las mesas tienen resultados
        todasMesasConResultados() {
            return this.mesas.every(mesa => {
                // Aquí deberíamos verificar si la mesa tiene resultados registrados
                // Esto dependerá de cómo se almacenen los resultados en el backend
                return mesa.resultados && mesa.resultados.length > 0;
            });
        },

        // Método para obtener el estado de una mesa (con/sin resultados)
        getMesaStatus(mesaId) {
            const mesa = this.getMesaById(mesaId);
            if (!mesa) return 'no_existe';
            if (mesa.resultados && mesa.resultados.length > 0) return 'con_resultados';
            return 'sin_resultados';
        },

        // Limpiar el estado
        clearState() {
            this.mesas = [];
            this.error = null;
            this.loading = false;
        },

        // Método para validar si se puede cerrar la inscripción
        puedeCrearMesas(parejas) {
            // Verificar que hay al menos 4 parejas activas
            const parejasActivas = parejas.filter(p => p.activa);
            if (parejasActivas.length < 4) {
                this.error = 'Se necesitan al menos 4 parejas activas para crear las mesas';
                return false;
            }
            return true;
        },

        // Método para validar si se puede cerrar la partida actual
        puedeCrearSiguienteRonda(campeonato) {
            // Verificar que no se ha alcanzado el número máximo de partidas
            if (campeonato.partida_actual >= campeonato.numero_partidas) {
                this.error = 'Ya se han jugado todas las partidas del campeonato';
                return false;
            }
            // Verificar que todas las mesas tienen resultados
            if (!this.todasMesasConResultados()) {
                this.error = 'Todas las mesas deben tener resultados registrados';
                return false;
            }
            return true;
        }
    },
}); 