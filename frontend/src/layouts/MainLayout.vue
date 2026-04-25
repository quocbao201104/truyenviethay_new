<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="main-layout" :class="{ 'main-layout--reader': isReaderRoute }">
    <AppHeader />
    <LazyMegaphoneTicker v-if="shouldLoadRealtimeUi" />
    <main class="main-content" :class="{ 'main-content--reader': isReaderRoute }">
      <slot />
    </main>
    <AppFooter v-if="!isReaderRoute" />
    <LazyUnifiedChat v-if="shouldLoadRealtimeUi" />
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import { useAuthStore } from "@/modules/auth/auth.store";

const route = useRoute();
const authStore = useAuthStore();
const isReaderRoute = computed(() => route.name === "ChapterRead");
const isRealtimeUiReady = ref(false);
const shouldLoadRealtimeUi = computed(() => isRealtimeUiReady.value && authStore.isLoggedIn);

const LazyUnifiedChat = defineAsyncComponent({
  loader: () => import("@/components/common/UnifiedChat.vue"),
  delay: 400,
  suspensible: false,
});

const LazyMegaphoneTicker = defineAsyncComponent({
  loader: () => import("@/components/common/MegaphoneTicker.vue"),
  delay: 400,
  suspensible: false,
});

let idleHandle = null;
let fallbackTimer = null;

const loadRealtimeUi = () => {
  isRealtimeUiReady.value = true;
};

onMounted(() => {
  if (typeof window === "undefined") {
    loadRealtimeUi();
    return;
  }

  if ("requestIdleCallback" in window) {
    idleHandle = window.requestIdleCallback(loadRealtimeUi, { timeout: 2500 });
    return;
  }

  fallbackTimer = window.setTimeout(loadRealtimeUi, 1800);
});

onUnmounted(() => {
  if (idleHandle !== null && "cancelIdleCallback" in window) {
    window.cancelIdleCallback(idleHandle);
  }

  if (fallbackTimer !== null) {
    window.clearTimeout(fallbackTimer);
  }
});
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

.main-layout--reader {
  height: 100dvh;
  min-height: 100dvh;
  overflow: hidden;
}

.main-layout--reader .main-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}
</style>
