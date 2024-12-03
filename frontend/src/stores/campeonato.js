import { defineStore } from 'pinia';
import { ref } from 'vue';
import { campeonatoService } from '../services/api';

export const useCampeonatoStore = defineStore('campeonato', () => {
    const campeonato = ref(null);
    const error = ref(null);

    const obtenerActual = async () => {
        try {
            const data = await campeonatoService.obtenerActual();
            campeonato.value = data;
            return data;
        } catch (e) {
            error.value = 'Error al obtener el campeonato actual';
            throw e;
        }
    };

    const cerrarInscripcion = async (id) => {
        try {
            await campeonatoService.cerrarInscripcion(id);
            const campeonatoActualizado = await campeonatoService.obtenerActual();
            campeonato.value = campeonatoActualizado;
            error.value = null;
            return campeonatoActualizado;
        } catch (e) {
            error.value = e.response?.data?.detail || 'Error al cerrar la inscripción';
            throw e;
        }
    };

    const reiniciarCampeonato = async (id) => {
        try {
            await campeonatoService.reiniciarCampeonato(id);
            const campeonatoActualizado = await campeonatoService.obtenerActual();
            campeonato.value = campeonatoActualizado;
            error.value = null;
            return campeonatoActualizado;
        } catch (e) {
            error.value = e.response?.data?.detail || 'Error al reiniciar el campeonato';
            throw e;
        }
    };

    return {
        campeonato,
        error,
        obtenerActual,
        cerrarInscripcion,
        reiniciarCampeonato
    };
}); 