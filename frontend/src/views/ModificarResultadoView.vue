<template>
  <div class="container mx-auto px-4 py-8">
    <ResultadoForm
      v-if="mesa && pareja1 && pareja2"
      :mesa="mesa"
      :pareja1="pareja1"
      :pareja2="pareja2"
      :partida="partida"
      :resultado-existente="resultadoExistente"
      @guardar="guardarResultado"
      @cancelar="cancelar"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useResultadoStore } from '../stores/resultado';
import ResultadoForm from '../components/ResultadoForm.vue';

const router = useRouter();
const route = useRoute();
const resultadoStore = useResultadoStore();

const mesa = ref(null);
const pareja1 = ref(null);
const pareja2 = ref(null);
const partida = ref(0);
const resultadoExistente = ref(null);

onMounted(async () => {
  try {
    const resultado = await resultadoStore.obtenerResultado(route.params.id);
    mesa.value = resultado.mesa;
    pareja1.value = resultado.pareja1;
    pareja2.value = resultado.pareja2;
    partida.value = resultado.partida;
    resultadoExistente.value = resultado;
  } catch (error) {
    console.error('Error al cargar el resultado:', error);
    router.push('/mesas/registro');
  }
});

const guardarResultado = async (datos) => {
  try {
    await resultadoStore.actualizarResultado(route.params.id, datos);
    router.push('/mesas/registro');
  } catch (error) {
    console.error('Error al actualizar el resultado:', error);
  }
};

const cancelar = () => {
  router.push('/mesas/registro');
};
</script> 