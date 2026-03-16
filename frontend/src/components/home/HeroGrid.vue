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
          <router-link to="/truyen-tranh" class="spirit-btn-sm dark-glass">
            <div class="btn-aura-sm"></div>
            <span class="btn-inner-sm">TRUYỆN TRANH</span>
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
  margin-bottom: 40px;
  font-family: "Be Vietnam Pro", sans-serif;
  align-items: stretch;
}

/* Nền kính mờ (Đồng bộ Tinh Trần Hư Không) */
.cosmic-glass {
  background: rgba(2, 6, 23, 0.85);
  border: 1px solid rgba(34, 211, 238, 0.2);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(34, 211, 238, 0.05);
}

.main-highlight {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (hover: hover) {
  .main-highlight:hover {
    transform: translateY(-4px);
    border-color: rgba(34, 211, 238, 0.4);
    box-shadow:
      0 25px 50px rgba(34, 211, 238, 0.15),
      inset 0 0 20px rgba(34, 211, 238, 0.1);
  }

  .main-highlight:hover .book-cover-3d {
    transform: perspective(1000px) rotateY(-5deg) scale(1.05);
    box-shadow:
      -20px 20px 40px rgba(0, 0, 0, 0.8),
      0 0 50px rgba(34, 211, 238, 0.4);
  }
  
  .main-highlight:hover .book-glow-aura {
    opacity: 1;
    transform: scale(1.1);
  }
}

.highlight-content {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 40px 50px;
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
  filter: blur(45px) brightness(0.4) saturate(1.2);
  z-index: 1;
  transform: scale(1.1);
}

.overlay-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(90deg, rgba(2, 6, 23, 0.95) 0%, rgba(2, 6, 23, 0.8) 50%, transparent 100%);
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
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.2);
}

.main-title {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1.2;
  margin-bottom: 16px;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 10px rgba(34, 211, 238, 0.3));
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
  color: #cbd5e1; line-height: 1.7; margin-bottom: 35px; font-size: 1.05rem;
  display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical;
  overflow: hidden; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

/* Nút Action */
.actions { display: flex; gap: 16px; }

.btn-cultivate-now {
  background: linear-gradient(135deg, #0ea5e9, #22d3ee);
  color: #020617;
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex; align-items: center; gap: 8px;
  transition: all 0.3s; cursor: pointer;
  box-shadow: 0 6px 20px rgba(34, 211, 238, 0.3);
  border: 1px solid rgba(255,255,255,0.3);
}

.btn-cultivate-now:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(34, 211, 238, 0.6);
  background: linear-gradient(135deg, #38bdf8, #7dd3fc);
}

.btn-info-glass {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e2e8f0;
  padding: 12px 28px;
  border-radius: 12px;
  font-weight: 700;
  backdrop-filter: blur(10px);
  transition: all 0.3s; cursor: pointer;
}

.btn-info-glass:hover {
  background: rgba(34, 211, 238, 0.1);
  border-color: rgba(34, 211, 238, 0.4);
  color: #22d3ee;
  box-shadow: 0 0 15px rgba(34, 211, 238, 0.2);
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
  box-shadow: -15px 15px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(34, 211, 238, 0.2);
  transform: perspective(1000px) rotateY(-15deg);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative; z-index: 2;
}

.book-glow-aura {
  position: absolute; inset: -20px; background: radial-gradient(circle, rgba(34, 211, 238, 0.4) 0%, transparent 70%);
  filter: blur(20px); opacity: 0; transition: all 0.5s; z-index: 1;
}

/* Chat Board Sidebar */
.side-trending {
  background: rgba(2, 6, 23, 0.75);
  border-radius: 20px;
  padding: 24px 20px;
  border: 1px solid rgba(34, 211, 238, 0.15); 
  display: flex; flex-direction: column;
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
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
