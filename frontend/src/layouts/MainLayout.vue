<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="main-layout">
    <AppHeader />
    <main class="main-content">
      <slot />
    </main>
    <AppFooter />
    <UnifiedChat />
  </div>
</template>

<script setup>
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import UnifiedChat from "@/components/common/UnifiedChat.vue";
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
