<template>
  <div class="hero-grid-container" v-if="stories.length > 0">
    <div class="hero-mobile-static mobile-only">
      <div class="mobile-bg-wrapper">
        <img
          src="https://res.cloudinary.com/dg9ftuhv4/image/upload/f_auto,q_auto,w_800/v1772805142/truyenviethay/banners/banner-mobile.png"
          alt="Truyện Việt Hay Banner"
          class="mobile-bg-img"
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
          <router-link to="/truyen-chu" class="spirit-btn-sm cyan">
            <div class="btn-aura-sm"></div>
            <span class="btn-inner-sm">TRUYỆN CHỮ</span>
          </router-link>
          <router-link to="/truyen-audio" class="spirit-btn-sm dark-glass">
            <div class="btn-aura-sm"></div>
            <span class="btn-inner-sm">TRUYỆN AUDIO</span>
          </router-link>
        </div>
      </div>
    </div>

    <div class="main-highlight desktop-only">
      <transition name="fade" mode="out-in">
        <div class="highlight-content cosmic-glass" :key="mainStory.id || 'default'">
          <img
            :src="getImageUrl(mainStory.anh_bia)"
            class="main-cover-bg"
            alt="Background"
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
              :src="getImageUrl(mainStory.anh_bia)"
              :alt="mainStory.ten_truyen"
              class="book-cover-3d"
            />
            <div class="book-glow-aura"></div>
          </div>
          </div>
        </transition>
    </div>

    <div class="side-trending desktop-only">
      <HomeChatBoard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { getImageUrl } from "@/config/constants";
import HomeChatBoard from "./HomeChatBoard.vue";

const router = useRouter();

const navigateToStory = (slug: string) => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  router.push(`/truyen-chu/${slug}`);
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
  intervalId = setInterval(() => {
    if (props.stories && props.stories.length > 1) {
      const maxItems = Math.min(5, props.stories.length);
      currentIndex.value = (currentIndex.value + 1) % maxItems;
    }
  }, 6000); // Kéo dài thời gian xem banner một chút cho người dùng kịp đọc
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

const mainStory = computed(() => props.stories[currentIndex.value] || {});

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
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  height: 480px;
  margin-bottom: 32px;
  font-family: "Be Vietnam Pro", sans-serif;
  align-items: stretch;
}

/* Nền kính mờ (Đồng bộ Tinh Trần Hư Không) */
.cosmic-glass {
  background: rgba(18, 26, 39, 0.9);
  border: 1px solid var(--app-border);
  box-shadow: var(--app-shadow-2);
}

.main-highlight {
  position: relative;
  border-radius: var(--app-radius-lg);
  overflow: hidden;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

@media (hover: hover) {
  .main-highlight:hover {
    transform: translateY(-3px);
    border-color: var(--app-border-accent);
    box-shadow: var(--app-shadow-3);
  }

  .main-highlight:hover .book-cover-3d {
    transform: perspective(1000px) rotateY(-5deg) scale(1.03);
    box-shadow: -18px 18px 34px rgba(3, 8, 18, 0.45);
  }
  
  .main-highlight:hover .book-glow-aura { opacity: 0.5; transform: scale(1.03); }
}

.highlight-content {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 42px 46px;
  display: flex;
  align-items: center;
  border-radius: inherit;
}

/* Nền ảnh mờ */
.main-cover-bg {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: top center;
  filter: blur(22px) brightness(0.48) saturate(1.02);
  z-index: 1;
  transform: scale(1.1);
}

.overlay-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(90deg, rgba(12, 18, 29, 0.92) 0%, rgba(12, 18, 29, 0.8) 54%, rgba(12, 18, 29, 0.18) 100%);
  z-index: 2;
}

/* Thông tin Text */
.highlight-info {
  position: relative;
  z-index: 10;
  max-width: 60%;
  color: white;
}

.badge-divine {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.4);
  color: #fbbf24;
  padding: 6px 16px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 900;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: none;
}

.main-title {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1.2;
  margin-bottom: 16px;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: none;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.main-meta {
  display: flex; align-items: center; gap: 20px;
  color: #94a3b8; margin-bottom: 24px; font-size: 0.95rem; font-weight: 600;
}
.main-meta i { color: #22d3ee; } 

.main-summary {
  color: var(--app-text-muted); line-height: 1.8; margin-bottom: 35px; font-size: 1rem;
  display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Nút Action */
.actions { display: flex; gap: 16px; }

.btn-cultivate-now {
  background: linear-gradient(135deg, #4db8dc, #76daf0);
  color: #08111a;
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex; align-items: center; gap: 8px;
  transition: all 0.3s; cursor: pointer;
  box-shadow: 0 10px 22px rgba(4, 10, 20, 0.22);
  border: 1px solid rgba(255,255,255,0.3);
}

.btn-cultivate-now:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(4, 10, 20, 0.26);
  background: linear-gradient(135deg, #66cbe8, #88dff3);
}

.btn-info-glass {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--app-border);
  color: #e2e8f0;
  padding: 12px 28px;
  border-radius: 12px;
  font-weight: 700;
  backdrop-filter: none;
  transition: all 0.3s; cursor: pointer;
}

.btn-info-glass:hover {
  background: rgba(91, 196, 232, 0.08);
  border-color: var(--app-border-accent);
  color: var(--app-accent);
  box-shadow: none;
}

/* Sách 3D */
.floating-cover {
  position: absolute; right: 50px; top: 50%; transform: translateY(-50%);
  z-index: 10; width: 220px; height: 330px;
}

.book-cover-3d {
  width: 100%; height: 100%; object-fit: cover; 
  object-position: top center;
  border-radius: 12px;
  box-shadow: -15px 15px 30px rgba(3, 8, 18, 0.45);
  transform: perspective(1000px) rotateY(-15deg);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative; z-index: 2;
}

.book-glow-aura {
  position: absolute; inset: -12px; background: radial-gradient(circle, rgba(91, 196, 232, 0.14) 0%, transparent 70%);
  filter: blur(12px); opacity: 0; transition: all 0.35s ease; z-index: 1;
}

/* Chat Board Sidebar */
.side-trending {
  background: rgba(18, 26, 39, 0.82);
  border-radius: var(--app-radius-lg);
  padding: 24px 20px;
  border: 1px solid var(--app-border); 
  display: flex; flex-direction: column;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: var(--app-shadow-2);
  height: 100%; box-sizing: border-box;
  min-height: 0;
  overflow: hidden;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* =========================================
   RESPONSIVE (MOBILE & TABLET)
   ========================================= */
.hero-mobile-static { display: none; }

@media (max-width: 1024px) {
  .hero-grid-container { height: auto; grid-template-columns: 1fr; margin-bottom: 32px; }
  .desktop-only { display: none !important; }

  /* VÙNG MOBILE BANNER */
  .hero-mobile-static {
    position: relative; width: 100vw; height: 60vh; left: -12px; 
    display: flex; flex-direction: column; justify-content: flex-end; overflow: hidden;
  }

  @media (max-width: 640px) {
    .hero-mobile-static { left: 0; margin-left: -12px; margin-right: -12px; width: calc(100% + 24px); }
  }

  .mobile-bg-wrapper { position: absolute; inset: 0; z-index: 1; }
  
  .mobile-bg-img {
    width: 100%; height: 100%; object-fit: cover; object-position: center top;
    animation: slow-pan 20s ease-in-out infinite alternate;
  }
  
  .mobile-vignette {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, rgba(2, 6, 23, 0.1) 0%, rgba(2, 6, 23, 0.6) 50%, #020617 100%);
  }

  .mobile-content-wrapper { position: relative; z-index: 10; padding: 20px 20px 45px; text-align: center; }

  .grand-title-mobile {
    font-family: "Spectral", serif; font-size: 3.2rem; font-weight: 900; line-height: 1; margin-bottom: 15px;
    display: flex; flex-direction: column; gap: 8px; letter-spacing: 2px;
  }

  .title-line { display: flex; justify-content: center; gap: 10px; }
  
  .word-glow { color: #fff; text-shadow: 0 0 15px rgba(255, 255, 255, 0.5), 0 4px 10px rgba(0, 0, 0, 0.8); }
  
  /* Đổi hiệu ứng chữ trên Mobile thành Cyan */
  .word-glow-cyan {
    color: #22d3ee;
    animation: aura-pulse-cyan 3s infinite ease-in-out;
    text-shadow: 0 0 5px #22d3ee, 0 0 20px rgba(34, 211, 238, 0.6), 0 4px 10px rgba(0, 0, 0, 0.9);
  }

  .slogan-mobile {
    font-family: "Cinzel", serif; font-size: 0.75rem; color: #e2e8f0; letter-spacing: 2px;
    margin-bottom: 30px; font-weight: 700;
    text-shadow: 0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.8);
    background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.2), transparent);
    padding: 6px 0; border-top: 1px solid rgba(34, 211, 238, 0.2); border-bottom: 1px solid rgba(34, 211, 238, 0.2);
  }

  .action-buttons-mobile { display: flex; justify-content: center; gap: 16px; width: 100%; padding: 0 10px; }

  .spirit-btn-sm {
    position: relative; flex: 1; padding: 14px 0; text-decoration: none;
    border-radius: 16px 4px 16px 4px; overflow: hidden; transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 4px 15px rgba(0,0,0,0.4);
  }
  
  .spirit-btn-sm:active { transform: scale(0.96); filter: brightness(1.2); }

  .btn-inner-sm {
    position: relative; z-index: 2; color: #020617; font-weight: 900; font-size: 0.85rem; letter-spacing: 1px;
  }
  
  .btn-aura-sm { position: absolute; inset: 0; z-index: 1; opacity: 0.9; }

  /* Đổi nút Mobile sang Băng Lam */
  .spirit-btn-sm.cyan { border-color: rgba(34, 211, 238, 0.5); box-shadow: 0 4px 20px rgba(34, 211, 238, 0.25); }
  .spirit-btn-sm.cyan .btn-aura-sm { background: linear-gradient(135deg, #0ea5e9, #22d3ee); }
  
  /* Nút phụ kính mờ */
  .spirit-btn-sm.dark-glass { border-color: rgba(255, 255, 255, 0.2); background: rgba(15, 23, 42, 0.6); }
  .spirit-btn-sm.dark-glass .btn-inner-sm { color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
  .spirit-btn-sm.dark-glass .btn-aura-sm { background: transparent; backdrop-filter: blur(8px); }
}

/* ===== ANIMATIONS ===== */
@keyframes slow-pan {
  0% { transform: scale(1); object-position: center top; }
  100% { transform: scale(1.15); object-position: center bottom; }
}

@keyframes aura-pulse-cyan {
  0%, 100% { filter: brightness(100%) drop-shadow(0 0 2px #22d3ee); }
  50% { filter: brightness(130%) drop-shadow(0 0 12px #22d3ee); }
}

/* ===== ANIMATIONS ===== */
@keyframes slow-pan {
  0% { transform: scale(1); object-position: center top; }
  100% { transform: scale(1.15); object-position: center bottom; }
}

@keyframes aura-pulse-cyan {
  0%, 100% { filter: brightness(100%) drop-shadow(0 0 2px #22d3ee); }
  50% { filter: brightness(130%) drop-shadow(0 0 12px #22d3ee); }
}
</style>
