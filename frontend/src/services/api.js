import axios from 'axios';

// Crear instancia de axios con la configuración base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('Error de respuesta:', error.response.data);
    } else if (error.request) {
      console.error('Error de petición:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const campeonatoService = {
  async obtenerActual() {
    try {
      const response = await api.get('/campeonatos/actual');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async obtenerDetalles() {
    const response = await api.get('/campeonatos/actual/detalles');
    return response.data;
  },

  async crear(data) {
    const response = await api.post('/campeonatos', data);
    return response.data;
  },

  async actualizar(id, data) {
    const response = await api.put(`/campeonatos/${id}`, data);
    return response.data;
  },

  async eliminar(id) {
    const response = await api.delete(`/campeonatos/${id}`);
    return response.data;
  },

  async cerrarInscripcion(id) {
    const response = await api.post(`/campeonatos/${id}/cerrar-inscripcion`);
    return response.data;
  },

  async actualizarPartida(id, partida) {
    const response = await api.put(`/campeonatos/${id}/partida`, { partida });
    return response.data;
  }
};

export const parejaService = {
  async obtenerParejas(campeonatoId) {
    const response = await api.get(`/campeonatos/${campeonatoId}/parejas`);
    return response.data;
  },

  async obtenerPareja(id) {
    const response = await api.get(`/parejas/${id}`);
    return response.data;
  },

  async crear(data) {
    const response = await api.post('/parejas', data);
    return response.data;
  },

  async actualizar(id, data) {
    const response = await api.put(`/parejas/${id}`, data);
    return response.data;
  },

  async toggleEstado(id) {
    const response = await api.put(`/parejas/${id}/activar`);
    return response.data;
  },

  async eliminar(id) {
    const response = await api.delete(`/parejas/${id}`);
    return response.data;
  }
};

export const mesaService = {
  async obtenerMesas(campeonatoId, partida) {
    const response = await api.get(`/mesas?campeonato_id=${campeonatoId}&partida=${partida}`);
    return response.data;
  },

  async crearMesas(campeonatoId) {
    const response = await api.post(`/campeonatos/${campeonatoId}/mesas`);
    return response.data;
  },

  async obtenerMesa(id) {
    const response = await api.get(`/mesas/${id}`);
    return response.data;
  },

  async eliminarMesas(campeonatoId) {
    const response = await api.delete(`/campeonatos/${campeonatoId}/mesas`);
    return response.data;
  }
};

export const resultadoService = {
  async crear(resultado1, resultado2 = null) {
    if (resultado2) {
      // Caso normal: dos parejas
      const response = await api.post('/resultados', { resultado1, resultado2 });
      return response.data;
    } else {
      // Caso especial: una sola pareja
      const response = await api.post('/resultados', { resultado1 });
      return response.data;
    }
  },

  async obtenerPorMesa(mesaId) {
    const response = await api.get(`/resultados/mesa/${mesaId}`);
    return response.data;
  },

  async obtenerResultadosCampeonato(campeonatoId) {
    const response = await api.get(`/resultados/campeonato/${campeonatoId}`);
    return response.data;
  },

  async actualizarPorMesa(mesaId, resultado1, resultado2 = null) {
    if (resultado2) {
      // Caso normal: dos parejas
      const response = await api.put(`/resultados/mesa/${mesaId}`, { resultado1, resultado2 });
      return response.data;
    } else {
      // Caso especial: una sola pareja
      const response = await api.put(`/resultados/mesa/${mesaId}`, { resultado1 });
      return response.data;
    }
  },

  async obtenerResultado(id) {
    const response = await api.get(`/resultados/${id}`);
    return response.data;
  },

  async actualizarResultado(id, data) {
    const response = await api.put(`/resultados/${id}`, data);
    return response.data;
  },

  async obtenerRankingFinal(campeonatoId) {
    const response = await api.get(`/campeonatos/${campeonatoId}/ranking-final`);
    return response.data;
  }
};

export { api }; 