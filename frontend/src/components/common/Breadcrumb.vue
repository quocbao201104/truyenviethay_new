<script setup lang="ts">
import { computed } from 'vue';

interface BreadcrumbItem {
  name: string;
  path?: string;
}

const props = defineProps<{
  items: BreadcrumbItem[];
}>();

const schemaJson = computed(() => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": props.items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.path ? `${window.location.origin}${item.path}` : undefined
    }))
  };
  return JSON.stringify(schema);
});
</script>

<template>
  <nav class="breadcrumb-xianxia" aria-label="Breadcrumb">
    <ol class="breadcrumb-list">
      <li v-for="(item, index) in items" :key="index" class="breadcrumb-item">
        <router-link v-if="item.path && index < items.length - 1" :to="item.path" class="breadcrumb-link">
          {{ item.name }}
        </router-link>
        <span v-else class="breadcrumb-current">{{ item.name }}</span>
        <span v-if="index < items.length - 1" class="breadcrumb-separator">
          <i class="fas fa-chevron-right text-[10px] opacity-40 mx-2"></i>
        </span>
      </li>
    </ol>
    <component :is="'script'" type="application/ld+json" v-html="schemaJson"></component>
  </nav>
</template>

<style scoped>
.breadcrumb-xianxia {
  margin-bottom: 20px;
  font-size: 0.9rem;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.breadcrumb-list {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  padding: 0;
  margin: 0;
  align-items: center;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.6);
}

.breadcrumb-link {
  color: #22d3ee; /* cyan-400 */
  text-decoration: none;
  transition: all 0.3s ease;
}

.breadcrumb-link:hover {
  color: #34d399; /* emerald-400 */
  text-shadow: 0 0 8px rgba(34, 211, 238, 0.4);
}

.breadcrumb-current {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.breadcrumb-separator {
  display: flex;
  align-items: center;
}

@media (max-width: 640px) {
  .breadcrumb-xianxia {
    font-size: 0.8rem;
    padding: 6px 12px;
  }
}
</style>
