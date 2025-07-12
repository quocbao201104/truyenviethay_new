<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="main-layout">
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import Header from "../components/layout/AppHeader.vue";
import Footer from "../components/layout/AppFooter.vue";
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  background-color: #1a1d29; 
}
</style>
