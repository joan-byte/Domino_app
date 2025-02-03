<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navbar -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-16">
          <div class="flex flex-col w-full">
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center h-16">
              <h1 class="text-xl font-bold text-gray-900">Domino App</h1>
            </div>
            <!-- Navigation Links -->
            <div class="flex flex-col space-y-2 py-2">
              <router-link
                v-for="item in navigationItems"
                :key="item.name"
                :to="item.to"
                class="inline-flex items-center px-3 py-2 border-l-4"
                :class="[
                  $route.path === item.to
                    ? 'border-primary-500 text-gray-900 bg-gray-50'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50'
                ]"
              >
                {{ item.name }}
              </router-link>
              <!-- Submenú de Resultados -->
              <div class="pl-4">
                <router-link
                  v-for="subItem in resultadosItems"
                  :key="subItem.name"
                  :to="subItem.to"
                  class="inline-flex items-center px-3 py-2 border-l-4 w-full"
                  :class="[
                    $route.path === subItem.to
                      ? 'border-primary-500 text-gray-900 bg-gray-50'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50'
                  ]"
                >
                  {{ subItem.name }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <slot></slot>
    </main>
  </div>
</template>

<script setup>
const navigationItems = [
  { name: 'Home', to: '/' },
  { name: 'Parejas', to: '/parejas' },
  { name: 'Mesas', to: '/mesas' },
  { name: 'Resultados', to: '/resultados' }
];

const resultadosItems = [
  { name: 'Ranking', to: '/resultados' },
  { name: 'Podium', to: '/podium' },
  { name: 'Ranking Completo', to: '/ranking' }
];
</script>

<style scoped>
.border-primary-500 {
  border-color: #3B82F6;
}
</style> 