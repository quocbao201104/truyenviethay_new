---
description: Add a new page/view to the frontend
---

# Add New Frontend Page

This workflow guides you through creating a new page in the Vue.js frontend application.

## Steps

### 1. Create the View Component

Create a new view file in `frontend/src/views/`:

**Example**: `frontend/src/views/FeatureView.vue`

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFeatureStore } from '@/modules/feature/feature.store';

const store = useFeatureStore();
const loading = ref(true);

onMounted(async () => {
  await store.fetchData();
  loading.value = false;
});
</script>

<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Feature Page</h1>
    
    <div v-if="loading" class="text-center">
      <p>Loading...</p>
    </div>
    
    <div v-else>
      <!-- Your content here -->
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles if needed */
</style>
```

### 2. Add Route Configuration

Update `frontend/src/router/index.ts`:

```typescript
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // ... existing routes
  {
    path: '/feature',
    name: 'Feature',
    component: () => import('@/views/FeatureView.vue'),
    meta: { 
      requiresAuth: true,  // Require login
      title: 'Feature Page'
    }
  }
];
```

**For nested routes**:
```typescript
{
  path: '/feature',
  component: () => import('@/layouts/MainLayout.vue'),
  children: [
    {
      path: '',
      name: 'FeatureList',
      component: () => import('@/views/FeatureListView.vue')
    },
    {
      path: ':id',
      name: 'FeatureDetail',
      component: () => import('@/views/FeatureDetailView.vue')
    }
  ]
}
```

### 3. Create Feature Module

Organize related components in `frontend/src/modules/feature/`:

#### Service Layer (`feature.service.ts`)

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export default {
  async fetchAll() {
    const response = await axios.get(`${API_URL}/feature`);
    return response.data.data;
  },

  async getById(id: number) {
    const response = await axios.get(`${API_URL}/feature/${id}`);
    return response.data.data;
  },

  async create(data: any) {
    const response = await axios.post(`${API_URL}/feature`, data);
    return response.data;
  },

  async update(id: number, data: any) {
    const response = await axios.put(`${API_URL}/feature/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await axios.delete(`${API_URL}/feature/${id}`);
    return response.data;
  }
};
```

#### Pinia Store (`feature.store.ts`)

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import featureService from './feature.service';

export const useFeatureStore = defineStore('feature', () => {
  // State
  const items = ref<any[]>([]);
  const currentItem = ref<any | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const hasItems = computed(() => items.value.length > 0);
  const itemCount = computed(() => items.value.length);

  // Actions
  async function fetchData() {
    loading.value = true;
    error.value = null;
    try {
      items.value = await featureService.fetchAll();
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch data';
      console.error('Error fetching data:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchById(id: number) {
    loading.value = true;
    try {
      currentItem.value = await featureService.getById(id);
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function createItem(data: any) {
    loading.value = true;
    try {
      await featureService.create(data);
      await fetchData(); // Refresh list
      return true;
    } catch (err: any) {
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    items,
    currentItem,
    loading,
    error,
    hasItems,
    itemCount,
    fetchData,
    fetchById,
    createItem
  };
});
```

#### TypeScript Types (`feature.types.ts`)

```typescript
export interface Feature {
  id: number;
  name: string;
  description?: string;
  ngay_tao: string;
  ngay_cap_nhat?: string;
}

export interface FeatureCreatePayload {
  name: string;
  description?: string;
}
```

### 4. Create Reusable Components (if needed)

Create components in `frontend/src/components/feature/`:

**Example**: `FeatureCard.vue`

```vue
<script setup lang="ts">
import type { Feature } from '@/modules/feature/feature.types';

defineProps<{
  feature: Feature;
}>();

const emit = defineEmits<{
  (e: 'click', feature: Feature): void;
}>();
</script>

<template>
  <div 
    class="p-4 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
    @click="emit('click', feature)"
  >
    <h3 class="text-xl font-semibold">{{ feature.name }}</h3>
    <p class="text-gray-600 mt-2">{{ feature.description }}</p>
  </div>
</template>
```

### 5. Add Navigation Link

Update navigation in `frontend/src/components/` or `frontend/src/layouts/`:

```vue
<template>
  <nav>
    <router-link to="/feature" class="nav-link">
      Feature
    </router-link>
  </nav>
</template>
```

### 6. Test the Page

// turbo
Start the development server:

```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:5173/feature` in your browser.

## Checklist

- [ ] View component created in `/views`
- [ ] Route added to router configuration
- [ ] Service layer created for API calls
- [ ] Pinia store created for state management
- [ ] TypeScript interfaces defined
- [ ] Reusable components created
- [ ] Navigation link added
- [ ] Page tested in browser
- [ ] Responsive design verified
- [ ] Error handling implemented

## Best Practices

### Composition API
- Use `<script setup>` syntax
- Define types with TypeScript
- Use `ref` for primitive values, `reactive` for objects

### State Management
- Use Pinia stores for shared state
- Keep component-specific state in components
- Handle loading and error states

### Styling
- Use TailwindCSS utility classes
- Follow existing dark theme conventions
- Ensure mobile responsiveness
- Use semantic HTML

### Performance
- Lazy load route components with `() => import()`
- Use computed properties for derived state
- Add `:key` to list items
- Avoid unnecessary re-renders

## Common Patterns

### Form Handling
```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useToast } from 'vue-toastification';

const toast = useToast();
const formData = ref({ name: '', description: '' });
const submitting = ref(false);

async function handleSubmit() {
  submitting.value = true;
  try {
    await service.create(formData.value);
    toast.success('Created successfully!');
  } catch (error) {
    toast.error('Failed to create');
  } finally {
    submitting.value = false;
  }
}
</script>
```

### Loading State
```vue
<template>
  <div v-if="loading" class="flex justify-center items-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2"></div>
  </div>
  <div v-else>
    <!-- Content -->
  </div>
</template>
```
