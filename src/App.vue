<script setup lang="ts">
import { ref, onMounted } from 'vue'

const darkMode = ref(true)

onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    darkMode.value = JSON.parse(savedDarkMode)
  }
})
</script>

<template>
  <div class="app" :class="{ 'light-mode': !darkMode }">
    <router-view />
  </div>
</template>

<style>
@import './styles/main.css';

.app {
  width: 100%;
  min-height: 100vh;
}
</style>
