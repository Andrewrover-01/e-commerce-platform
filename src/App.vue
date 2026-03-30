<template>
  <div id="app-root">
    <AppHeader />
    <AppNav />
    <router-view />
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '@/components/layout/AppHeader.vue'
import AppNav from '@/components/layout/AppNav.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
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
