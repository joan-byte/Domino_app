import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const campeonatoService = {
    async obtenerActual() {
        try {
            const response = await api.get('/campeonatos/actual');
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                // Si no hay campeonato, retornamos null en lugar de lanzar error
                return null;
            }
            console.error('Error al obtener el campeonato actual:', error);
            throw error;
        }
    },

    async crear(campeonato) {
        try {
            const response = await api.post('/campeonatos', campeonato);
            return response.data;
        } catch (error) {
            console.error('Error al crear el campeonato:', error);
            throw error;
        }
    },

    async actualizar(id, campeonato) {
        try {
            const response = await api.put(`/campeonatos/${id}`, campeonato);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar el campeonato:', error);
            throw error;
        }
    },

    async eliminar(id) {
        try {
            const response = await api.delete(`/campeonatos/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar el campeonato:', error);
            throw error;
        }
    }
};

export const rankingService = {
    async obtenerRanking(campeonatoId) {
        try {
            const response = await api.get(`/ranking/${campeonatoId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener el ranking:', error);
            throw error;
        }
    }
};

export const parejaService = {
    async listar(campeonatoId) {
        const response = await api.get(`/parejas/${campeonatoId}`);
        return response.data;
    },
    
    async crear(pareja) {
        const response = await api.post('/parejas', pareja);
        return response.data;
    },
    
    async actualizar(id, pareja) {
        const response = await api.put(`/parejas/${id}`, pareja);
        return response.data;
    },
    
    async eliminar(id) {
        await api.delete(`/parejas/${id}`);
    },
    
    async toggleActiva(id) {
        const response = await api.patch(`/parejas/${id}/toggle-activa`);
        return response.data;
    }
};

export const mesaService = {
    async listar(campeonatoId, partida) {
        const response = await api.get(`/mesas/${campeonatoId}/${partida}`);
        return response.data;
    },
    
    async crearPorSorteo(campeonatoId) {
        const response = await api.post(`/mesas/${campeonatoId}/sorteo`);
        return response.data;
    },
    
    async crearPorRanking(campeonatoId) {
        const response = await api.post(`/mesas/${campeonatoId}/ranking`);
        return response.data;
    }
};

export const resultadoService = {
    async crear(resultado) {
        const response = await api.post('/resultados', resultado);
        return response.data;
    },
    
    async obtenerPorMesa(mesaId) {
        const response = await api.get(`/resultados/mesa/${mesaId}`);
        return response.data;
    },
    
    async actualizarPorMesa(mesaId, resultado) {
        const response = await api.put(`/resultados/mesa/${mesaId}`, resultado);
        return response.data;
    }
}; 