<template>
  <div class="audio-home-page">
    <transition name="fade">
      <div v-if="drawerOpen" class="drawer-overlay" @click="drawerOpen = false" />
    </transition>

    <transition name="slide-in">
      <aside v-if="drawerOpen" class="sidebar sidebar--drawer">
        <div class="drawer-header">
          <span class="drawer-title"><i class="fas fa-sliders-h"></i> Bộ lọc</span>
          <button class="drawer-close" @click="drawerOpen = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <AudioSidebarFilter :filters="filters" @update="applyFilter" @clear="clearFilters" />
      </aside>
    </transition>

    <div class="page-wrapper">
      <aside class="sidebar sidebar--desktop">
        <div class="sidebar-header">
          <span class="sidebar-heading"><i class="fas fa-sliders-h"></i> Bộ lọc</span>
          <button v-if="hasActiveFilters" class="clear-btn" @click="clearFilters">
            <i class="fas fa-times"></i> Xóa lọc
          </button>
        </div>
        <AudioSidebarFilter :filters="filters" @update="applyFilter" @clear="clearFilters" />
      </aside>

      <main class="main-content">
        <div class="content-toolbar">
          <div class="toolbar-left">
            <h1>Truyện Audio</h1>
            <span v-if="!loading && pagination.total" class="result-count">
              {{ pagination.total.toLocaleString() }} tác phẩm
            </span>
          </div>
          <button class="mobile-filter-btn" @click="drawerOpen = true">
            <i class="fas fa-filter"></i> Bộ lọc
            <span v-if="hasActiveFilters" class="filter-active-dot" />
          </button>
        </div>

        <div v-if="loading" class="state-card">
          <i class="fas fa-circle-notch fa-spin"></i>
          <p>Đang tải danh sách truyện audio...</p>
        </div>

        <div v-else-if="error" class="state-card state-card--error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ error }}</p>
        </div>

        <div v-else-if="!stories.length" class="state-card">
          <i class="fas fa-headphones-slash"></i>
          <p>Không tìm thấy truyện nào phù hợp với bộ lọc đã chọn.</p>
        </div>

        <div v-else class="story-grid">
          <AudioHCard
            v-for="story in stories"
            :key="story.id"
            :story="story"
          />
        </div>

        <div v-if="!loading && pagination.total_pages > 1" class="pagination-row">
          <button :disabled="page <= 1 || loading" @click="goToPage(page - 1)">
            <i class="fas fa-chevron-left"></i> Trước
          </button>
          <span class="page-label">Trang {{ page }} / {{ pagination.total_pages }}</span>
          <button :disabled="page >= pagination.total_pages || loading" @click="goToPage(page + 1)">
            Sau <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getPublicStories, type Story } from "@/modules/storyText/story.service";
import AudioSidebarFilter, {
  type AudioFilters,
} from "@/modules/storyAudio/components/AudioSidebarFilter.vue";
import AudioHCard from "@/modules/storyAudio/components/AudioHCard.vue";

const route = useRoute();
const router = useRouter();

const stories = ref<Story[]>([]);
const loading = ref(false);
const error = ref("");
const page = ref(1);
const pagination = ref({ total: 0, total_pages: 1 });
const drawerOpen = ref(false);

const filters = ref<AudioFilters>({
  sort_by: "thoi_gian_cap_nhat",
  trang_thai: "",
  genre_ids: [],
});

const hasActiveFilters = computed(
  () =>
    filters.value.sort_by !== "thoi_gian_cap_nhat" ||
    filters.value.trang_thai !== "" ||
    filters.value.genre_ids.length > 0,
);

const syncFromQuery = () => {
  const query = route.query;
  filters.value = {
    sort_by: (query.sort as string) || "thoi_gian_cap_nhat",
    trang_thai: (query.status as string) || "",
    genre_ids: query.genres
      ? String(query.genres)
          .split(",")
          .map((id) => parseInt(id, 10))
          .filter((id) => !Number.isNaN(id))
      : [],
  };

  const parsedPage = parseInt(String(query.page || "1"), 10);
  page.value = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
};

const updateUrl = () => {
  const query: Record<string, string | number> = {};
  if (filters.value.sort_by !== "thoi_gian_cap_nhat") query.sort = filters.value.sort_by;
  if (filters.value.trang_thai) query.status = filters.value.trang_thai;
  if (filters.value.genre_ids.length > 0) query.genres = filters.value.genre_ids.join(",");
  if (page.value > 1) query.page = page.value;
  router.replace({ query });
};

const loadStories = async () => {
  loading.value = true;
  error.value = "";

  try {
    const res = await getPublicStories({
      page: page.value,
      limit: 10,
      sort_by: filters.value.sort_by,
      order: "DESC",
      has_audio: true,
      category_ids: filters.value.genre_ids,
      trang_thai: filters.value.trang_thai || undefined,
    });

    stories.value = (res?.data || []).filter((story: Story) => story.has_audio);
    pagination.value = {
      total: res?.pagination?.total || 0,
      total_pages: res?.pagination?.total_pages || 1,
    };
    page.value = res?.pagination?.current_page || page.value;
  } catch (e: any) {
    error.value = e?.response?.data?.message || "Không thể tải danh sách truyện.";
  } finally {
    loading.value = false;
    drawerOpen.value = false;
  }
};

const applyFilter = (updated: AudioFilters) => {
  filters.value = updated;
  page.value = 1;
  updateUrl();
};

const clearFilters = () => {
  filters.value = {
    sort_by: "thoi_gian_cap_nhat",
    trang_thai: "",
    genre_ids: [],
  };
  page.value = 1;
  updateUrl();
};

const goToPage = (nextPage: number) => {
  if (nextPage < 1 || nextPage > pagination.value.total_pages || nextPage === page.value) return;
  page.value = nextPage;
  updateUrl();
};

watch(
  () => route.query,
  () => {
    if (route.name !== "StoryAudioList") return;
    syncFromQuery();
    loadStories();
  },
  { immediate: true },
);
</script>

<style scoped>
.audio-home-page {
  min-height: 100vh;
  color: var(--app-text, #d8ebf8);
  font-family: "Be Vietnam Pro", sans-serif;
}

.page-wrapper {
  display: flex;
  gap: 24px;
  max-width: 1340px;
  margin: 0 auto;
  padding: 28px 20px 100px;
}

.sidebar--desktop {
  width: 280px;
  flex: 0 0 280px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 20px;
  background: rgba(18, 26, 39, 0.75);
  position: sticky;
  top: 80px;
  align-self: flex-start;
  max-height: calc(100vh - 110px);
  overflow-y: auto;
}

.sidebar--desktop::-webkit-scrollbar {
  width: 4px;
}

.sidebar--desktop::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.25);
  border-radius: 4px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.09);
}

.sidebar-heading {
  color: #74dbf3;
  font-size: 1rem;
  font-weight: 800;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  border-radius: 8px;
  background: none;
  color: rgba(169, 235, 255, 0.7);
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.2s;
}

.clear-btn:hover {
  background: rgba(91, 196, 232, 0.1);
  color: #a9ebff;
}

.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.55);
}

.sidebar--drawer {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 300px;
  height: 100%;
  overflow-y: auto;
  padding-bottom: 40px;
  border-right: 1px solid rgba(148, 163, 184, 0.12);
  background: #0e1622;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  position: sticky;
  top: 0;
  background: #0e1622;
  z-index: 2;
}

.drawer-title {
  color: #74dbf3;
  font-size: 1.05rem;
  font-weight: 800;
}

.drawer-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  color: #eff8ff;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.drawer-close:hover {
  background: rgba(255, 255, 255, 0.12);
}

.main-content {
  flex: 1 1 0;
  min-width: 0;
}

.content-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.toolbar-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-left h1 {
  margin: 0;
  color: #f8fbff;
  font-size: 1.6rem;
  font-weight: 800;
}

.result-count {
  color: var(--app-text-subtle, #64748b);
  font-size: 0.85rem;
}

.mobile-filter-btn {
  display: none;
  position: relative;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 999px;
  background: rgba(18, 26, 39, 0.85);
  color: #dff7ff;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
  transition: background 0.2s;
}

.mobile-filter-btn:hover {
  background: rgba(91, 196, 232, 0.1);
}

.filter-active-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #48cfa5;
}

.state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 64px 20px;
  border: 1px dashed rgba(148, 163, 184, 0.15);
  border-radius: 20px;
  background: rgba(18, 26, 39, 0.6);
  color: var(--app-text-muted, #94a3b8);
  text-align: center;
}

.state-card i {
  font-size: 2.2rem;
  opacity: 0.55;
}

.state-card--error {
  color: #ffd6d6;
  border-color: rgba(223, 120, 135, 0.22);
}

.story-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.pagination-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 40px;
}

.pagination-row button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 999px;
  background: rgba(18, 26, 39, 0.85);
  color: #dff7ff;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 700;
  transition: background 0.2s;
}

.pagination-row button:hover:not(:disabled) {
  background: rgba(91, 196, 232, 0.15);
}

.pagination-row button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-label {
  min-width: 80px;
  color: var(--app-text-muted, #94a3b8);
  font-weight: 600;
  text-align: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-in-enter-active,
.slide-in-leave-active {
  transition: transform 0.28s ease;
}

.slide-in-enter-from,
.slide-in-leave-to {
  transform: translateX(-100%);
}

@media (max-width: 1200px) {
  .story-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1024px) {
  .sidebar--desktop {
    display: none;
  }

  .mobile-filter-btn {
    display: inline-flex;
  }
}

@media (max-width: 768px) {
  .page-wrapper {
    padding: 16px 12px 100px;
  }

  .content-toolbar {
    flex-wrap: wrap;
    gap: 12px;
  }

  .toolbar-left h1 {
    font-size: 1.3rem;
  }
}
</style>
