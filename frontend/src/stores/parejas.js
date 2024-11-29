import { defineStore } from 'pinia'
import { ref } from 'vue'
import { parejaService } from '../services/api'

export const useParejasStore = defineStore('parejas', () => {
  const parejas = ref([])
  const error = ref(null)

  const obtenerParejas = async (campeonatoId) => {
    try {
      const data = await parejaService.obtenerParejas(campeonatoId)
      parejas.value = data
      return data
    } catch (e) {
      error.value = 'Error al obtener las parejas'
      throw e
    }
  }

  const obtenerPareja = async (id) => {
    try {
      const data = await parejaService.obtenerPareja(id)
      return data
    } catch (e) {
      error.value = 'Error al obtener la pareja'
      throw e
    }
  }

  const crearPareja = async (data) => {
    try {
      const nuevaPareja = await parejaService.crear(data)
      parejas.value.push(nuevaPareja)
      return nuevaPareja
    } catch (e) {
      error.value = e.response?.data?.detail?.[0]?.msg || 'Error al crear la pareja'
      throw e
    }
  }

  const actualizarPareja = async (id, data) => {
    try {
      // Asegurarse de que los datos cumplen con el esquema
      const parejaData = {
        nombre: data.nombre,
        club_pertenencia: data.club_pertenencia,
        activa: data.activa ?? true,
        campeonato_id: parseInt(data.campeonato_id),
        jugadores: data.jugadores.map(j => ({
          nombre: j.nombre,
          apellido: j.apellido
        }))
      }

      const parejaActualizada = await parejaService.actualizar(id, parejaData)
      const index = parejas.value.findIndex(p => p.id === id)
      if (index !== -1) {
        parejas.value[index] = parejaActualizada
      }
      return parejaActualizada
    } catch (e) {
      error.value = e.response?.data?.detail?.[0]?.msg || 'Error al actualizar la pareja'
      throw e
    }
  }

  const toggleEstado = async (id) => {
    try {
      const parejaActualizada = await parejaService.toggleEstado(id)
      const index = parejas.value.findIndex(p => p.id === id)
      if (index !== -1) {
        parejas.value[index] = parejaActualizada
      }
      return parejaActualizada
    } catch (e) {
      error.value = e.response?.data?.detail?.[0]?.msg || 'Error al cambiar el estado de la pareja'
      throw e
    }
  }

  const eliminarPareja = async (id) => {
    try {
      await parejaService.eliminar(id)
      parejas.value = parejas.value.filter(p => p.id !== id)
    } catch (e) {
      error.value = e.response?.data?.detail?.[0]?.msg || 'Error al eliminar la pareja'
      throw e
    }
  }

  return {
    parejas,
    error,
    obtenerParejas,
    obtenerPareja,
    crearPareja,
    actualizarPareja,
    toggleEstado,
    eliminarPareja
  }
}) 