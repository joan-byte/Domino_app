<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Título -->
    <div class="text-center mb-12">
      <h1 class="text-3xl font-bold flex items-center justify-center gap-2">
        <span class="text-2xl">🏆</span>
        Podium del Campeonato
        <span class="text-2xl">🏆</span>
      </h1>
      <p class="text-gray-600 mt-2">{{ campeonato?.club }}</p>
    </div>

    <!-- Podium -->
    <div class="flex justify-center items-end gap-4 mb-16 h-80">
      <!-- Segundo lugar -->
      <div class="w-64 flex flex-col items-center">
        <div class="text-3xl mb-2">🥈</div>
        <div class="bg-gray-100 p-6 rounded-t-lg w-full text-center h-48">
          <div class="font-bold text-xl mb-1">Pareja {{ segundoLugar?.numero }}</div>
          <div class="text-lg mb-2">{{ segundoLugar?.nombre }}</div>
          <div class="text-gray-600 mb-4">{{ segundoLugar?.club }}</div>
          <div class="text-sm">
            <div>PG: {{ segundoLugar?.pg }}</div>
            <div>PP: {{ segundoLugar?.pp }}</div>
          </div>
        </div>
      </div>

      <!-- Primer lugar -->
      <div class="w-64 flex flex-col items-center">
        <div class="text-3xl mb-2">🏆</div>
        <div class="bg-yellow-100 p-6 rounded-t-lg w-full text-center h-64">
          <div class="font-bold text-xl mb-1">Pareja {{ primerLugar?.numero }}</div>
          <div class="text-lg mb-2">{{ primerLugar?.nombre }}</div>
          <div class="text-gray-600 mb-4">{{ primerLugar?.club }}</div>
          <div class="text-sm">
            <div>PG: {{ primerLugar?.pg }}</div>
            <div>PP: {{ primerLugar?.pp }}</div>
          </div>
        </div>
      </div>

      <!-- Tercer lugar -->
      <div class="w-64 flex flex-col items-center">
        <div class="text-3xl mb-2">🥉</div>
        <div class="bg-orange-100 p-6 rounded-t-lg w-full text-center h-40">
          <div class="font-bold text-xl mb-1">Pareja {{ tercerLugar?.numero }}</div>
          <div class="text-lg mb-2">{{ tercerLugar?.nombre }}</div>
          <div class="text-gray-600 mb-4">{{ tercerLugar?.club }}</div>
          <div class="text-sm">
            <div>PG: {{ tercerLugar?.pg }}</div>
            <div>PP: {{ tercerLugar?.pp }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ranking Final -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold">Ranking Final</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posición
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pareja
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Club
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PG
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PP
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(pareja, index) in ranking" :key="pareja.id"
                :class="{'bg-yellow-50': index === 0, 'bg-gray-50': index === 1, 'bg-orange-50': index === 2}">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span class="text-sm font-medium text-gray-900">{{ index + 1 }}</span>
                  <span v-if="index < 3" class="ml-2">
                    {{ index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉' }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ pareja.numero }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ pareja.nombre }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ pareja.club }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ pareja.pg }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ pareja.pp }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useResultadoStore } from '../stores/resultado';
import { useCampeonatoStore } from '../stores/campeonato';

const resultadoStore = useResultadoStore();
const campeonatoStore = useCampeonatoStore();

const campeonato = ref(null);
const ranking = ref([]);

const primerLugar = computed(() => ranking.value[0] || null);
const segundoLugar = computed(() => ranking.value[1] || null);
const tercerLugar = computed(() => ranking.value[2] || null);

onMounted(async () => {
  try {
    campeonato.value = await campeonatoStore.obtenerActual();
    const resultado = await resultadoStore.obtenerRankingFinal(campeonato.value.id);
    ranking.value = resultado;
  } catch (error) {
    console.error('Error al cargar el podium:', error);
  }
});
</script> 