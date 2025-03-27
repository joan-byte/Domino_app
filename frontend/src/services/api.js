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
    console.error('Error en la petición:', error);
    if (error.response) {
      console.error('Datos de la respuesta:', error.response.data);
      console.error('Estado:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No se recibió respuesta:', error.request);
    } else {
      console.error('Error al configurar la petición:', error.message);
    }
    return Promise.reject(error);
  }
);

// Nuevo servicio para gestionar plantillas de impresión
export const plantillaService = {
  /**
   * Sube una plantilla de mesas al servidor
   * @param {string} dataUrl - URL de datos de la imagen (base64)
   * @returns {Promise<Object>} - Respuesta con la URL de la plantilla guardada
   */
  async subirPlantilla(dataUrl) {
    try {
      // Convertir dataURL a un objeto Blob
      const fetchResponse = await fetch(dataUrl);
      const blob = await fetchResponse.blob();
      
      // Crear un objeto FormData para la subida de archivos
      const formData = new FormData();
      formData.append('file', blob, 'plantilla_mesas.png');
      
      // Configurar los headers para el multipart/form-data
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      
      try {
        const response = await api.post('/plantillas/mesas', formData, config);
        return response.data;
      } catch (error) {
        // Si el servidor no está disponible o devuelve error 404, usar localStorage como respaldo
        console.error('Error al guardar en servidor, usando localStorage:', error);
        // Retornar un objeto similar al que devolvería el servidor
        return { url: dataUrl };
      }
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      throw error;
    }
  },
  
  /**
   * Obtiene la URL de la plantilla actual
   * @returns {Promise<string>} - URL de la plantilla guardada o null si no existe
   */
  async obtenerPlantilla() {
    try {
      const response = await api.get('/plantillas/mesas');
      return response.data.url;
    } catch (error) {
      // Si el servidor no está disponible o devuelve error 404, usar localStorage como respaldo
      console.log('No se pudo obtener la plantilla del servidor, buscando en localStorage');
      const localTemplate = localStorage.getItem('plantilla_mesas_url');
      if (localTemplate) {
        return localTemplate;
      }
      return null;
    }
  }
};

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
    const response = await api.get('/resultados/ranking');
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
  },

  async reiniciarCampeonato(id) {
    const response = await api.put(`/campeonatos/${id}/reiniciar`);
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
    const response = await api.get(`/mesas`, {
      params: {
        campeonato_id: campeonatoId,
        partida: partida
      }
    });
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
    const response = await api.delete(`/mesas/campeonato/${campeonatoId}`);
    return response.data;
  },

  async crearMesasPorRanking(campeonatoId) {
    const response = await api.post(`/mesas/ranking?campeonato_id=${campeonatoId}`);
    return response.data;
  }
};

export const resultadoService = {
  async crear(resultado1, resultado2 = null) {
    if (resultado2) {
      const response = await api.post('/resultados', { resultado1, resultado2 });
      return response.data;
    } else {
      const response = await api.post('/resultados', { resultado1 });
      return response.data;
    }
  },

  async obtenerPorMesa(mesaId, partida) {
    const response = await api.get(`/resultados/mesa/${mesaId}?partida=${partida}`);
    return response.data;
  },

  async obtenerResultadosCampeonato(campeonatoId) {
    const response = await api.get(`/resultados/campeonato/${campeonatoId}`);
    return response.data;
  },

  async obtenerRanking(campeonatoId) {
    if (!campeonatoId) {
      console.error('Error: campeonatoId es requerido');
      throw new Error('ID de campeonato es requerido');
    }
    
    console.log('Realizando petición GET a /resultados/ranking con campeonato_id:', campeonatoId);
    try {
      const response = await api.get(`/resultados/ranking?campeonato_id=${campeonatoId}`);
      console.log('Respuesta recibida:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error en obtenerRanking:', error);
      if (error.response) {
        console.error('Detalles del error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
          url: error.response.config.url
        });
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor:', error.request);
      }
      throw error;
    }
  },

  async obtenerResultadosPorPareja(parejaId) {
    const response = await api.get(`/resultados/pareja/${parejaId}`);
    return response.data;
  },

  async actualizarPorMesa(mesaId, resultado1, resultado2 = null) {
    const data = {
      resultado1: resultado1,
      resultado2: resultado2
    };
    const response = await api.put(`/resultados/mesa/${mesaId}`, data);
    return response.data;
  },

  async recalcularValores(campeonatoId) {
    const response = await api.post(`/resultados/recalcular/${campeonatoId}`);
    return response.data;
  }
};

export { api }; 