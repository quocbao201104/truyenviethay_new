<template>
  <div class="story-detail-page-cosmic">
    <div class="portal-nebula-glow"></div>
    <div class="portal-particles"></div>

    <main v-if="loading" class="detail-container">
      <section class="story-hero-loading cosmic-glass">
        <div class="skeleton-aura">
          <SkeletonLoader width="240px" height="340px" borderRadius="16px" />
          <div class="skeleton-info">
            <SkeletonLoader
              width="60%"
              height="48px"
              style="margin-bottom: 20px"
            />
            <SkeletonLoader
              width="40%"
              height="24px"
              style="margin-bottom: 30px"
            />
            <div class="flex gap-4">
              <SkeletonLoader width="120px" height="80px" borderRadius="12px" />
              <SkeletonLoader width="120px" height="80px" borderRadius="12px" />
              <SkeletonLoader width="120px" height="80px" borderRadius="12px" />
            </div>
          </div>
        </div>
      </section>
    </main>

    <main v-else-if="error" class="error-container-xianxia">
      <div class="error-box cosmic-glass">
        <i class="fas fa-ghost text-5xl mb-4 opacity-30 text-cyan-400"></i>
        <p class="error-msg">Thiên cơ nhiễu loạn: {{ error }}</p>
        <router-link to="/truyen-chu" class="back-link-aura"></router-link>
      </div>
    </main>

    <main
      v-else-if="story && story.slug === route.params.slug"
      class="detail-container animate-fadeIn"
    >
        <Breadcrumb :items="[
          { name: 'Trang Chủ', path: '/' },
          { 
            name: story.genres && story.genres.length ? story.genres[0].ten_theloai : 'Truyện Chữ', 
            path: story.genres && story.genres.length ? `/the-loai?categories=${story.genres[0].id_theloai}` : '/the-loai' 
          },
          { name: story.ten_truyen }
        ]" />

        <section class="story-hero-section cosmic-glass">
        <div class="hero-content">
          <div class="cover-wrapper">
            <div
              class="cover-blur-bg"
              :style="{ backgroundImage: `url(${storyCoverBlurUrl})` }"
            ></div>
            <img
              :src="storyCoverUrl"
              :srcset="storyCoverSrcSet"
              sizes="(max-width: 768px) 58vw, (max-width: 1200px) 280px, 320px"
              :alt="story.ten_truyen"
              class="story-cover-main"
              decoding="async"
              fetchpriority="high"
              @error="handleImageError"
            />
            <div :class="['status-sigil-detail', statusClass]">
              <i
                v-if="statusClass === 'status-completed'"
                class="fas fa-circle-check"
              ></i>
              <i v-else class="fas fa-atom animate-spin-slow"></i>
              <span class="sigil-text">{{
                formatStatus(story.trang_thai)
              }}</span>
            </div>
          </div>

          <div class="info-content">
            <h1 class="story-title-main">{{ story.ten_truyen }}</h1>

            <div class="meta-row">
              <router-link
                v-if="story.author_id"
                :to="`/tac-gia/${story.author_id}`"
                class="author-link"
              >
                <i class="fas fa-feather-pointed text-cyan-400"></i>
                {{ story.tac_gia || "Ẩn Danh" }}
              </router-link>
              <span v-else class="author-link">
                <i class="fas fa-feather-pointed text-cyan-400"></i>
                {{ story.tac_gia || "Ẩn Danh" }}
              </span>

              <div
                class="genre-tags"
                v-if="story.genres && story.genres.length"
              >
                <i class="fas fa-book-open text-slate-500"></i>
                <router-link
                  v-for="(genre, index) in story.genres"
                  :key="genre.id_theloai"
                  :to="`/the-loai?categories=${genre.id_theloai}`"
                  class="genre-tag"
                >
                  {{ genre.ten_theloai
                  }}<span
                    v-if="Number(index) < story.genres.length - 1"
                    class="text-slate-600"
                    >,
                  </span>
                </router-link>
              </div>

              <span :class="['status-sigil-inline-mobile', statusClass]">
                <i
                  v-if="statusClass === 'status-completed'"
                  class="fas fa-circle-check"
                ></i>
                <i v-else class="fas fa-atom"></i>
                <span>{{ formatStatus(story.trang_thai) }}</span>
              </span>
            </div>

            <div class="stats-grid">
              <div class="stat-box">
                <span class="value">{{ story.so_luong_chuong || 0 }}</span>
                <span class="label">CHƯƠNG</span>
              </div>
              <div class="stat-box">
                <span class="value">{{
                  formatNumber(story.luot_xem || 0)
                }}</span>
                <span class="label">LƯỢT XEM</span>
              </div>
              <div class="stat-box rating-stat">
                <div class="rating-val">
                  <i class="fas fa-star text-amber-400 text-sm"></i>
                  <span class="value">{{
                    ratingStats.avg_rating > 0
                      ? Number(ratingStats.avg_rating).toFixed(1)
                      : "5.0"
                  }}</span>
                </div>
                <span class="label"
                  >{{ ratingStats.total_ratings || 0 }} ĐÁNH GIÁ</span
                >
              </div>
            </div>

            <div class="actions-row">
              <router-link
                v-if="story && readTarget"
                :to="{
                  path: `/truyen-chu/${story.slug}/${readTarget.slug}`,
                  query: { storyId: story.id, chapterId: readTarget.id },
                }"
                class="btn-primary"
              >
                {{ hasHistory ? "TIẾP TỤC ĐỌC " : "LĨNH HỘI" }}
              </router-link>

              <router-link
                v-if="story?.has_audio"
                :to="`/truyen-audio/${story.slug}`"
                class="btn-primary audio-link"
                style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);"
              >
                <i class="fas fa-headphones" style="margin-right: 6px;"></i> NGHE AUDIO
              </router-link>

              <div class="secondary-actions">
                <button
                  @click="toggleFollow"
                  class="btn-action-spirit"
                  :class="{ followed: isFollowed }"
                >
                  <i
                    class="fas"
                    :class="
                      isFollowed
                        ? 'fa-heart-circle-check'
                        : 'fa-heart-circle-plus'
                    "
                  ></i>
                  <span>{{ isFollowed ? "Đang Khắc Ấn" : "Khắc Ấn" }}</span>
                </button>

                <button
                  @click="handleToggleLike"
                  class="btn-action-spirit"
                  :class="{ liked: isLiked }"
                >
                  <i
                    class="fas"
                    :class="isLiked ? 'fa-thumbs-up' : 'fa-thumbs-up'"
                  ></i>
                  <span>{{ isLiked ? "Tâm Đắc" : "Tán Thưởng" }}</span>
                </button>
              </div>
            </div>

            <div class="rating-input-box">
              <span class="label">Định phẩm linh thư:</span>
              <div class="star-group">
                <i
                  v-for="star in 5"
                  :key="star"
                  @click="handleRating(star)"
                  @mouseenter="hoverRating = star"
                  @mouseleave="hoverRating = 0"
                  :class="[
                    'fas fa-star',
                    {
                      active: star <= (hoverRating || userRating),
                      hover: star <= hoverRating,
                    },
                  ]"
                ></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="tabs-nav-clean">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-item', { active: currentTab === tab.id }]"
          @click="currentTab = tab.id"
        >
          <i class="fas" :class="tab.icon"></i>
          {{ tab.label }}
        </button>
      </div>

      <section class="tab-content-area animate-fadeIn">
        <div
          v-if="currentTab === 'intro'"
          class="content-panel cosmic-glass intro"
        >
          <div class="panel-title-row">
            <h3 class="panel-title">
              <i class="fas fa-feather text-cyan-400"></i> Tóm Tắt Bí Tịch
            </h3>
            <div
              v-if="authStore.isLoggedIn && story?.id"
              ref="novelActionMenuRef"
              class="panel-action-menu"
            >
              <button
                type="button"
                class="panel-action-trigger"
                title="Tùy chọn truyện"
                @click.stop="toggleNovelActionMenu"
              >
                <i class="fas fa-ellipsis-vertical"></i>
              </button>
              <div v-if="isNovelActionMenuOpen" class="panel-dropdown" @click.stop>
                <button type="button" class="panel-dropdown__item" @click="openNovelReportModal">
                  <i class="fas fa-flag"></i>
                  <span>Báo cáo</span>
                </button>
              </div>
            </div>
          </div>
          <div class="description-text">
            {{ story.mo_ta || `Đọc ${story.ten_truyen} tại TruyenVietHay. Xem danh sách chương, tình trạng cập nhật và thông tin truyện mới nhất.` }}
          </div>
        </div>

        <div
          v-if="currentTab === 'chapters'"
          class="content-panel cosmic-glass chapters"
        >
          <div class="panel-header-row">
            <!-- Range Selector for Seek Pagination -->
            <div
              class="chapter-range-selector"
              v-if="story && (story.so_luong_chuong || 0) > itemsPerPage"
            >
              <span class="range-label">Chọn:</span>
              <select v-model="selectedRange" class="range-select">
                <option
                  v-for="range in availableRanges"
                  :key="range.min"
                  :value="range"
                >
                  Chương {{ range.min + 1 }} -
                  {{
                    Math.min(range.min + rangeLimit, story.so_luong_chuong || 0)
                  }}
                </option>
              </select>
            </div>
            <div class="panel-title-group"></div>
            <button
              @click="isReverse = !isReverse"
              class="btn-sort-spirit"
              :title="isReverse ? 'Cũ nhất trước' : 'Mới nhất trước'"
            >
              <i
                class="fas"
                :class="isReverse ? 'fa-sort-amount-up' : 'fa-sort-amount-down'"
              ></i>
              <span>{{ isReverse ? "Mới nhất" : "Cũ nhất" }}</span>
            </button>
          </div>

          <div
            v-if="chapterLoading"
            class="loading-state text-cyan-400 text-center py-10"
          >
            <i class="fas fa-yin-yang fa-spin text-2xl mb-2 block"></i> Đang
            thỉnh chương...
          </div>
          <div
            v-else-if="chapters.length === 0"
            class="empty-state text-center py-10 text-slate-500"
          >
            Bí tịch chưa được viết...
          </div>
          <div v-else>
            <div class="chapter-grid">
              <router-link
                v-for="chap in paginatedChapters"
                :key="chap.id"
                :to="`/truyen-chu/${story?.slug}/${chap.slug}`"
                class="chapter-item"
              >
                <span class="chap-name">{{
                  chap.ten_chuong || chap.tieu_de
                }}</span>
                <span class="chap-time">{{
                  formatDate(chap.thoi_gian_dang)
                }}</span>
              </router-link>
            </div>

            <div class="pagination-bar" v-if="totalPages > 1">
              <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="page-btn"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <span class="page-text"
                >Tầng {{ currentPage }} / {{ totalPages }}</span
              >
              <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="page-btn"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="currentTab === 'comments'"
          class="content-panel cosmic-glass comments"
        >
          <h3 class="panel-title">
            <i class="fas fa-comments text-cyan-400"></i> Khu Vực Luận Đạo
          </h3>
          <CommentList :story-id="story.id" :story-author-id="story.user_id" />
        </div>
      </section>

      <!-- RELATED STORIES -->
      <section v-if="story" class="related-area animate-fadeIn">
        <RelatedStoriesSection
          v-if="story.tac_gia"
          title="Truyện Cùng Tác Giả"
          type="author"
          :author-name="story.tac_gia"
          :exclude-id="story.id"
        />

        <RelatedStoriesSection
          v-if="story.genres && story.genres.length"
          title="Truyện Tương Tự"
          type="genre"
          :genres="story.genres.map(g => g.id_theloai)"
          :exclude-id="story.id"
        />
      </section>

      <ReportTargetModal
        :open="isNovelReportModalOpen"
        :target-id="story?.id || null"
        target-type="novel"
        :target-label="story?.ten_truyen || 'truyện này'"
        @close="isNovelReportModalOpen = false"
        @submitted="isNovelReportModalOpen = false"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from "vue";
import { useRoute, useRouter, onBeforeRouteUpdate } from "vue-router";
import { useHead } from "@unhead/vue";
import { useStoryStore } from "@/modules/storyText/story.store";
import { useChapterStore } from "@/modules/storyText/chapter/chapter.store";
import { useCommentStore } from "@/modules/comment/comment.store";
import { useFavoriteStore } from "@/modules/favorite/favorite.store";
import { useRatingStore } from "@/modules/rating/rating.store";
import { useHistoryStore } from "@/modules/history/history.store";
import { useAuthStore } from "@/modules/auth/auth.store";
import CommentList from "@/modules/comment/CommentList.vue";
import SkeletonLoader from "@/components/common/SkeletonLoader.vue";
import Breadcrumb from "@/components/common/Breadcrumb.vue";
import RelatedStoriesSection from "@/modules/storyText/components/RelatedStoriesSection.vue";
import ReportTargetModal from "@/modules/report/components/ReportTargetModal.vue";
import {
  DEFAULT_STORY_COVER_URL,
  getStoryCoverSrcSet,
  getStoryCoverUrl,
} from "@/config/constants";
import { defaultOgImage, stripHtml, toCanonicalUrl, truncateText } from "@/seo/site";
import { buildBookSchema } from "@/seo/schema";

const route = useRoute();
const storyStore = useStoryStore();
const chapterStore = useChapterStore();
const favoriteStore = useFavoriteStore();
const ratingStore = useRatingStore();
const historyStore = useHistoryStore();
const commentStore = useCommentStore();
const authStore = useAuthStore();

const hoverRating = ref(0);
const userRating = computed(() => ratingStore.userRating);
const ratingStats = computed(() => ratingStore.stats);
const novelActionMenuRef = ref<HTMLElement | null>(null);
const isNovelActionMenuOpen = ref(false);
const isNovelReportModalOpen = ref(false);

const currentTab = ref("intro");
const tabs = [
  { id: "intro", label: "BẢN THẢO", icon: "fa-book-open" },
  { id: "chapters", label: "BÍ TỊCH", icon: "fa-list-ol" },
  { id: "comments", label: "LUẬN ĐẠO", icon: "fa-comments" },
];

const story = computed(() => storyStore.currentStory);
const loading = computed(() => storyStore.loading);
const error = computed(() => storyStore.error);
const isLiked = computed(() => storyStore.isLiked);

const chapters = computed(() => chapterStore.chapterList);
const chapterLoading = computed(() => chapterStore.loading);

// Seek Pagination Ranges
const rangeLimit = 100;
const selectedRange = ref({ min: 0 });
const availableRanges = computed(() => {
  const ranges = [];
  if (!story.value) return [{ min: 0 }];
  const total = story.value.so_luong_chuong || 0;
  for (let i = 0; i < total; i += rangeLimit) {
    ranges.push({ min: i });
  }
  return ranges.length > 0 ? ranges : [{ min: 0 }];
});

watch(selectedRange, async (newVal) => {
  if (story.value) {
    await chapterStore.fetchChapterList(
      story.value.id,
      1,
      rangeLimit,
      newVal.min,
    );
    currentPage.value = 1;
  }
});

// PhĂ¢n trang & Sáº¯p xáº¿p local cho range hiá»‡n táº¡i
const isReverse = ref(false); // Default to OLDest first within a range for better reading flow
const sortedChapters = computed(() =>
  isReverse.value ? [...chapters.value].reverse() : [...chapters.value],
);

const currentPage = ref(1);
const itemsPerPage = 30;
const paginatedChapters = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return sortedChapters.value.slice(start, start + itemsPerPage);
});
const totalPages = computed(() =>
  Math.ceil(sortedChapters.value.length / itemsPerPage),
);
const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page;
};

const firstChapterSlug = computed(() => {
  if (
    chapters.value.length > 0 &&
    story.value &&
    chapters.value[0].truyen_id === story.value.id
  ) {
    return chapters.value[0].slug;
  }
  return null;
});

const firstChapterId = computed(() => {
  if (
    chapters.value.length > 0 &&
    story.value &&
    chapters.value[0].truyen_id === story.value.id
  ) {
    return chapters.value[0].id;
  }
  return null;
});

const storyHistory = computed(() => {
  if (!story.value) return null;
  return (
    historyStore.history.find((h) => h.truyen_id === story.value?.id) || null
  );
});

const hasHistory = computed(() => !!storyHistory.value);

const readTarget = computed(() => {
  if (hasHistory.value && storyHistory.value) {
    const lastRead = storyHistory.value.last_read_chuong_id
      ? chapters.value.find(
          (c) => c.id === storyHistory.value?.last_read_chuong_id,
        )
      : storyHistory.value.chuong_slug
        ? chapters.value.find((c) => c.slug === storyHistory.value?.chuong_slug)
        : null;
    if (lastRead) return { slug: lastRead.slug, id: lastRead.id };
  }
  if (chapters.value.length > 0) {
    return { slug: chapters.value[0].slug, id: chapters.value[0].id };
  }
  return null;
});

const isFollowed = computed(() => {
  if (!story.value) return false;
  const inFavorites = favoriteStore.favorites.some(
    (f) => f.id === story.value?.id,
  );
  if (inFavorites) return true;
  return !!story.value.is_followed;
});

const toggleFollow = async () => {
  if (!story.value) return;
  await favoriteStore.toggleFollow(story.value.id);
  await favoriteStore.fetchFavorites();
};

const handleToggleLike = async () => {
  if (story.value) await storyStore.toggleLike(story.value.id);
};

const handleRating = async (rating: number) => {
  if (story.value) await ratingStore.submitUserRating(story.value.id, rating);
};

const closeNovelActionMenu = () => {
  isNovelActionMenuOpen.value = false;
};

const toggleNovelActionMenu = () => {
  isNovelActionMenuOpen.value = !isNovelActionMenuOpen.value;
};

const openNovelReportModal = () => {
  closeNovelActionMenu();
  isNovelReportModalOpen.value = true;
};

const handleNovelActionMenuDocumentClick = (event: MouseEvent) => {
  const target = event.target as Node | null;
  if (!target) return;
  if (novelActionMenuRef.value?.contains(target)) return;
  closeNovelActionMenu();
};

const formatDate = (d?: string | null) => {
  if (!d) return "";
  const date = new Date(d);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

const storyCoverUrl = computed(() => getStoryCoverUrl(story.value?.anh_bia, 720));
const storyCoverSrcSet = computed(() =>
  getStoryCoverSrcSet(story.value?.anh_bia, [320, 480, 640, 720, 960]),
);
const storyCoverBlurUrl = computed(() => getStoryCoverUrl(story.value?.anh_bia, 960));

const storyCanonicalPath = computed(() => {
  const slug = story.value?.slug || (route.params.slug as string) || "";
  return slug ? `/truyen-chu/${slug}` : route.path;
});

const storyCanonicalUrl = computed(() => toCanonicalUrl(storyCanonicalPath.value));

const storyMetaTitle = computed(() => {
  const storyName = story.value?.ten_truyen?.trim();
  if (!storyName) return "Truyện Chữ | TruyenVietHay";
  const author = story.value?.tac_gia?.trim();
  return author
    ? `${storyName} - ${author} | Đọc Truyện Full`
    : `${storyName} | Đọc Truyện Full`;
});

const storyMetaDescription = computed(() => {
  if (!story.value) return "Đọc truyện chương mới nhất tại TruyenVietHay.";
  const fallback = `Đọc ${story.value.ten_truyen} tại TruyenVietHay. Xem danh sách chương, tình trạng cập nhật và thông tin truyện mới nhất.`;
  const summary = story.value.mo_ta ? truncateText(stripHtml(story.value.mo_ta), 150) : null;
  return summary || fallback;
});

const storyMetaKeywords = computed(() => {
  const keywords: string[] = [];
  if (story.value?.ten_truyen) keywords.push(story.value.ten_truyen);
  if (story.value?.tac_gia) keywords.push(story.value.tac_gia);
  if (story.value?.genres?.length) {
    keywords.push(...story.value.genres.map((genre) => genre.ten_theloai));
  }
  keywords.push("truyện chữ", "đọc truyện online");
  return Array.from(new Set(keywords.filter(Boolean))).join(", ");
});

const storyOgImage = computed(() => storyCoverUrl.value || defaultOgImage);

useHead(() => ({
  title: storyMetaTitle.value,
  link: [
    {
      rel: "canonical",
      href: storyCanonicalUrl.value,
    },
  ],
  meta: [
    { name: "description", content: storyMetaDescription.value },
    { name: "keywords", content: storyMetaKeywords.value },
    { name: "robots", content: "index, follow" },
    { property: "og:type", content: "book" },
    { property: "og:title", content: storyMetaTitle.value },
    { property: "og:description", content: storyMetaDescription.value },
    { property: "og:url", content: storyCanonicalUrl.value },
    { property: "og:image", content: storyOgImage.value },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: storyMetaTitle.value },
    { name: "twitter:description", content: storyMetaDescription.value },
    { name: "twitter:image", content: storyOgImage.value },
  ],
  script: story.value
    ? [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            buildBookSchema({
              name: story.value.ten_truyen || "",
              slug: story.value.slug || (route.params.slug as string) || "",
              author: story.value.tac_gia || undefined,
              description: storyMetaDescription.value,
              coverUrl: storyOgImage.value || undefined,
              genres: story.value.genres?.map((g) => g.ten_theloai) || [],
              chapterCount: story.value.so_luong_chuong || 0,
              ratingValue: ratingStats.value.avg_rating || 0,
              ratingCount: ratingStats.value.total_ratings || 0,
              reviews: commentStore.comments.slice(0, 3).map((c: any) => ({
                author: c.author_name || 'Ẩn danh',
                content: c.content,
                date: c.created_at
              }))
            }),
          ),
        },
      ]
    : [],
}));

const handleImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = DEFAULT_STORY_COVER_URL;
};

const formatStatus = (status: string) => {
  if (!status) return "Đang Ra";
  const s = status.toLowerCase().trim();
  if (s === "hoan_thanh" || s.includes("hoàn thành")) return "Viên Mãn";
  return "Đang Ra";
};

const statusClass = computed(() => {
  if (!story.value) return "status-on-going";
  const s = story.value.trang_thai.toLowerCase().trim();
  if (s === "hoan_thanh" || s.includes("hoàn thành")) return "status-completed";
  return "status-on-going";
});

let lastFetchSlug = "";
const fetchData = async () => {
  const slug = route.params.slug as string;
  if (!slug) return;

  lastFetchSlug = slug;
  storyStore.clearData();
  chapterStore.clearChapterList();

  await storyStore.fetchStoryBySlug(slug);

  if (lastFetchSlug !== slug) return;

  if (story.value) {
    const promises: Promise<any>[] = [
      chapterStore.fetchChapterList(story.value.id, 1, rangeLimit, 0),
      storyStore.fetchLikeStatus(story.value.id),
      ratingStore.fetchRatings(story.value.id),
    ];

    if (authStore.isLoggedIn) {
      promises.push(favoriteStore.fetchFavorites());
      promises.push(historyStore.fetchHistory(1));
    }

    await Promise.all(promises);
    if (lastFetchSlug !== slug) return;
  }
};

const formatNumber = (num: number) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
};

onMounted(() => {
  if (route.query.tab) currentTab.value = route.query.tab as string;
  if (typeof document !== "undefined") {
    document.addEventListener("click", handleNovelActionMenuDocumentClick);
  }
  fetchData();
});

onUnmounted(() => {
  if (typeof document !== "undefined") {
    document.removeEventListener("click", handleNovelActionMenuDocumentClick);
  }
  storyStore.clearData();
  chapterStore.clearChapterList();
});

onBeforeRouteUpdate((to) => {
  if (to.params.slug !== route.params.slug) {
    storyStore.clearData();
    chapterStore.clearChapterList();
  }
});

watch(
  () => route.params.slug,
  () => {
    if (route.name === "StoryDetail") fetchData();
  },
);
</script>

<style scoped>
/* ===== CORE THEME ===== */
.story-detail-page-cosmic {
  --text-premium-bg: linear-gradient(135deg, rgba(11, 21, 34, 0.96), rgba(18, 30, 45, 0.92));
  --text-premium-surface: rgba(14, 24, 38, 0.78);
  --text-premium-border: rgba(120, 144, 168, 0.18);
  --text-premium-gold: #d7b679;
  --text-premium-jade: #72e2cd;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(114, 226, 205, 0.1), transparent 40%),
    radial-gradient(circle at top right, rgba(215, 182, 121, 0.08), transparent 42%),
    #0b111b;
  color: #cbd5e1;
  font-family: "Be Vietnam Pro", sans-serif;
  padding-bottom: 60px;
  position: relative;
  overflow: hidden;
}

.portal-nebula-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100vw;
  height: 52vh;
  background:
    radial-gradient(ellipse at top, rgba(114, 226, 205, 0.14) 0%, transparent 70%),
    linear-gradient(180deg, rgba(13, 20, 31, 0.4) 0%, transparent 100%);
  z-index: 0;
  pointer-events: none;
}

.portal-particles {
  position: absolute;
  inset: 0;
  background-image: none;
  z-index: 0;
  pointer-events: none;
}

.detail-container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 28px 20px 72px;
  position: relative;
  z-index: 10;
}

/* Nút Trở Về */
.back-home-wrapper {
  margin-bottom: 20px;
}
.btn-back-home {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #a8bfd2;
  text-decoration: none;
  font-size: 0.92rem;
  font-weight: 700;
  transition:
    color 0.25s ease,
    background-color 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s ease;
  padding: 10px 16px;
  background: rgba(12, 20, 33, 0.7);
  border-radius: 999px;
  border: 1px solid rgba(215, 182, 121, 0.16);
}
.btn-back-home:hover {
  color: #f5e4bf;
  background: rgba(215, 182, 121, 0.14);
  border-color: rgba(215, 182, 121, 0.3);
  transform: translateY(-1px);
}

/* Kính Mờ Chung */
.cosmic-glass {
  background: var(--text-premium-surface);
  border: 1px solid var(--text-premium-border);
  box-shadow:
    0 14px 32px rgba(3, 9, 20, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

/* ===== HERO SECTION ===== */
.story-hero-section {
  border-radius: 28px;
  padding: 26px;
  margin-bottom: 32px;
  background: var(--text-premium-bg);
  border-color: rgba(120, 144, 168, 0.22);
}

.hero-content {
  display: grid;
  grid-template-columns: clamp(210px, 21vw, 270px) minmax(0, 1fr);
  gap: 28px;
  align-items: flex-start;
}

/* Ảnh Bìa Nền Mờ Khít */
.cover-wrapper {
  flex-shrink: 0;
  width: 100%;
  max-width: 270px;
  aspect-ratio: 3 / 4;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 14px 28px rgba(3, 8, 18, 0.28);
  border: 1px solid rgba(215, 182, 121, 0.24);
}

.cover-blur-bg {
  display: none;
}

.story-cover-main {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  z-index: 1;
}

.cover-wrapper::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(to top, rgba(6, 12, 20, 0.75) 0%, transparent 44%);
}

/* Thẻ Trạng Thái */
.status-sigil-detail {
  position: absolute;
  bottom: 12px;
  left: 12px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 3;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.status-completed {
  background: rgba(18, 31, 43, 0.78);
  border: 1px solid rgba(114, 226, 205, 0.42);
  color: #9cf5d3;
}
.status-on-going {
  background: rgba(18, 31, 43, 0.78);
  border: 1px solid rgba(215, 182, 121, 0.38);
  color: #f6e1b8;
}

.status-sigil-inline-mobile {
  display: none;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  line-height: 1;
}

.status-sigil-inline-mobile i {
  font-size: 0.72rem;
}

.animate-spin-slow {
  animation: spin 8s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Thông tin chính */
.info-content {
  flex: 1;
  max-width: 100%;
}

.story-title-main {
  font-size: clamp(2rem, 2.25vw, 2.8rem);
  font-weight: 800;
  margin: 0 0 12px;
  line-height: 1.2;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #ffffff 24%, #c5e8f2 86%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-wrap: balance;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 24px;
  color: #a8bfd2;
  font-size: 0.9rem;
}
.author-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid rgba(120, 144, 168, 0.2);
  border-radius: 999px;
  background: rgba(8, 14, 22, 0.32);
  font-weight: 700;
  color: #e8f4ff;
  text-decoration: none;
}
.genre-tags {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  padding: 8px 12px;
  border: 1px solid rgba(120, 144, 168, 0.2);
  border-radius: 999px;
  background: rgba(8, 14, 22, 0.32);
}
.genre-tag {
  color: #86def0;
  text-decoration: none;
  font-weight: 700;
}
.genre-tag:hover {
  text-decoration: underline;
}

/* 3 Ô THỐNG KÊ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}
.stat-box {
  background: rgba(9, 17, 28, 0.56);
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  border: 1px solid rgba(120, 144, 168, 0.16);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}
.stat-box .value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #f8fafc;
  line-height: 1;
  margin-bottom: 6px;
}
.stat-box .label {
  font-size: 0.72rem;
  color: #90a5b8;
  font-weight: 800;
  letter-spacing: 0.06em;
}
.rating-stat .rating-val {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 6px;
}
.rating-stat .rating-val .value {
  margin-bottom: 0;
  color: #fbbf24;
  text-shadow: none;
}

/* NÚT BẤM */
.actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.btn-primary {
  background: linear-gradient(135deg, #61dcc4, #8de7f5);
  color: #08131d;
  padding: 12px 24px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 0.92rem;
  letter-spacing: 0.03em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.25s ease;
  box-shadow: 0 10px 20px rgba(6, 16, 26, 0.28);
  border: 1px solid rgba(143, 232, 247, 0.3);
}
.btn-primary:hover {
  transform: translateY(-1px) scale(1.01);
  box-shadow: 0 14px 24px rgba(6, 16, 26, 0.34);
}

.secondary-actions {
  display: flex;
  gap: 12px;
}

.btn-action-spirit {
  background: rgba(10, 17, 27, 0.7);
  color: #bfd3e2;
  padding: 12px 18px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(120, 144, 168, 0.22);
  transition: all 0.25s ease;
  cursor: pointer;
}
.btn-action-spirit i {
  font-size: 1.1rem;
  transition: 0.3s;
}
.btn-action-spirit:hover {
  background: rgba(120, 144, 168, 0.16);
  color: #f4f8ff;
  border-color: rgba(120, 144, 168, 0.35);
  transform: translateY(-1px);
}

.btn-action-spirit.followed {
  color: #f43f5e;
  border-color: rgba(244, 63, 94, 0.4);
  background: rgba(244, 63, 94, 0.1);
}
.btn-action-spirit.followed i {
  filter: none;
}

.btn-action-spirit.liked {
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.4);
  background: rgba(56, 189, 248, 0.1);
}
.btn-action-spirit.liked i {
  filter: none;
}

.btn-action-spirit.group-btn:hover {
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.4);
}

/* RATING INPUT */
.rating-input-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 18px;
  border-top: 1px solid rgba(120, 144, 168, 0.2);
}
.rating-input-box .label {
  font-size: 0.86rem;
  color: #9bb2c6;
  font-weight: 600;
}
.star-group {
  display: flex;
  gap: 6px;
  font-size: 1.2rem;
  color: #334155;
}
.star-group i {
  cursor: pointer;
  transition: 0.2s;
}
.star-group i.active,
.star-group i.hover {
  color: #fbbf24;
  filter: none;
}

/* ===== TABS NAVIGATION ===== */
.tabs-nav-clean {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid rgba(120, 144, 168, 0.18);
  margin-bottom: 20px;
  position: relative;
  z-index: 10;
  padding-bottom: 10px;
}
.tab-item {
  background: rgba(10, 17, 27, 0.62);
  border: 1px solid rgba(120, 144, 168, 0.2);
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 0.84rem;
  font-weight: 800;
  color: #9bb2c6;
  cursor: pointer;
  transition:
    color 0.25s ease,
    background-color 0.25s ease,
    border-color 0.25s ease;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.tab-item:hover {
  color: #eaf3ff;
  border-color: rgba(120, 144, 168, 0.36);
  background: rgba(120, 144, 168, 0.12);
}
.tab-item.active {
  color: #0a1824;
  border-color: rgba(97, 220, 196, 0.5);
  background: linear-gradient(135deg, #61dcc4, #8de7f5);
}

/* ===== TAB CONTENT ===== */
.content-panel {
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 24px;
}
.panel-title {
  font-size: 1.16rem;
  font-weight: 800;
  color: #f4f9ff;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: -0.01em;
}

.panel-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.panel-action-menu {
  position: relative;
  flex-shrink: 0;
}

.panel-action-trigger {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  border: 1px solid rgba(120, 144, 168, 0.2);
  background: rgba(10, 17, 27, 0.72);
  color: #cbd5e1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.panel-action-trigger:hover {
  border-color: rgba(97, 220, 196, 0.34);
  color: #ecfeff;
  background: rgba(97, 220, 196, 0.12);
}

.panel-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 156px;
  padding: 8px;
  border-radius: 16px;
  border: 1px solid rgba(120, 144, 168, 0.16);
  background: rgba(8, 14, 22, 0.96);
  box-shadow: 0 18px 34px rgba(3, 9, 20, 0.4);
  z-index: 20;
}

.panel-dropdown__item {
  width: 100%;
  border: 0;
  border-radius: 12px;
  padding: 10px 12px;
  background: transparent;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  cursor: pointer;
}

.panel-dropdown__item:hover {
  background: rgba(97, 220, 196, 0.12);
  color: #8de7f5;
}
.panel-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  border-bottom: 1px solid rgba(120, 144, 168, 0.16);
  padding-bottom: 14px;
}
.panel-title-group {
  display: flex;
  align-items: center;
  gap: 15px;
}
.panel-header-row .panel-title {
  margin-bottom: 0;
}

.btn-sort-spirit {
  background: rgba(10, 17, 27, 0.76);
  border: 1px solid rgba(120, 144, 168, 0.28);
  color: #cbe2f1;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: 0.2s;
}
.btn-sort-spirit:hover {
  background: rgba(120, 144, 168, 0.18);
  border-color: rgba(120, 144, 168, 0.38);
}

.description-text {
  line-height: 1.8;
  color: #c0d1e0;
  white-space: pre-line;
  font-size: 1rem;
  max-width: 68ch;
}

/* Chapter Grid */
.chapter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}
.chapter-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  background: rgba(10, 17, 27, 0.58);
  border-radius: 14px;
  text-decoration: none;
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s ease;
  border: 1px solid rgba(120, 144, 168, 0.16);
}
.chapter-item:hover {
  background: rgba(114, 226, 205, 0.12);
  border-color: rgba(114, 226, 205, 0.3);
  transform: translateY(-1px);
}
.chap-name {
  min-width: 0;
  color: #cbd5e1;
  font-weight: 600;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.25s ease;
}
.chapter-item:hover .chap-name {
  color: #dff8ff;
}
.chap-time {
  font-size: 0.75rem;
  color: #64748b;
  flex-shrink: 0;
  white-space: nowrap;
  text-align: right;
}

/* Pagination */
.pagination-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
}
.page-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  transition: 0.3s;
  cursor: pointer;
}
.page-btn:hover:not(:disabled) {
  background: rgba(34, 211, 238, 0.2);
  border-color: #22d3ee;
  color: #22d3ee;
}
.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.page-text {
  font-weight: 700;
  color: #94a3b8;
  font-size: 0.9rem;
  text-transform: uppercase;
}

/* Range Selector Styles */
.chapter-range-selector {
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(10, 17, 27, 0.74);
  padding: 10px 15px;
  border-radius: 12px;
  border: 1px solid rgba(120, 144, 168, 0.2);
}

.range-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #94a3b8;
}

.range-select {
  background: #0f172a;
  color: #cae0ef;
  border: 1px solid rgba(120, 144, 168, 0.32);
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  transition: all 0.3s;
}

.range-select:focus {
  border-color: rgba(120, 144, 168, 0.5);
  box-shadow: none;
}

/* ===== TỐI ƯU MOBILE ===== */
@media (max-width: 768px) {
  .detail-container {
    padding: 14px 12px 80px;
  }
  .story-hero-section {
    padding: 16px;
    border-radius: 20px;
  }
  .hero-content {
    display: grid;
    grid-template-columns: 82px minmax(0, 1fr);
    grid-template-areas:
      "cover title"
      "cover meta"
      "stats stats"
      "actions actions"
      "rating rating";
    column-gap: 11px;
    row-gap: 10px;
    align-items: start;
  }
  .cover-wrapper {
    grid-area: cover;
    width: 82px;
    height: 116px;
    max-width: none;
    aspect-ratio: auto;
    border-radius: 12px;
    margin: 0;
    box-shadow: 0 10px 20px rgba(4, 10, 18, 0.32);
  }
  .status-sigil-detail {
    display: none;
  }
  .info-content {
    display: contents;
    max-width: none;
  }
  .story-title-main {
    grid-area: title;
    font-size: clamp(1.02rem, 4vw, 1.26rem);
    margin: 0;
    line-height: 1.28;
    width: 100%;
    max-width: none;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    align-self: end;
    text-align: left;
    text-wrap: wrap;
    overflow-wrap: normal;
    word-break: normal;
  }
  .meta-row {
    grid-area: meta;
    justify-content: flex-start;
    margin: 0;
    gap: 6px;
    font-size: 0.76rem;
    align-self: start;
  }
  .author-link,
  .genre-tags {
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 0.74rem;
    gap: 5px;
  }
  .genre-tags i {
    display: none;
  }
  .status-sigil-inline-mobile {
    display: inline-flex;
    padding: 4px 8px;
    font-size: 0.62rem;
    gap: 5px;
  }
  .status-sigil-inline-mobile i {
    font-size: 0.66rem;
  }
  .stats-grid {
    grid-area: stats;
    width: 100%;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin: 4px 0 0;
  }
  .stat-box {
    padding: 9px 6px;
    border-radius: 10px;
  }
  .stat-box .value {
    font-size: 1rem;
  }
  .stat-box .label {
    font-size: 0.56rem;
    letter-spacing: 0.03em;
  }
  .actions-row {
    grid-area: actions;
    width: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    margin-bottom: 0;
    align-items: stretch;
  }
  .btn-primary {
    justify-content: center;
    min-height: 44px;
    padding: 0 14px;
    font-size: 0.82rem;
  }
  .secondary-actions {
    display: flex;
    gap: 8px;
    width: auto;
    flex-shrink: 0;
  }
  .btn-action-spirit {
    width: 44px;
    height: 44px;
    padding: 0;
    justify-content: center;
    border-radius: 12px;
  }
  .btn-action-spirit span {
    display: none;
  }
  .btn-action-spirit i {
    font-size: 1rem;
  }
  .rating-input-box {
    grid-area: rating;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding-top: 12px;
  }
  .tabs-nav-clean {
    gap: 8px;
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 8px;
    margin-bottom: 14px;
    scrollbar-width: none;
  }
  .tabs-nav-clean::-webkit-scrollbar {
    display: none;
  }
  .tab-item {
    font-size: 0.76rem;
    padding: 8px 12px;
    flex-shrink: 0;
  }
  .content-panel {
    padding: 16px;
    border-radius: 18px;
  }
  .panel-title {
    font-size: 1rem;
  }

  .panel-title-row {
    align-items: center;
  }
  .description-text {
    font-size: 0.92rem;
    line-height: 1.72;
  }
  .panel-header-row {
    flex-direction: column;
    flex-wrap: wrap;
    gap: 8px;
    padding-bottom: 12px;
    align-items: stretch;
    justify-content: flex-start;
  }
  .chapter-range-selector {
    margin-bottom: 0;
    padding: 8px 10px;
    width: 100%;
    min-width: 0;
    justify-content: space-between;
    order: 1;
  }
  .range-select {
    flex: 1;
    font-size: 0.82rem;
    padding: 4px 8px;
    border-radius: 6px;
  }
  .btn-sort-spirit {
    width: 100%;
    justify-content: center;
    padding: 10px 14px;
    order: 2;
    height: 42px;
  }
  .chapter-grid {
    grid-template-columns: 1fr;
  }
  .chapter-item {
    padding: 12px;
  }
  /* Ensure space for select dropdown */
  .chapters {
    padding-bottom: 90px;
  }
  .btn-primary,
  .btn-action-spirit,
  .tab-item,
  .btn-sort-spirit,
  .chapter-item,
  .page-btn {
    touch-action: manipulation;
  }
}

@media (max-width: 420px) {
  .hero-content {
    grid-template-columns: 74px minmax(0, 1fr);
  }
  .cover-wrapper {
    width: 74px;
    height: 106px;
  }
  .story-title-main {
    font-size: 0.98rem;
  }
  .meta-row {
    font-size: 0.72rem;
  }
  .actions-row {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 6px;
  }
  .btn-primary {
    min-width: 0;
    padding: 0 10px;
    font-size: 0.74rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .secondary-actions {
    width: auto;
    justify-content: flex-start;
    gap: 6px;
  }
  .btn-action-spirit {
    width: 40px;
    height: 40px;
  }
  .btn-action-spirit i {
    font-size: 0.92rem;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
</style>
