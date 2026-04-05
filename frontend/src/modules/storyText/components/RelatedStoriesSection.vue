<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import axios from '@/utils/axios';
import NewStoryCard from './NewStoryCard.vue';
import StoryCardSkeleton from './StoryCardSkeleton.vue';

const props = defineProps<{
  title: string;
  type: 'author' | 'genre';
  /** Tên tác giả (dùng cho type='author' — filter keyword=tac_gia) */
  authorName?: string;
  /** Danh sách genre ID (dùng cho type='genre') */
  genres?: number[] | string[];
  excludeId?: number | string;
}>();

const stories = ref<any[]>([]);
const loading = ref(true);

const fetchRelated = async () => {
  loading.value = true;
  stories.value = [];

  // Không fetch nếu thiếu điều kiện
  if (props.type === 'author' && !props.authorName) {
    loading.value = false;
    return;
  }
  if (props.type === 'genre' && (!props.genres || props.genres.length === 0)) {
    loading.value = false;
    return;
  }

  try {
    const params: Record<string, any> = {
      limit: 8,
      sort_by: 'luot_xem',
      order: 'DESC',
      require_text_chapters: true,
    };

    if (props.type === 'author' && props.authorName) {
      // Lọc theo tên tác giả bằng keyword search (FULLTEXT hoặc LIKE)
      params.keyword = props.authorName.trim();
    } else if (props.type === 'genre' && props.genres && props.genres.length > 0) {
      // Gửi toàn bộ genre IDs — backend hỗ trợ comma-separated
      params.category_ids = (props.genres as any[]).join(',');
    }

    const response = await axios.get('/api/truyen/public', { params });
    const allStories = response.data?.data || response.data || [];

    // Loại bỏ truyện hiện tại + giới hạn 4 cards
    stories.value = allStories
      .filter((s: any) => s.id != props.excludeId)
      .slice(0, 4);
  } catch (error) {
    console.error('RelatedStoriesSection fetch error:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchRelated);
watch(() => [props.authorName, props.genres, props.excludeId], fetchRelated, { deep: true });
</script>

<template>
  <section v-if="loading || stories.length > 0" class="related-stories-section">
    <div class="section-header-spirit">
      <h2 class="section-title-glow">{{ title }}</h2>
      <div class="title-line"></div>
    </div>

    <!-- Skeleton với shimmer animation -->
    <div v-if="loading" class="related-grid">
      <StoryCardSkeleton v-for="i in 4" :key="'sk-rel-' + i" />
    </div>

    <div v-else class="related-grid">
      <NewStoryCard
        v-for="story in stories"
        :key="story.id"
        :story="story"
        v-memo="[story.id]"
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
    gap: 14px;
  }
  .section-title-glow {
    font-size: 1.1rem;
  }
}

@media (max-width: 420px) {
  .related-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}
</style>
