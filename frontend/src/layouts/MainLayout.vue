<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="main-layout">
    <AppHeader />
    <MegaphoneTicker />
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
import MegaphoneTicker from "@/components/common/MegaphoneTicker.vue";
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  background:
    radial-gradient(circle at top, rgba(91, 196, 232, 0.04), transparent 20%),
    linear-gradient(180deg, #121a27 0%, #0f1623 50%, #0b111b 100%);
}
</style>
