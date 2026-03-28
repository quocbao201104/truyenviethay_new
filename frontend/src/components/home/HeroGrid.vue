<template>
  <div class="hero-grid-container" v-if="stories.length > 0">
    <div v-if="isMobileViewport" class="hero-mobile-static">
      <div class="mobile-bg-wrapper">
        <img
          :src="mobileBannerImage"
          :srcset="mobileBannerSrcSet"
          sizes="100vw"
          alt="Truyện Việt Hay Banner"
          class="mobile-bg-img"
          loading="eager"
          decoding="async"
          fetchpriority="high"
        />
        <div class="mobile-vignette"></div>
      </div>

      <div class="mobile-content-wrapper">
        <h1 class="grand-title-mobile">
          <div class="title-line">
            <span class="word-glow"> KHÁM PHÁ </span>
          </div>
          <div class="title-line">
            <span class="word-glow-cyan">THIÊN THƯ</span>
          </div>
        </h1>

        <p class="slogan-mobile">VẠN GIỚI KHAI MỞ - TIÊN LỮ THÔNG THIÊN</p>

        <div class="action-buttons-mobile">
          <router-link to="/truyen-chu" class="spirit-btn-sm cyan" @mouseenter="warmStoryList" @focusin="warmStoryList" @touchstart.passive="warmStoryList">
            <div class="btn-aura-sm"></div>
            <span class="btn-inner-sm">TRUYỆN CHỮ</span>
          </router-link>
          <router-link to="/truyen-audio" class="spirit-btn-sm dark-glass" @mouseenter="warmAudioList" @focusin="warmAudioList" @touchstart.passive="warmAudioList">
            <div class="btn-aura-sm"></div>
            <span class="btn-inner-sm">TRUYỆN AUDIO</span>
          </router-link>
        </div>
      </div>
    </div>

    <div v-else class="main-highlight">
      <transition name="fade" mode="out-in">
        <div
          class="highlight-content cosmic-glass"
          :key="mainStory.id || 'default'"
          @mouseenter="warmCurrentStory"
          @focusin="warmCurrentStory"
        >
          <img
            :src="getStoryCoverUrl(mainStory.anh_bia, 1280)"
            :srcset="getStoryCoverSrcSet(mainStory.anh_bia, [640, 960, 1280, 1600])"
            sizes="(max-width: 1600px) 66vw, 960px"
            class="main-cover-bg"
            alt="Background"
            loading="eager"
            decoding="async"
            fetchpriority="high"
            @error="handleImageError"
          />
          <div class="overlay-gradient"></div>

          <div class="highlight-info">
            <span class="badge-divine">
              <i class="fas fa-fire-flame-curved"></i> Tuyệt Thế Bí Tịch
            </span>
            <h2 class="main-title">{{ mainStory.ten_truyen }}</h2>
            <div class="main-meta">
              <span class="author">
                <i class="fas fa-feather-pointed"></i>
                {{ mainStory.tac_gia || "Ẩn Danh Đạo Nhân" }}
              </span>
              <span class="stats">
                <i class="fas fa-eye"></i>
                {{ formatNumber(mainStory.luot_xem) }}
              </span>
            </div>
            <p class="main-summary">{{ truncateText(mainStory.mo_ta, 150) }}</p>

            <div class="actions">
              <div
                @click="navigateToStory(mainStory.slug)"
                class="btn-cultivate-now"
                role="link"
                tabindex="0"
              >
                LĨNH HỘI <i class="fas fa-bolt-lightning ml-1"></i>
              </div>
              <div
                @click="navigateToStory(mainStory.slug)"
                class="btn-info-glass"
                role="link"
                tabindex="0"
              >
                <i class="fas fa-scroll mr-1"></i> Tra Cứu
              </div>
            </div>
          </div>

          <div class="floating-cover">
            <img
              :src="getStoryCoverUrl(mainStory.anh_bia, 420)"
              :srcset="getStoryCoverSrcSet(mainStory.anh_bia, [320, 420, 640])"
              sizes="280px"
              :alt="mainStory.ten_truyen"
              class="book-cover-3d"
              decoding="async"
              @error="handleImageError"
            />
            <div class="book-glow-aura"></div>
          </div>
        </div>
      </transition>
    </div>

    <div v-if="!isMobileViewport" class="side-trending">
      <HomeChatBoard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import {
  DEFAULT_STORY_COVER_URL,
  getStoryCoverUrl,
  getStoryCoverSrcSet,
  buildCloudinaryImageUrl,
  buildCloudinarySrcSet,
} from "@/config/constants";
import {
  prefetchAudioListExperience,
  prefetchStoryDetailExperience,
  prefetchStoryListExperience,
} from "@/router/prefetch";
import HomeChatBoard from "./HomeChatBoard.vue";

const router = useRouter();
const isMobileViewport = ref(
  typeof window !== "undefined"
    ? window.matchMedia("(max-width: 1024px)").matches
    : false,
);
const MOBILE_HERO_BANNER =
  "https://res.cloudinary.com/dg9ftuhv4/image/upload/v1772805142/truyenviethay/banners/banner-mobile.png";
const mobileBannerImage = buildCloudinaryImageUrl(MOBILE_HERO_BANNER, {
  width: 640,
  quality: "auto:eco",
  dprAuto: true,
});
const mobileBannerSrcSet = buildCloudinarySrcSet(
  MOBILE_HERO_BANNER,
  [360, 480, 640, 800],
  { quality: "auto:eco", dprAuto: true },
);
let viewportMediaQuery: MediaQueryList | null = null;
let viewportListener: ((event: MediaQueryListEvent) => void) | null = null;

const navigateToStory = (slug: string) => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  router.push(`/truyen-chu/${slug}`);
};

const warmStoryList = () => {
  prefetchStoryListExperience();
};

const warmAudioList = () => {
  prefetchAudioListExperience();
};

const props = defineProps({
  stories: {
    type: Array as () => readonly any[],
    required: true,
    default: () => [],
  },
  trendingStories: {
    type: Array as () => readonly any[],
    required: false,
    default: () => [],
  },
});

const currentIndex = ref(0);
let intervalId: any = null;

onMounted(() => {
  viewportMediaQuery = window.matchMedia("(max-width: 1024px)");
  isMobileViewport.value = viewportMediaQuery.matches;
  viewportListener = (event: MediaQueryListEvent) => {
    isMobileViewport.value = event.matches;
  };
  if (viewportMediaQuery.addEventListener) {
    viewportMediaQuery.addEventListener("change", viewportListener);
  } else {
    viewportMediaQuery.addListener(viewportListener);
  }

  intervalId = setInterval(() => {
    if (props.stories && props.stories.length > 1) {
      const maxItems = Math.min(5, props.stories.length);
      currentIndex.value = (currentIndex.value + 1) % maxItems;
    }
  }, 6000); // Kéo dài thời gian xem banner một chút cho người dùng kịp đọc
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
  if (viewportMediaQuery && viewportListener) {
    if (viewportMediaQuery.removeEventListener) {
      viewportMediaQuery.removeEventListener("change", viewportListener);
    } else {
      viewportMediaQuery.removeListener(viewportListener);
    }
  }
});

const mainStory = computed(() => props.stories[currentIndex.value] || {});

const warmCurrentStory = () => {
  prefetchStoryDetailExperience(mainStory.value?.slug);
};

const handleImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = DEFAULT_STORY_COVER_URL;
};

const formatNumber = (num: number) => {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const truncateText = (text: string, length: number) => {
  if (!text) return "";
  return text.length > length ? text.substring(0, length) + "..." : text;
};
</script>

<style scoped>
/* ===== CORE LAYOUT ===== */
.hero-grid-container {
  --hero-premium-surface: rgba(14, 24, 38, 0.82);
  --hero-premium-border: rgba(124, 147, 170, 0.2);
  --hero-premium-gold: #d4b377;
  --hero-premium-jade: #63dcc5;
  --hero-premium-text: #f5f8ff;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  height: 500px;
  margin-bottom: 20px;
  font-family: "Be Vietnam Pro", sans-serif;
  align-items: stretch;
}

/* Nền kính mờ (Đồng bộ Tinh Trần Hư Không) */
.cosmic-glass {
  background: var(--hero-premium-surface);
  border: 1px solid var(--hero-premium-border);
  box-shadow: 0 24px 48px rgba(3, 8, 18, 0.32);
}

.main-highlight {
  position: relative;
  border-radius: 26px;
  border: 1px solid var(--hero-premium-border);
  overflow: hidden;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

@media (hover: hover) {
  .main-highlight:hover {
    transform: translateY(-3px);
    border-color: rgba(99, 220, 197, 0.36);
    box-shadow: 0 28px 60px rgba(3, 8, 18, 0.4);
  }

  .main-highlight:hover .book-cover-3d {
    transform: perspective(1000px) rotateY(-5deg) scale(1.03);
    box-shadow: -18px 18px 34px rgba(3, 8, 18, 0.45);
  }

  .main-highlight:hover .book-glow-aura {
    opacity: 0.5;
    transform: scale(1.03);
  }
}

.highlight-content {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 38px 42px;
  display: flex;
  align-items: center;
  border-radius: inherit;
}

/* Nền ảnh mờ */
.main-cover-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  filter: blur(18px) brightness(0.42) saturate(1.05);
  z-index: 1;
  transform: scale(1.1);
}

.overlay-gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      circle at 12% 40%,
      rgba(99, 220, 197, 0.1),
      transparent 32%
    ),
    linear-gradient(
      90deg,
      rgba(10, 16, 26, 0.95) 0%,
      rgba(10, 16, 26, 0.82) 52%,
      rgba(10, 16, 26, 0.26) 100%
    );
  z-index: 2;
}

/* Thông tin Text */
.highlight-info {
  position: relative;
  z-index: 10;
  max-width: min(58%, 620px);
  color: var(--hero-premium-text);
}

.badge-divine {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(12, 20, 33, 0.78);
  border: 1px solid rgba(212, 179, 119, 0.44);
  color: #f4d48f;
  padding: 6px 16px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 900;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.main-title {
  font-size: clamp(2.1rem, 2.8vw, 3rem);
  font-weight: 800;
  line-height: 1.18;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #ffffff 24%, #cae9f3 92%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.015em;
  text-wrap: balance;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.main-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  color: #9fb4c7;
  margin-bottom: 18px;
  font-size: 0.95rem;
  font-weight: 700;
}
.main-meta i {
  color: #5ddac3;
}

.main-summary {
  color: #b8cad9;
  line-height: 1.72;
  margin-bottom: 26px;
  font-size: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Nút Action */
.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-cultivate-now {
  background: linear-gradient(135deg, #62dcc4, #8fe8f5);
  color: #08111a;
  padding: 12px 24px;
  border-radius: 999px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(4, 10, 20, 0.28);
  border: 1px solid rgba(143, 232, 247, 0.34);
}

.btn-cultivate-now:hover {
  transform: translateY(-1px) scale(1.01);
  box-shadow: 0 14px 28px rgba(4, 10, 20, 0.32);
  background: linear-gradient(135deg, #71e0ca, #9cecf8);
}

.btn-info-glass {
  background: rgba(10, 17, 27, 0.72);
  border: 1px solid rgba(124, 147, 170, 0.28);
  color: #dce8f4;
  padding: 12px 22px;
  border-radius: 16px;
  font-weight: 700;
  backdrop-filter: blur(8px);
  transition: all 0.3s;
  cursor: pointer;
}

.btn-info-glass:hover {
  background: rgba(99, 220, 197, 0.14);
  border-color: rgba(99, 220, 197, 0.34);
  color: #ebf9ff;
  transform: translateY(-1px);
}

/* Sách 3D */
.floating-cover {
  position: absolute;
  right: 46px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 236px;
  height: 340px;
}

.book-cover-3d {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  border-radius: 18px;
  box-shadow: -15px 15px 30px rgba(3, 8, 18, 0.45);
  transform: perspective(1000px) rotateY(-15deg);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
}

.book-glow-aura {
  position: absolute;
  inset: -12px;
  background: radial-gradient(
    circle,
    rgba(99, 220, 197, 0.18) 0%,
    transparent 72%
  );
  filter: blur(12px);
  opacity: 0;
  transition: all 0.35s ease;
  z-index: 1;
}

/* Chat Board Sidebar */
.side-trending {
  background: linear-gradient(
    180deg,
    rgba(15, 24, 37, 0.86),
    rgba(14, 22, 34, 0.92)
  );
  border-radius: 24px;
  padding: 24px 20px;
  border: 1px solid var(--hero-premium-border);
  display: flex;
  flex-direction: column;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: 0 20px 42px rgba(3, 8, 18, 0.28);
  height: 100%;
  box-sizing: border-box;
  min-height: 0;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* =========================================
   RESPONSIVE (MOBILE & TABLET)
   ========================================= */
.hero-mobile-static {
  display: none;
}

@media (max-width: 1024px) {
  .hero-grid-container {
    height: auto;
    grid-template-columns: 1fr;
    margin-bottom: 8px;
  }
  .desktop-only {
    display: none !important;
  }

  .hero-mobile-static {
    position: relative;
    width: 100%;
    left: 0;
    min-height: 380px;
    height: clamp(380px, 56vh, 520px);
    display: grid;
    align-items: end;
    overflow: hidden;
    border-radius: 20px;
    border: 1px solid rgba(124, 147, 170, 0.24);
    box-shadow: 0 18px 36px rgba(2, 6, 16, 0.36);
  }

  .mobile-bg-wrapper {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .mobile-bg-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    animation: slow-pan 20s ease-in-out infinite alternate;
  }

  .mobile-vignette {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(
        180deg,
        rgba(5, 10, 17, 0.14) 0%,
        rgba(5, 10, 17, 0.58) 58%,
        rgba(5, 10, 17, 0.92) 100%
      ),
      radial-gradient(
        circle at 50% 24%,
        rgba(99, 220, 197, 0.14),
        transparent 42%
      );
  }

  .mobile-content-wrapper {
    position: relative;
    z-index: 10;
    padding: 16px 16px 24px;
    text-align: center;
  }

  .grand-title-mobile {
    font-family: "Cinzel Decorative", "Cinzel", serif;
    font-size: clamp(2.15rem, 7.8vw, 3rem);
    font-weight: 800;
    line-height: 1.04;
    margin-bottom: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    transform: translateY(-3px);
  }

  .title-line {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
  }

  .title-line + .title-line {
    margin-top: 4px;
  }

  .word-glow {
    display: inline-block;
    color: #fefefe;
    letter-spacing: 0.05em;
    text-shadow:
      0 1px 0 rgba(255, 255, 255, 0.42),
      0 0 16px rgba(255, 255, 255, 0.34),
      0 6px 16px rgba(0, 0, 0, 0.78);
  }

  /* Đổi hiệu ứng chữ trên Mobile thành Cyan */
  .word-glow-cyan {
    display: inline-block;
    background: linear-gradient(180deg, #b9fff1 0%, #61dcc4 36%, #1ec8e7 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 0.07em;
    animation: aura-pulse-cyan 3s infinite ease-in-out;
    text-shadow:
      0 0 6px rgba(99, 220, 197, 0.72),
      0 0 26px rgba(30, 200, 231, 0.5),
      0 6px 14px rgba(0, 0, 0, 0.84);
  }

  .slogan-mobile {
    font-size: 0.68rem;
    color: #dbe6f3;
    letter-spacing: 0.16em;
    margin-bottom: 14px;
    font-weight: 700;
    text-shadow:
      0 2px 4px rgba(0, 0, 0, 0.9),
      0 0 10px rgba(0, 0, 0, 0.8);
    background: linear-gradient(
      90deg,
      transparent,
      rgba(99, 220, 197, 0.18),
      transparent
    );
    padding: 6px 0;
    border-top: 1px solid rgba(99, 220, 197, 0.2);
    border-bottom: 1px solid rgba(99, 220, 197, 0.2);
  }

  .action-buttons-mobile {
    display: flex;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 0;
  }

  .spirit-btn-sm {
    position: relative;
    flex: 1;
    padding: 12px 0;
    text-decoration: none;
    border-radius: 14px;
    overflow: hidden;
    transition: all 0.25s ease;
    border: 1px solid rgba(124, 147, 170, 0.28);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  }

  .spirit-btn-sm:active {
    transform: scale(0.96);
    filter: brightness(1.2);
  }

  .btn-inner-sm {
    position: relative;
    z-index: 2;
    color: #020617;
    font-weight: 800;
    font-size: 0.84rem;
    letter-spacing: 0.04em;
  }

  .btn-aura-sm {
    position: absolute;
    inset: 0;
    z-index: 1;
    opacity: 0.9;
  }

  /* Đổi nút Mobile sang Băng Lam */
  .spirit-btn-sm.cyan {
    border-color: rgba(99, 220, 197, 0.5);
    box-shadow: 0 4px 20px rgba(99, 220, 197, 0.26);
  }
  .spirit-btn-sm.cyan .btn-aura-sm {
    background: linear-gradient(135deg, #4db8dc, #61dcc4);
  }

  /* Nút phụ kính mờ */
  .spirit-btn-sm.dark-glass {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(15, 23, 42, 0.6);
  }
  .spirit-btn-sm.dark-glass .btn-inner-sm {
    color: #fff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }
  .spirit-btn-sm.dark-glass .btn-aura-sm {
    background: transparent;
    backdrop-filter: blur(8px);
  }
}

@media (max-width: 640px) {
  .hero-grid-container {
    margin-bottom: 4px;
  }

  .hero-mobile-static {
    min-height: 330px;
    height: clamp(330px, 54vh, 460px);
    border-radius: 16px;
  }

  .mobile-content-wrapper {
    padding: 12px 12px 16px;
  }

  .grand-title-mobile {
    font-size: clamp(1.9rem, 8vw, 2.5rem);
    line-height: 1.02;
    gap: 6px;
    margin-bottom: 10px;
    letter-spacing: 0.06em;
    transform: translateY(-2px);
  }

  .title-line + .title-line {
    margin-top: 2px;
  }

  .slogan-mobile {
    font-size: 0.62rem;
    margin-bottom: 10px;
    padding: 5px 0;
  }

  .action-buttons-mobile {
    gap: 8px;
  }

  .spirit-btn-sm {
    padding: 11px 0;
    border-radius: 12px;
  }

  .btn-inner-sm {
    font-size: 0.78rem;
  }
}

/* ===== ANIMATIONS ===== */
@keyframes slow-pan {
  0% {
    transform: scale(1);
    object-position: center top;
  }
  100% {
    transform: scale(1.15);
    object-position: center bottom;
  }
}

@keyframes aura-pulse-cyan {
  0%,
  100% {
    filter: brightness(100%) drop-shadow(0 0 2px #61dcc4);
  }
  50% {
    filter: brightness(130%) drop-shadow(0 0 12px #61dcc4);
  }
}
</style>
