<template>
  <div class="story-list-page-xianxia">

    <main class="main-content-spirit">
      <!-- ===== HERO ===== -->
      <section class="hero-aura-wrapper animate-fadeIn">
        <div v-if="!hotStories.length" class="hero-skeleton">
          <div class="shimmer" />
        </div>
        <HeroGrid
          v-else
          :stories="hotStories.slice(0, 5)"
          :trendingStories="topMonthlyStories"
        />
      </section>

      <div class="continue-cultivation-area">
        <ContinueReadingStrip />
      </div>

      <div class="content-body-grid">
        <div class="main-col-spirit">

          <!-- ===== TÂN TÚ BẢNG (Phase 1 - Above fold) ===== -->
          <section class="spirit-block">
            <div class="spirit-header emerald">
              <h2 class="spirit-title">
                <i class="fas fa-seedling"></i>
                Tân Tú Bảng
                <span class="spirit-note">Kỳ tài mới nổi trong tháng</span>
              </h2>
              <div class="header-actions">
                <div v-if="newStories.length" class="spirit-pagination">
                  <button class="pag-btn prev" :disabled="newStoriesPage <= 1 || isNewStoriesLoading" @click="fetchNewStoriesPage(newStoriesPage - 1)">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <span class="page-info">{{ newStoriesPage }}</span>
                  <button class="pag-btn next" :disabled="newStoriesPage >= newStoriesTotalPages || isNewStoriesLoading" @click="fetchNewStoriesPage(newStoriesPage + 1)">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="!newStories.length" class="spirit-grid-responsive">
              <StoryCardSkeleton v-for="n in 10" :key="'sk-new-'+n" />
            </div>
            <div v-else class="spirit-grid-responsive">
              <NewStoryCard
                v-for="(story, index) in newStories"
                :key="story.id"
                :story="story"
                v-memo="[story.id]"
                :animateStatus="false"
              />
            </div>

            <div class="spirit-footer">
              <router-link to="/tim-kiem" class="view-all-spirit emerald">
                Xem thêm <i class="fas fa-arrow-right-long ml-1"></i>
              </router-link>
            </div>
          </section>

          <!-- ===== LỆNH BÀI BẢNG (Phase 2 - lazy) ===== -->
          <section class="spirit-block" ref="lenhBaiRef">
            <div class="spirit-header gold">
              <h2 class="spirit-title">
                <i class="fas fa-medal"></i>
                Lệnh Bài Bảng
                <span class="spirit-note">Vạn người tín ngưỡng</span>
              </h2>
              <div class="header-actions">
                <div v-if="topRatedStories.length" class="spirit-pagination">
                  <button class="pag-btn prev" :disabled="topRatedStoriesPage <= 1 || isTopRatedStoriesLoading" @click="fetchTopRatedStoriesPage(topRatedStoriesPage - 1)">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <span class="page-info">{{ topRatedStoriesPage }}</span>
                  <button class="pag-btn next" :disabled="topRatedStoriesPage >= topRatedStoriesTotalPages || isTopRatedStoriesLoading" @click="fetchTopRatedStoriesPage(topRatedStoriesPage + 1)">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="spirit-grid-responsive">
              <template v-if="!topRatedStories.length">
                <StoryCardSkeleton v-for="n in 8" :key="'sk-rated-'+n" />
              </template>
              <template v-else>
                <NewStoryCard
                  v-for="(story, index) in topRatedStories.slice(0, 8)"
                  :key="story.id"
                  :story="story"
                  v-memo="[story.id]"
                  :animateStatus="false"
                />
              </template>
            </div>

            <div class="spirit-footer">
              <router-link to="/xep-hang" class="view-all-spirit gold">
                Xem thêm <i class="fas fa-arrow-right-long ml-1"></i>
              </router-link>
            </div>
          </section>

          <!-- ===== ĐẠI VIÊN MÃN (Phase 2 - lazy) ===== -->
          <section class="spirit-block" ref="daiVienManRef">
            <div class="spirit-header purple">
              <h2 class="spirit-title">
                <i class="fas fa-yin-yang"></i>
                Đại Viên Mãn
                <span class="spirit-note">Công đức tròn đầy</span>
              </h2>
              <div class="header-actions">
                <div v-if="completedStories.length" class="spirit-pagination">
                  <button class="pag-btn prev" :disabled="completedStoriesPage <= 1 || isCompletedStoriesLoading" @click="fetchCompletedStoriesPage(completedStoriesPage - 1)">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <span class="page-info">{{ completedStoriesPage }}</span>
                  <button class="pag-btn next" :disabled="completedStoriesPage >= completedStoriesTotalPages || isCompletedStoriesLoading" @click="fetchCompletedStoriesPage(completedStoriesPage + 1)">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="spirit-grid-responsive">
              <template v-if="!completedStories.length">
                <StoryCardSkeleton v-for="n in 8" :key="'sk-done-'+n" />
              </template>
              <template v-else>
                <NewStoryCard
                  v-for="(story, index) in completedStories.slice(0, 8)"
                  :key="story.id"
                  :story="story"
                  v-memo="[story.id]"
                  :animateStatus="false"
                />
              </template>
            </div>

            <div class="spirit-footer">
              <router-link to="/tim-kiem?status=hoan_thanh" class="view-all-spirit purple">
                Toàn Thư <i class="fas fa-arrow-right-long ml-1"></i>
              </router-link>
            </div>
          </section>

          <div class="mobile-extra-aura">
            <section class="spirit-block">
              <div class="spirit-header moon">
                <h2 class="spirit-title">
                  <i class="fas fa-moon"></i> Nguyệt Bảng
                  <span class="spirit-note">Tranh hùng tuế nguyệt</span>
                </h2>
              </div>
              <div class="moon-tabs">
                <button
                  type="button"
                  class="moon-tab"
                  :class="{ active: moonTab === 'thang' }"
                  @click="moonTab = 'thang'"
                >
                  Tháng
                </button>
                <button
                  type="button"
                  class="moon-tab"
                  :class="{ active: moonTab === 'tuan' }"
                  @click="moonTab = 'tuan'"
                >
                  Tuần
                </button>
                <button
                  type="button"
                  class="moon-tab"
                  :class="{ active: moonTab === 'ngay' }"
                  @click="moonTab = 'ngay'"
                >
                  Ngày
                </button>
              </div>
              <div class="ranking-spirit-list-mobile moon-board">
                <div
                  v-for="(story, index) in moonStories.slice(0, 5)"
                  :key="'mb-'+story.id"
                  v-memo="[story, moonTab]"
                  @click="navigateToStory(story.slug)"
                  class="ranking-spirit-item moon-item"
                >
                  <div class="rank-orb" :class="`top-${index + 1}`">{{ index + 1 }}</div>
                  <div class="rank-details">
                    <h4 class="rank-name">{{ story.ten_truyen }}</h4>
                    <span class="rank-val">{{ formatNumber(getMoonViews(story)) }} uy vọng</span>
                  </div>
                </div>
              </div>
              <router-link to="/truyen-hot" class="spirit-more-link-mobile moon-text">Khám phá Nguyệt Bảng...</router-link>
            </section>

            <section class="spirit-block mt-8">
              <div class="spirit-header fire">
                <h2 class="spirit-title">
                  <i class="fas fa-scroll"></i> Linh Anh
                  <span class="spirit-note">Đại đạo muôn hình</span>
                </h2>
              </div>
              <div class="tag-cloud-spirit">
                <router-link
                  v-for="cat in categories"
                  :key="cat.id_theloai"
                  v-memo="[cat]"
                  :to="`/the-loai?categories=${cat.id_theloai}`"
                  class="tag-pill-spirit fire-pill"
                >
                  {{ cat.ten_theloai }}
                </router-link>
              </div>
            </section>
          </div>
        </div>

        <!-- Sidebar chỉ render trên desktop (v-if bỏ DOM hoàn toàn trên mobile) -->
        <aside v-if="!isMobile" class="sidebar-col-spirit">
          <div class="sticky-spirit-box">

            <div class="sidebar-card-aura ranking moon-board">
              <div class="spirit-header moon mb-4">
                <h3 class="sidebar-title-xianxia">
                  <i class="fas fa-moon moon-icon"></i> Nguyệt Bảng
                </h3>
              </div>
              <p class="moon-subtitle">{{ moonSubtitle }}</p>
              <div class="moon-tabs">
                <button type="button" class="moon-tab" :class="{ active: moonTab === 'thang' }" @click="moonTab = 'thang'">Tháng</button>
                <button type="button" class="moon-tab" :class="{ active: moonTab === 'tuan' }" @click="moonTab = 'tuan'">Tuần</button>
                <button type="button" class="moon-tab" :class="{ active: moonTab === 'ngay' }" @click="moonTab = 'ngay'">Ngày</button>
              </div>

              <div v-if="!moonStories.length" class="ranking-spirit-list">
                <div v-for="n in 5" :key="'sk-moon-'+n" class="ranking-skeleton">
                  <div class="sk-orb shimmer" />
                  <div class="sk-info">
                    <div class="sk-line lg shimmer" />
                    <div class="sk-line sm shimmer" />
                  </div>
                </div>
              </div>
              <div v-else class="ranking-spirit-list">
                <div
                  v-for="(story, index) in moonStories.slice(0, 5)"
                  :key="story.id"
                  v-memo="[story.id, moonTab]"
                  @click="navigateToStory(story.slug)"
                  class="ranking-spirit-item moon-item"
                >
                  <div class="rank-orb" :class="`top-${index + 1}`">{{ index + 1 }}</div>
                  <div class="rank-details">
                    <h4 class="rank-name">{{ story.ten_truyen }}</h4>
                    <span class="rank-val">{{ formatNumber(getMoonViews(story)) }} uy vọng</span>
                  </div>
                  <i v-if="index < 3" class="fas fa-star text-slate-300 text-[10px] animate-pulse"></i>
                </div>
              </div>
              <router-link to="/truyen-hot" class="spirit-more-link moon-text">Khám phá thêm...</router-link>
            </div>

            <div class="sidebar-card-aura categories fire-board">
              <div class="spirit-header fire mb-4">
                <h3 class="sidebar-title-xianxia">
                  <i class="fas fa-scroll"></i> Linh Anh
                </h3>
              </div>
              <div v-if="!categories.length" class="tag-cloud-spirit">
                <div v-for="n in 14" :key="'sk-cat-'+n" class="tag-pill-skeleton shimmer" />
              </div>
              <div v-else class="tag-cloud-spirit">
                <router-link
                  v-for="cat in categories"
                  :key="cat.id_theloai"
                  v-memo="[cat.id_theloai]"
                  :to="`/the-loai?categories=${cat.id_theloai}`"
                  class="tag-pill-spirit fire-pill"
                >
                  {{ cat.ten_theloai }}
                </router-link>
              </div>
            </div>

          </div>
        </aside>
      </div>
      <div ref="prefetchSentinel" class="prefetch-sentinel" aria-hidden="true"></div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted, onBeforeUnmount, computed, nextTick } from "vue";
import { Story, getHotStories, prefetchPublicStories } from "@/modules/storyText/story.service";
import type { Category } from "@/types/category";
import NewStoryCard from "@/modules/storyText/components/NewStoryCard.vue";
import StoryCardSkeleton from "@/modules/storyText/components/StoryCardSkeleton.vue";
import HeroGrid from "@/components/home/HeroGrid.vue";
import ContinueReadingStrip from "@/components/home/ContinueReadingStrip.vue";
import { useStoryStore } from "@/modules/storyText/story.store";
import { useRouter } from "vue-router";
import { useHead } from "@unhead/vue";
import { toCanonicalUrl, defaultOgImage } from "@/seo/site";

useHead({
  title: "Đọc Truyện Chữ Online - Kho Truyện Mới Nhất | TruyenVietHay",
  link: [{ rel: "canonical", href: toCanonicalUrl("/truyen-chu") }],
  meta: [
    { name: "description", content: "Đọc truyện chữ online miễn phí. Kho truyện tiên hiệp, ngôn tình, kiếm hiệp... cập nhật mỗi ngày tại TruyenVietHay." },
    { name: "robots", content: "index, follow" },
    { property: "og:type", content: "website" },
    { property: "og:title", content: "Đọc Truyện Chữ Online | TruyenVietHay" },
    { property: "og:description", content: "Đọc truyện chữ online miễn phí. Kho truyện tiên hiệp, ngôn tình, kiếm hiệp... cập nhật mỗi ngày tại TruyenVietHay." },
    { property: "og:url", content: toCanonicalUrl("/truyen-chu") },
    { property: "og:image", content: defaultOgImage },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Đọc Truyện Chữ Online | TruyenVietHay" },
    { name: "twitter:description", content: "Đọc truyện chữ online miễn phí. Kho truyện tiên hiệp, ngôn tình, kiếm hiệp... cập nhật mỗi ngày tại TruyenVietHay." },
    { name: "twitter:image", content: defaultOgImage },
  ]
});

// Mobile detection — v-if sidebar dọn DOM hoàn toàn trên mobile
const isMobile = ref(
  typeof window !== 'undefined' ? window.innerWidth <= 1024 : false
);

const storyStore = useStoryStore();
const router = useRouter();

const navigateToStory = (slug: string) => {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
    router.push(`/truyen-chu/${slug}`);
};

const categories = shallowRef<readonly Category[]>([]);
const newStories = shallowRef<readonly Story[]>([]);
const hotStories = shallowRef<readonly Story[]>([]);
const topMonthlyStories = shallowRef<readonly Story[]>([]);
const topWeeklyStories = shallowRef<readonly Story[]>([]);
const topDailyStories = shallowRef<readonly Story[]>([]);
const topRatedStories = shallowRef<readonly Story[]>([]);
const completedStories = shallowRef<readonly Story[]>([]);
const moonTab = ref<"thang" | "tuan" | "ngay">("thang");

// Pagination state
const newStoriesPage = ref(1);
const newStoriesTotalPages = ref(1);
const topRatedStoriesPage = ref(1);
const topRatedStoriesTotalPages = ref(1);
const completedStoriesPage = ref(1);
const completedStoriesTotalPages = ref(1);

const isNewStoriesLoading = ref(false);
const isTopRatedStoriesLoading = ref(false);
const isCompletedStoriesLoading = ref(false);

const moonStories = computed(() => {
  if (moonTab.value === "tuan") return topWeeklyStories.value;
  if (moonTab.value === "ngay") return topDailyStories.value;
  return topMonthlyStories.value;
});

const freezeList = <T extends object>(list: T[] = []) => Object.freeze(list.map((item) => Object.freeze(item)));

const moonSubtitle = computed(() => {
  if (moonTab.value === "tuan") {
    return "Kỳ lân xuất thế - Quần hùng tranh bá trong tuần.";
  }
  if (moonTab.value === "ngay") {
    return "Kỳ lân xuất thế - Quần hùng tranh bá trong ngày.";
  }
  return "Kỳ lân xuất thế - Quần hùng tranh bá trong tháng.";
});

// ── Section refs cho lazy loading
const lenhBaiRef    = ref<HTMLElement | null>(null);
const daiVienManRef = ref<HTMLElement | null>(null);

// ── 2-Phase fetch
const fetchPhase1 = async () => {
  try {
    // Phase 1: Above-the-fold — load ngay
    const [hotResult, newResult, monthlyResult] = await Promise.all([
      getHotStories(5),
      storyStore.fetchNewStories(1, 10),
      storyStore.fetchTopMonthlyStories(5),
    ]);
    hotStories.value         = freezeList(hotResult || []);
    const nd = newResult as any;
    newStories.value         = freezeList(nd?.data || []);
    newStoriesTotalPages.value = nd?.pagination?.total_pages || 1;
    topMonthlyStories.value  = freezeList(monthlyResult || []);
  } catch (err) {
    if ((err as any)?.code === 'ERR_CANCELED') return;
    console.error('Phase 1 error:', err);
  }
};

const fetchPhase2 = async () => {
  try {
    // Phase 2: Below-the-fold — defer sau khi frame 1 render xong
    const [ratedResult, completedResult, weeklyResult, dailyResult, catResult] = await Promise.all([
      storyStore.fetchTopRatedStories(1, 8),
      storyStore.fetchCompletedStories(1, 8),
      storyStore.fetchTopWeeklyStories(5),
      storyStore.fetchTopDailyStories(5),
      storyStore.fetchCategories(),
    ]);
    const rd = ratedResult as any;
    topRatedStories.value          = freezeList(rd?.data || []);
    topRatedStoriesTotalPages.value = rd?.pagination?.total_pages || 1;
    const cd = completedResult as any;
    completedStories.value          = freezeList(cd?.data || []);
    completedStoriesTotalPages.value = cd?.pagination?.total_pages || 1;
    topWeeklyStories.value = freezeList(weeklyResult || []);
    topDailyStories.value  = freezeList(dailyResult  || []);
    categories.value       = freezeList(catResult    || []);
  } catch (err) {
    if ((err as any)?.code === 'ERR_CANCELED') return;
    console.error('Phase 2 error:', err);
  }
};

const fetchAllData = async () => {
  await fetchPhase1();
  await nextTick();
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(fetchPhase2, { timeout: 2000 });
  } else {
    setTimeout(fetchPhase2, 200);
  }
};

const fetchNewStoriesPage = async (page: number) => {
    if (page < 1 || page > newStoriesTotalPages.value || isNewStoriesLoading.value) return;
    isNewStoriesLoading.value = true;
    try {
        const res = await storyStore.fetchNewStories(page, 10);
        newStories.value = freezeList(res.data);
        newStoriesPage.value = page;
    } finally {
        isNewStoriesLoading.value = false;
    }
};

const fetchTopRatedStoriesPage = async (page: number) => {
    if (page < 1 || page > topRatedStoriesTotalPages.value || isTopRatedStoriesLoading.value) return;
    isTopRatedStoriesLoading.value = true;
    try {
        const res = await storyStore.fetchTopRatedStories(page, 8);
        topRatedStories.value = freezeList(res.data);
        topRatedStoriesPage.value = page;
    } finally {
        isTopRatedStoriesLoading.value = false;
    }
};

const fetchCompletedStoriesPage = async (page: number) => {
    if (page < 1 || page > completedStoriesTotalPages.value || isCompletedStoriesLoading.value) return;
    isCompletedStoriesLoading.value = true;
    try {
        const res = await storyStore.fetchCompletedStories(page, 8);
        completedStories.value = freezeList(res.data);
        completedStoriesPage.value = page;
    } finally {
        isCompletedStoriesLoading.value = false;
    }
};

const formatNumber = (num: number) => {
  if (!num) return '0';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

const getMoonViews = (story: Story) => {
  if (moonTab.value === "tuan") return story.luot_xem_tuan ?? story.luot_xem ?? 0;
  if (moonTab.value === "ngay") return story.luot_xem_ngay ?? story.luot_xem ?? 0;
  return story.luot_xem_thang ?? story.luot_xem ?? 0;
};

// ── Prefetch sentinel + observers
const prefetchSentinel = ref<HTMLElement | null>(null);
const observers: IntersectionObserver[] = [];
let prefetchPage = 2;
let prefetching  = false;

const setupPrefetchObserver = () => {
  if (!prefetchSentinel.value) return;
  const obs = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || prefetching) return;
      prefetching = true;
      prefetchPublicStories({
        page: prefetchPage,
        limit: 20,
        sort_by: 'thoi_gian_cap_nhat',
        order: 'DESC',
      }).finally(() => { prefetchPage += 1; prefetching = false; });
    },
    { root: null, rootMargin: '0px 0px 40% 0px', threshold: 0 },
  );
  obs.observe(prefetchSentinel.value);
  observers.push(obs);
};

// Resize handler — cập nhật isMobile
let resizeTimer: ReturnType<typeof setTimeout> | null = null;
const handleResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { isMobile.value = window.innerWidth <= 1024; }, 150);
};

onMounted(async () => {
  window.addEventListener('resize', handleResize, { passive: true });
  fetchAllData();
  await nextTick();
  setupPrefetchObserver();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if (resizeTimer) clearTimeout(resizeTimer);
  observers.forEach((obs) => obs.disconnect());
});
</script>

<style scoped>
/* ===== CORE BACKGROUND ===== */
.story-list-page-xianxia {
  --app-radius-lg: 24px;
  --app-radius-md: 18px;
  --app-border: rgba(120, 144, 168, 0.22);
  --app-shadow-1: 0 12px 28px rgba(3, 8, 18, 0.24);
  --app-shadow-2: 0 16px 34px rgba(3, 8, 18, 0.28);
  --list-premium-surface: rgba(14, 24, 38, 0.8);
  --list-premium-jade: #72e2cd;
  --list-premium-gold: #d7b679;
  --list-premium-ice: #dbe7f4;
  min-height: 100vh;
  background-color: #0b111b;
  background-image:
    radial-gradient(circle at 15% 50%, rgba(114, 226, 205, 0.08) 0%, transparent 48%),
    radial-gradient(circle at 85% 30%, rgba(215, 182, 121, 0.08) 0%, transparent 42%),
    linear-gradient(180deg, rgba(11, 21, 34, 0.96), rgba(9, 16, 27, 0.98));
  color: #cbd5e1;
  font-family: 'Be Vietnam Pro', sans-serif;
  overflow-x: hidden;
}

.main-content-spirit {
  max-width: 1440px;
  margin: 0 auto;
  padding: 34px 25px 92px;
}

.hero-aura-wrapper {
  margin-bottom: 56px;
  border-radius: var(--app-radius-lg);
  overflow: hidden;
}

.continue-cultivation-area {
  margin-bottom: 68px;
  position: relative;
  z-index: 10;
}

.content-body-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 44px;
}

.main-col-spirit,
.spirit-block {
  min-width: 0;
}

.spirit-block { margin-bottom: 68px; }

/* ===== LINH KHÍ TRẬN (SECTION HEADERS CHUNG) ===== */
.spirit-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 28px;
  padding-bottom: 14px;
  position: relative;
}

.spirit-title {
  font-size: 1.52rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  color: #f5f8ff;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.06);
}

.spirit-note {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  margin-left: 10px;
  opacity: 0.82;
  display: inline-block;
  transform: translateY(-2px);
}

.view-all-spirit {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 9px 16px;
  border-radius: 50px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

/* ===== TONE MÀU CÁC BẢNG ===== */

/* 1. EMERALD (Tân Tú - Lục Bảo) */
.spirit-header.emerald { border-bottom: 1px solid rgba(114, 226, 205, 0.24); }
.spirit-header.emerald::before {
  content: ''; position: absolute; bottom: -1.5px; left: 0; width: 80px; height: 3px;
  background: var(--list-premium-jade); border-radius: 50px;
}
.spirit-header.emerald .spirit-title i { color: var(--list-premium-jade); filter: none; }
.view-all-spirit.emerald { color: #a4f0df; background: rgba(114, 226, 205, 0.14); border: 1px solid rgba(114, 226, 205, 0.28); }
.view-all-spirit.emerald:hover { background: rgba(114, 226, 205, 0.22); color: #e8fffa; transform: translateY(-1px); }

.spirit-footer {
  display: flex;
  justify-content: center;
  margin-top: 34px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.spirit-pagination {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(10, 17, 27, 0.72);
  padding: 4px 8px;
  border-radius: 50px;
  border: 1px solid rgba(120, 144, 168, 0.26);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.pag-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.pag-btn:hover:not(:disabled) {
  background: rgba(114, 226, 205, 0.16);
  color: #e9f8ff;
}

.pag-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.85rem;
  font-weight: 800;
  color: #f1f5f9;
  min-width: 15px;
  text-align: center;
}

/* 2. GOLD (Lệnh Bài - Hoàng Kim) */
.spirit-header.gold { border-bottom: 1px solid rgba(215, 182, 121, 0.25); }
.spirit-header.gold::before {
  content: ''; position: absolute; bottom: -1.5px; left: 0; width: 80px; height: 3px;
  background: var(--list-premium-gold); border-radius: 50px;
}
.spirit-header.gold .spirit-title i { color: var(--list-premium-gold); filter: none; }
.view-all-spirit.gold { color: #f2d8aa; background: rgba(215, 182, 121, 0.14); border: 1px solid rgba(215, 182, 121, 0.28); }
.view-all-spirit.gold:hover { background: rgba(215, 182, 121, 0.22); color: #fff0d2; transform: translateY(-1px); }

/* 3. PURPLE (Đại Viên Mãn - Tử Khí) */
.spirit-header.purple { border-bottom: 1px solid rgba(166, 197, 228, 0.22); }
.spirit-header.purple::before {
  content: ''; position: absolute; bottom: -1.5px; left: 0; width: 80px; height: 3px;
  background: #a6c5e4; border-radius: 50px;
}
.spirit-header.purple .spirit-title i { color: #a6c5e4; filter: none; }
.view-all-spirit.purple { color: #c8def3; background: rgba(166, 197, 228, 0.14); border: 1px solid rgba(166, 197, 228, 0.28); }
.view-all-spirit.purple:hover { background: rgba(166, 197, 228, 0.22); color: #e9f3ff; transform: translateY(-1px); }

/* 4. FIRE (Linh Anh - Đỏ Cam) */
.spirit-header.fire { border-bottom: 1px solid rgba(215, 182, 121, 0.25); padding-bottom: 8px;}
.spirit-header.fire::before {
  content: ''; position: absolute; bottom: -1.5px; left: 0; width: 60px; height: 3px;
  background: var(--list-premium-gold); border-radius: 50px;
}
.sidebar-title-xianxia { margin: 0; font-size: 1.2rem; font-weight: 900; color: #f8fafc; text-transform: uppercase; letter-spacing: 1.5px; display: flex; align-items: center; gap: 10px; text-shadow: 0 1px 0 rgba(255,255,255,0.06); }
.spirit-header.fire .sidebar-title-xianxia i { color: var(--list-premium-gold); filter: none; }

/* ===== 5. MOON (Nguyệt Bảng - Ánh Trăng Bạc/Xám Nhạt) ĐẶC BIỆT ===== */
.moon-board {
  background: linear-gradient(180deg, rgba(16, 26, 40, 0.92) 0%, rgba(12, 20, 32, 0.96) 100%) !important;
  border: 1px solid var(--app-border) !important;
  box-shadow: var(--app-shadow-2) !important;
  position: relative;
  overflow: hidden;
}
/* Hiệu ứng trăng sáng góc trên phải */
.moon-board::before {
  content: ''; position: absolute; top: -50px; right: -50px; width: 150px; height: 150px;
  background: radial-gradient(circle, rgba(226, 232, 240, 0.08) 0%, transparent 70%);
  border-radius: 50%; pointer-events: none;
}

.spirit-header.moon { border-bottom: 1px solid rgba(166, 197, 228, 0.24); padding-bottom: 10px;}
.spirit-header.moon::before {
  content: ''; position: absolute; bottom: -1.5px; left: 0; width: 60px; height: 3px;
  background: var(--list-premium-ice); border-radius: 50px;
}
.spirit-header.moon .sidebar-title-xianxia i, .spirit-header.moon .spirit-title i { color: var(--list-premium-ice); filter: none; }
.spirit-header.moon .spirit-title { color: #f8fafc; }

.moon-subtitle { font-size: 0.8rem; color: #9ab2c8; margin-bottom: 20px; font-style: italic; }

.moon-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.moon-tab {
  border: 1px solid rgba(120, 144, 168, 0.28);
  background: rgba(10, 17, 27, 0.7);
  color: #cbd5e1;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.moon-tab:hover {
  background: rgba(166, 197, 228, 0.2);
  border-color: rgba(166, 197, 228, 0.45);
  color: #e2e8f0;
}

.moon-tab.active {
  background: linear-gradient(135deg, #9ec0dd, #d9e8f7);
  color: #08131d;
  border-color: rgba(217, 232, 247, 0.85);
  box-shadow: none;
}

/* Grid mặc định cho Desktop */
.spirit-grid-responsive {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
  gap: 24px 22px;
  min-width: 0;
}

/* ===== SIDEBAR - GLASSMORPHISM ===== */
.sticky-spirit-box {
  position: sticky; top: 90px; display: flex; flex-direction: column; gap: 24px;
}

.sidebar-card-aura {
  background: var(--list-premium-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  padding: 22px;
  box-shadow: var(--app-shadow-1);
}

/* NGUYỆT BẢNG ITEM */
.ranking-spirit-list, .ranking-spirit-list-mobile { display: flex; flex-direction: column; gap: 12px; }

.ranking-spirit-item {
  display: flex; align-items: center; gap: 15px; padding: 12px 14px;
  background: rgba(8, 14, 22, 0.45);
  border: 1px solid rgba(120, 144, 168, 0.2);
  border-radius: 12px; cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
  position: relative;
}

.ranking-spirit-item:hover {
  background: rgba(114, 226, 205, 0.12);
  border-color: rgba(114, 226, 205, 0.32);
  transform: translateX(2px);
}

.rank-orb {
  width: 36px; height: 36px; flex-shrink: 0; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 1rem; color: #94a3b8;
  background: rgba(7, 14, 24, 0.76);
  border: 1px solid rgba(120, 144, 168, 0.28);
  box-shadow: none;
}

/* Top 1-2-3 Nguyệt Bảng (Tone Bạc/Trăng) */
.moon-item .rank-orb.top-1 { background: rgba(215, 182, 121, 0.16); border-color: #f1d6a1; color: #f8e5bf; }
.moon-item .rank-orb.top-2 { background: rgba(166, 197, 228, 0.14); border-color: #c2ddf4; color: #d9ecff; }
.moon-item .rank-orb.top-3 { background: rgba(114, 226, 205, 0.14); border-color: #95ead9; color: #d7fff6; }

.rank-details {
  flex-grow: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; gap: 6px;
}

.rank-name {
  margin: 0; padding: 0; font-size: 0.95rem; font-weight: 800; color: #f1f5f9;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;
  transition: color 0.2s ease;
}

.ranking-spirit-item:hover .rank-name { color: #f5f8fc; }

.rank-val {
  margin: 0; font-size: 0.75rem; color: #9ab2c8; font-weight: 600;
  display: flex; align-items: center; gap: 6px;
}
.rank-val::before { content: '\f06e'; font-family: 'Font Awesome 6 Free'; font-weight: 900; color: #9ab2c8; font-size: 0.75rem; }

.spirit-more-link, .spirit-more-link-mobile {
  display: block; text-align: center; margin-top: 20px;
  font-size: 0.8rem; font-weight: 800; text-transform: uppercase;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease; text-decoration: none; padding: 10px; border-radius: 10px;
  border: 1px solid rgba(120, 144, 168, 0.2);
}
.spirit-more-link.moon-text { color: #d4e3f2; background: rgba(12, 20, 33, 0.6); }
.spirit-more-link.moon-text:hover { color: #08131d; background: linear-gradient(135deg, #9ec0dd, #d9e8f7); border-color: rgba(217, 232, 247, 0.85); }

/* PHÂN LOẠI (TAG CLOUD) */
.tag-cloud-spirit { display: flex; flex-wrap: wrap; gap: 12px; }

.tag-pill-spirit {
  padding: 8px 16px;
  background: rgba(10, 17, 27, 0.7);
  border: 1px solid rgba(120, 144, 168, 0.22);
  border-radius: 8px; /* Đổi sang bo góc nhẹ thay vì pill tròn */
  color: #cbd5e1; font-size: 0.85rem; font-weight: 600; text-decoration: none;
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.tag-pill-spirit.fire-pill:hover {
  background: rgba(215, 182, 121, 0.15); border-color: var(--list-premium-gold); color: #f3ddb1;
  transform: translateY(-2px);
}

.mobile-extra-aura { display: none; }

.prefetch-sentinel {
  height: 1px;
  width: 100%;
}

/* ===== SKELETON STYLES ===== */
.hero-skeleton {
  width: 100%;
  height: 500px;
  border-radius: var(--app-radius-lg);
  overflow: hidden;
  position: relative;
  background: rgba(14, 22, 34, 0.9);
}
.hero-skeleton .shimmer { position: absolute; inset: 0; }

.ranking-skeleton {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.sk-orb  { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; }
.sk-info { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.sk-line { border-radius: 4px; height: 11px; }
.sk-line.lg { width: 72%; }
.sk-line.sm { width: 42%; height: 9px; }

.tag-pill-skeleton { width: 80px; height: 34px; border-radius: 8px; }

/* Shimmer keyframe */
@keyframes shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
}
.shimmer {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.03) 0%,
    rgba(255,255,255,0.08) 45%,
    rgba(255,255,255,0.03) 80%
  );
  background-size: 1200px 100%;
  animation: shimmer 1.6s infinite linear;
}
@media (prefers-reduced-motion: reduce) {
  .shimmer { animation: none; background: rgba(255,255,255,0.05); }
}

/* ===== MOBILE OPTIMIZATION ===== */
@media (max-width: 1024px) {
  .content-body-grid { grid-template-columns: 1fr; }
  /* sidebar-col-spirit không cần display:none vì dùng v-if="!isMobile" */
  .mobile-extra-aura { display: block; margin-top: 30px; }
}

@media (max-width: 640px) {
  .main-content-spirit { padding: 12px 14px 56px; }
  .hero-aura-wrapper { margin-bottom: 12px; border-radius: 16px; }
  .continue-cultivation-area { margin-bottom: 24px; }
  .spirit-block { margin-bottom: 34px; }

  .spirit-title { font-size: 1.3rem; }
  .spirit-note { display: none; /* Ẩn note phụ trên mobile cho gọn */ }

  .spirit-grid-responsive {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px 10px;
  }

  .ranking-spirit-list-mobile { padding: 15px; border-radius: 16px; }
}

@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.45s ease-out forwards; }
</style>
