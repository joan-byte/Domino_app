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
            await obtenerActual();
        } catch (e) {
            error.value = 'Error al cerrar la inscripción';
            throw e;
        }
    };

    return {
        campeonato,
        error,
        obtenerActual,
        cerrarInscripcion
    };
}); 