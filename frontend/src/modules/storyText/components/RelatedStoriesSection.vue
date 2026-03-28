<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import axios from '@/utils/axios';
import NewStoryCard from './NewStoryCard.vue';

const props = defineProps<{
  title: string;
  type: 'author' | 'genre';
  authorId?: number | string;
  genres?: number[] | string[];
  excludeId?: number | string;
}>();

const stories = ref<any[]>([]);
const loading = ref(true);

const fetchRelated = async () => {
  loading.value = true;
  try {
    const params: any = {
      limit: 6,
      sort: props.type === 'author' ? 'thoi_gian_cap_nhat' : 'luot_xem_TDC'
    };

    if (props.type === 'author' && props.authorId) {
      params.author = props.authorId;
    } else if (props.type === 'genre' && props.genres && props.genres.length > 0) {
      // Assuming backend takes comma separated genres or just one
      params.genres = Array.isArray(props.genres) ? props.genres[0] : props.genres;
    }

    const response = await axios.get('/api/truyen/public', { params });
    // Filter out current story if provided
    const allStories = response.data?.data || response.data || [];
    stories.value = allStories.filter((s: any) => s.id != props.excludeId).slice(0, 4);
  } catch (error) {
    console.error('Error fetching related stories:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchRelated);
watch(() => [props.authorId, props.genres], fetchRelated);
</script>

<template>
  <section v-if="loading || stories.length > 0" class="related-stories-section">
    <div class="section-header-spirit">
      <h2 class="section-title-glow">{{ title }}</h2>
      <div class="title-line"></div>
    </div>

    <div v-if="loading" class="related-grid skeleton-grid">
      <div v-for="i in 4" :key="i" class="skeleton-card-aura"></div>
    </div>

    <div v-else class="related-grid">
      <NewStoryCard 
        v-for="story in stories" 
        :key="story.id" 
        :story="story" 
        variant="list"
      />
    </div>
  </section>
</template>

<style scoped>
.related-stories-section {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.section-header-spirit {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title-glow {
  font-size: 1.4rem;
  font-weight: 800;
  color: #f7fbff;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0;
}

.title-line {
  height: 3px;
  width: 60px;
  background: linear-gradient(to right, #22d3ee, transparent);
  border-radius: 2px;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 1200px) {
  .related-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .related-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  .section-title-glow {
    font-size: 1.1rem;
  }
}

.skeleton-card-aura {
  padding-top: 140%;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 0.8; }
  100% { opacity: 0.5; }
}
</style>
