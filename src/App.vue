<template>
  <template v-if="isAdminRoute">
    <router-view />
  </template>
  <template v-else>
    <div id="app-root">
      <AppHeader />
      <AppNav />
      <router-view />
      <AppFooter />
    </div>
  </template>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppNav from '@/components/layout/AppNav.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
#app-root {
  min-height: 100vh;
  background: #f7f7f7;
}
</style>
