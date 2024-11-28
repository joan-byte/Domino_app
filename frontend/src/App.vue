<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <RouterLink to="/" class="text-xl font-bold text-gray-800">
                Torneo de Dominó
              </RouterLink>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <RouterLink
                to="/"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                :class="[$route.path === '/' ? 'border-b-2 border-blue-500 text-gray-900' : 'text-gray-500 hover:text-gray-700']"
              >
                Inicio
              </RouterLink>
              <RouterLink
                to="/parejas"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                :class="[$route.path === '/parejas' ? 'border-b-2 border-blue-500 text-gray-900' : 'text-gray-500 hover:text-gray-700']"
              >
                Parejas
              </RouterLink>
              <RouterLink
                to="/mesas"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                :class="[$route.path === '/mesas' ? 'border-b-2 border-blue-500 text-gray-900' : 'text-gray-500 hover:text-gray-700']"
              >
                Mesas
              </RouterLink>
              <RouterLink
                to="/ranking"
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                :class="[$route.path === '/ranking' ? 'border-b-2 border-blue-500 text-gray-900' : 'text-gray-500 hover:text-gray-700']"
              >
                Ranking
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
