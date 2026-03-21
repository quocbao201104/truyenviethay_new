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
          <div>
            <span class="sidebar-heading"><i class="fas fa-sliders-h"></i> Bộ lọc</span>
            <p class="sidebar-caption">Tinh chỉnh kho audio theo những gì bạn muốn nghe ngay.</p>
          </div>
          <button v-if="hasActiveFilters" class="clear-btn" @click="clearFilters">
            <i class="fas fa-times"></i> Xoá
          </button>
        </div>
        <AudioSidebarFilter :filters="filters" @update="applyFilter" @clear="clearFilters" />
      </aside>

      <main class="main-content">
        <div class="page-topbar">
          <div class="page-topbar__copy">
            <span class="page-kicker">Không gian nghe tuyển chọn</span>
            <span class="page-summary">{{ resultSummary }}</span>
          </div>

          <button class="mobile-filter-btn" @click="drawerOpen = true">
            <i class="fas fa-filter"></i> Bộ lọc
            <span v-if="hasActiveFilters" class="filter-active-dot" />
          </button>
        </div>

        <section v-if="featuredStory" class="audio-hero">
          <div class="audio-hero__copy">
            <span class="audio-hero__label">Truyện Audio Tuyển Chọn</span>
            <h1>Truyện Audio</h1>
            <p class="audio-hero__desc">
              Kho nghe được biên tập theo hướng gọn, sáng, dễ bắt đầu ngay. Mỗi tựa được ưu tiên thông tin nghe thật sự cần thiết: số phần, tổng thời lượng, và kênh đồng hành.
            </p>

            <div class="audio-hero__actions">
              <router-link :to="`/truyen-audio/${featuredStory.slug}`" class="hero-primary-btn">
                <i class="fas fa-play-circle"></i>
                Nghe truyện nổi bật
              </router-link>

              <button class="hero-secondary-btn" type="button" @click="drawerOpen = true">
                <i class="fas fa-sliders-h"></i>
                Tinh chỉnh bộ lọc
              </button>
            </div>
          </div>

          <div class="audio-hero__feature">
            <AudioHCard :story="featuredStory" variant="hero" />
          </div>

          <div class="audio-hero__stats">
            <article
              v-for="stat in heroStats"
              :key="stat.label"
              class="hero-stat-card"
              :class="`hero-stat-card--${stat.tone}`"
            >
              <span class="hero-stat-card__label">{{ stat.label }}</span>
              <strong class="hero-stat-card__value">{{ stat.value }}</strong>
              <span class="hero-stat-card__hint">{{ stat.hint }}</span>
            </article>
          </div>
        </section>

        <div v-if="activeFilterChips.length" class="active-filters">
          <span class="active-filters__label">Đang áp dụng</span>
          <div class="active-filters__chips">
            <span v-for="chip in activeFilterChips" :key="chip" class="active-filters__chip">
              {{ chip }}
            </span>
          </div>
        </div>

        <div class="section-heading">
          <div>
            <h2>Danh sách nghe</h2>
            <p v-if="featuredStory">
              {{ showHero ? "Tiếp tục khám phá thêm các tựa audio cùng tông màu sắc biên tập." : "Toàn bộ tựa audio trong trang hiện tại." }}
            </p>
          </div>
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

        <div v-else-if="displayStories.length" class="story-grid">
          <AudioHCard
            v-for="story in displayStories"
            :key="story.id"
            :story="story"
          />
        </div>

        <div v-else class="state-card state-card--soft">
          <i class="fas fa-headphones"></i>
          <p>Trang này đang được mở đầu bằng tựa nổi bật. Thử chuyển trang hoặc đổi bộ lọc để xem thêm.</p>
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

const SORT_LABELS: Record<string, string> = {
  thoi_gian_cap_nhat: "Mới cập nhật",
  luot_xem: "Nghe nhiều nhất",
  luot_thich: "Được yêu thích",
  avg_rating: "Đánh giá cao",
  ten_truyen: "Tên A-Z",
};

const STATUS_LABELS: Record<string, string> = {
  dang_ra: "Đang ra",
  hoan_thanh: "Hoàn thành",
};

const hasActiveFilters = computed(
  () =>
    filters.value.sort_by !== "thoi_gian_cap_nhat" ||
    filters.value.trang_thai !== "" ||
    filters.value.genre_ids.length > 0,
);

const featuredStory = computed(() => (page.value === 1 ? stories.value[0] || null : null));
const showHero = computed(() => !!featuredStory.value);
const displayStories = computed(() =>
  showHero.value ? stories.value.slice(1) : stories.value,
);

const resultSummary = computed(() => {
  if (loading.value) return "Đang làm mới kho audio";
  if (pagination.value.total) return `${formatNumber(pagination.value.total)} tác phẩm audio`;
  return "Kho audio được cập nhật liên tục";
});

const heroStats = computed(() => [
  {
    label: "Tác phẩm",
    value: formatNumber(pagination.value.total || stories.value.length),
    hint: "Tổng số tựa trong kết quả hiện tại",
    tone: "jade",
  },
  {
    label: "Mới cập nhật",
    value: formatNumber(
      stories.value.filter((story) => !!story.audio_latest_part_at || !!story.thoi_gian_cap_nhat).length,
    ),
    hint: "Có dấu mốc cập nhật để theo dõi",
    tone: "sky",
  },
  {
    label: "Tổng phần",
    value: formatNumber(
      stories.value.reduce((sum, story) => sum + Number(story.audio_total_parts || 0), 0),
    ),
    hint: "Tổng phần audio trên trang đang xem",
    tone: "gold",
  },
]);

const activeFilterChips = computed(() => {
  const chips: string[] = [];
  if (filters.value.trang_thai) {
    chips.push(STATUS_LABELS[filters.value.trang_thai] || filters.value.trang_thai);
  }
  if (filters.value.genre_ids.length > 0) {
    chips.push(`${filters.value.genre_ids.length} thể loại`);
  }
  if (filters.value.sort_by !== "thoi_gian_cap_nhat") {
    chips.push(SORT_LABELS[filters.value.sort_by] || filters.value.sort_by);
  }
  return chips;
});

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

function formatNumber(value = 0) {
  return Number(value || 0).toLocaleString("vi-VN");
}

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
  --audio-bg-top: #09111b;
  --audio-bg-mid: #0d1724;
  --audio-bg-bottom: #0f1727;
  --audio-panel: rgba(18, 26, 39, 0.78);
  --audio-border: rgba(148, 163, 184, 0.12);
  --audio-text: #d8ebf8;
  --audio-muted: #8ea2b5;
  --audio-soft: #6f8194;
  --audio-accent: #62d6c2;
  --audio-accent-2: #7bc7e8;
  --audio-gold: #d8b36a;
  min-height: 100vh;
  color: var(--audio-text);
  font-family: "Be Vietnam Pro", sans-serif;
  background:
    radial-gradient(circle at top left, rgba(98, 214, 194, 0.08), transparent 26%),
    radial-gradient(circle at top right, rgba(216, 179, 106, 0.08), transparent 28%),
    linear-gradient(180deg, var(--audio-bg-top), var(--audio-bg-mid) 45%, var(--audio-bg-bottom));
}

.page-wrapper {
  display: flex;
  gap: 28px;
  max-width: 1380px;
  margin: 0 auto;
  padding: 32px 20px 110px;
}

.sidebar--desktop {
  width: 300px;
  flex: 0 0 300px;
  overflow: hidden;
  border: 1px solid var(--audio-border);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(16, 24, 36, 0.92), rgba(13, 20, 31, 0.86));
  position: sticky;
  top: 80px;
  align-self: flex-start;
  max-height: calc(100vh - 110px);
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(3, 8, 18, 0.22);
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
}

.sidebar-heading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  color: #7adccc;
  font-size: 1rem;
  font-weight: 800;
}

.sidebar-caption {
  margin: 0;
  color: var(--audio-soft);
  font-size: 0.8rem;
  line-height: 1.55;
}

.clear-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 11px;
  border: none;
  border-radius: 999px;
  background: rgba(216, 179, 106, 0.09);
  color: #f2ddb1;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 700;
  transition: background 0.2s ease, transform 0.2s ease;
}

.clear-btn:hover {
  transform: translateY(-1px);
  background: rgba(216, 179, 106, 0.16);
}

.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.6);
}

.sidebar--drawer {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 320px;
  height: 100%;
  overflow-y: auto;
  padding-bottom: 40px;
  border-right: 1px solid var(--audio-border);
  background: #09111b;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  position: sticky;
  top: 0;
  background: #09111b;
  z-index: 2;
}

.drawer-title {
  color: #7adccc;
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
}

.main-content {
  flex: 1 1 0;
  min-width: 0;
}

.page-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.page-topbar__copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.page-kicker {
  color: var(--audio-gold);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.page-summary {
  color: var(--audio-muted);
  font-size: 0.92rem;
}

.mobile-filter-btn {
  display: none;
  position: relative;
  align-items: center;
  gap: 8px;
  padding: 11px 18px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 999px;
  background: rgba(16, 24, 36, 0.84);
  color: #e7f4ff;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
}

.filter-active-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--audio-accent);
}

.audio-hero {
  display: grid;
  grid-template-columns: minmax(0, 0.78fr) minmax(0, 1.2fr) 230px;
  gap: 18px;
  margin-bottom: 24px;
}

.audio-hero__copy,
.audio-hero__stats {
  border: 1px solid var(--audio-border);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(16, 24, 36, 0.9), rgba(13, 20, 31, 0.82));
  box-shadow: 0 18px 44px rgba(3, 8, 18, 0.2);
}

.audio-hero__copy {
  padding: 26px 24px;
}

.audio-hero__label {
  display: inline-block;
  margin-bottom: 14px;
  color: var(--audio-gold);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.audio-hero__copy h1 {
  margin: 0 0 14px;
  color: #f7fbff;
  font-size: 2.45rem;
  font-weight: 900;
  line-height: 1.1;
}

.audio-hero__desc {
  margin: 0;
  color: var(--audio-muted);
  font-size: 0.96rem;
  line-height: 1.8;
}

.audio-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 22px;
}

.hero-primary-btn,
.hero-secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  padding: 0 18px;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 800;
  text-decoration: none;
}

.hero-primary-btn {
  background: linear-gradient(135deg, var(--audio-accent), var(--audio-accent-2));
  color: #06111d;
}

.hero-secondary-btn {
  display: none;
  border: 1px solid rgba(216, 179, 106, 0.22);
  background: rgba(216, 179, 106, 0.07);
  color: #f3ddb0;
  cursor: pointer;
}

.audio-hero__feature {
  min-width: 0;
}

.audio-hero__stats {
  display: grid;
  gap: 12px;
  padding: 16px;
}

.hero-stat-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 14px 13px;
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
}

.hero-stat-card__label {
  color: var(--audio-soft);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.hero-stat-card__value {
  color: #f7fbff;
  font-size: 1.45rem;
  font-weight: 900;
}

.hero-stat-card__hint {
  color: var(--audio-muted);
  font-size: 0.78rem;
  line-height: 1.45;
}

.hero-stat-card--jade .hero-stat-card__value {
  color: #86e4d3;
}

.hero-stat-card--sky .hero-stat-card__value {
  color: #a9ddf6;
}

.hero-stat-card--gold .hero-stat-card__value {
  color: #f2ddb1;
}

.active-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 18px;
  padding: 14px 16px;
  border: 1px solid rgba(216, 179, 106, 0.14);
  border-radius: 18px;
  background: rgba(216, 179, 106, 0.05);
}

.active-filters__label {
  color: var(--audio-gold);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.active-filters__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.active-filters__chip {
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: #f4e3c0;
  font-size: 0.8rem;
  font-weight: 700;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 18px;
}

.section-heading h2 {
  margin: 0 0 6px;
  color: #f7fbff;
  font-size: 1.28rem;
  font-weight: 800;
}

.section-heading p {
  margin: 0;
  color: var(--audio-muted);
  font-size: 0.88rem;
}

.state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 64px 20px;
  border: 1px dashed rgba(148, 163, 184, 0.15);
  border-radius: 22px;
  background: rgba(18, 26, 39, 0.58);
  color: var(--audio-muted);
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

.state-card--soft {
  border-style: solid;
  background: rgba(255, 255, 255, 0.03);
}

.story-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.pagination-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 42px;
}

.pagination-row button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 999px;
  background: rgba(18, 26, 39, 0.85);
  color: #dff7ff;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 700;
}

.pagination-row button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-label {
  min-width: 92px;
  color: var(--audio-muted);
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

@media (max-width: 1320px) {
  .audio-hero {
    grid-template-columns: minmax(0, 1fr);
  }

  .audio-hero__stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
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

  .page-wrapper {
    padding-top: 20px;
  }

  .hero-secondary-btn {
    display: inline-flex;
  }
}

@media (max-width: 768px) {
  .page-wrapper {
    padding: 16px 12px 100px;
  }

  .audio-hero__copy {
    padding: 22px 18px;
  }

  .audio-hero__copy h1 {
    font-size: 1.9rem;
  }

  .audio-hero__stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .section-heading {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .page-topbar {
    align-items: flex-start;
  }

  .page-summary {
    font-size: 0.84rem;
  }
  
  .audio-hero__desc {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .audio-hero__actions {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .hero-primary-btn,
  .hero-secondary-btn {
    flex: 1;
    min-width: 140px;
    width: auto;
  }

  .active-filters {
    align-items: flex-start;
  }
}
</style>
