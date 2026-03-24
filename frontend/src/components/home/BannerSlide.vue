<template>
  <div class="banner-slide-aura desktop-only" :class="{ active: isActive }">
    <!-- Background Layer with Blur -->
    <div class="slide-cosmic-bg">
      <div class="cover-cosmic-wrapper">
        <img
          :src="coverBackgroundUrl"
          :srcset="coverBackgroundSrcSet"
          sizes="100vw"
          class="cover-bg-aura"
          alt="Background"
          decoding="async"
        />
      </div>
      <div class="cosmic-overlay-radial"></div>
    </div>

    <!-- Main Content Grid -->
    <div class="content-spirit-grid">
      <!-- Left: Book Info -->
      <div class="info-spirit-wrapper">
        <div class="badge-divine animate-pulse-slow">
          <i class="fas fa-crown text-[10px] mr-1"></i> Tuyệt Thế Bí Tịch
        </div>
        
        <h2 class="spirit-title-glow" @click="goToStory">
          {{ story.ten_truyen }}
        </h2>
        
        <div class="spirit-meta-aura">
          <span class="meta-item">
            <i class="fas fa-feather-pointed"></i> {{ story.tac_gia || 'Ẩn Danh Đạo Nhân' }}
          </span>
          <span class="aura-divider">|</span>
          <span class="meta-item">
            <i class="fas fa-eye"></i> {{ formatNumber(story.luot_xem) }} thần thức
          </span>
        </div>

        <p class="spirit-summary">
          {{ truncateText(story.mo_ta || '', 180) }}
        </p>

        <div class="spirit-actions">
          <button class="spirit-btn cyan-glow" @click="goToStory">
            <i class="fas fa-book-open mr-2"></i> LĨNH HỘI
          </button>
          <button class="spirit-btn dark-glass" @click="goToStory">
            <i class="fas fa-circle-info mr-2"></i> TRA CỨU
          </button>
        </div>
      </div>

      <!-- Right: Book Cover 3D -->
      <div class="cover-aura-display" @click="goToStory">
        <div class="book-3d-container">
          <img
            :src="coverUrl"
            :srcset="coverSrcSet"
            sizes="320px"
            class="book-cover-3d"
            :alt="story.ten_truyen"
            decoding="async"
          />
          <div class="book-glow-cyan"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import {
  getStoryCoverSrcSet,
  getStoryCoverUrl,
} from "@/config/constants";

interface Story {
  id: number;
  ten_truyen: string;
  slug: string;
  anh_bia: string;
  tac_gia?: string;
  mo_ta: string;
  luot_xem: number;
}

const props = defineProps<{
  story: Story;
  isActive: boolean;
}>();

const router = useRouter();
const coverUrl = computed(() => getStoryCoverUrl(props.story.anh_bia, 640));
const coverSrcSet = computed(() => getStoryCoverSrcSet(props.story.anh_bia, [320, 480, 640, 800]));
const coverBackgroundUrl = computed(() => getStoryCoverUrl(props.story.anh_bia, 1280));
const coverBackgroundSrcSet = computed(() =>
  getStoryCoverSrcSet(props.story.anh_bia, [640, 960, 1280, 1600]),
);

const goToStory = () => {
  router.push(`/truyen-chu/${props.story.slug}`);
};

const formatNumber = (num: number) => {
  if (!num) return "0";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
};

const truncateText = (text: string, length: number) => {
  if (!text) return "";
  return text.length > length ? text.substring(0, length) + "..." : text;
};
</script>

<style scoped>
/* ===== BASE LAYOUT ===== */
.banner-slide-aura {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border-radius: 20px;
  background-color: #020617;
  z-index: 1;
  pointer-events: none;
}

.banner-slide-aura.active {
  opacity: 1;
  z-index: 10;
  pointer-events: auto;
}

/* ===== COSMIC BACKGROUND ===== */
.slide-cosmic-bg {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.cover-cosmic-wrapper {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.cover-bg-aura {
  width: 105%;
  height: 105%;
  object-fit: cover;
  object-position: center;
  filter: blur(40px) brightness(0.4) saturate(1.2);
  transform: scale(1.1);
  transition: transform 10s linear;
}

.banner-slide-aura.active .cover-bg-aura {
  transform: scale(1.2) rotate(1deg);
}

.cosmic-overlay-radial {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 70% 50%, transparent 20%, #020617 85%);
}

/* ===== CONTENT GRID ===== */
.content-spirit-grid {
  position: relative;
  z-index: 10;
  height: 100%;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 40px;
  padding: 40px 60px;
  align-items: center;
}

/* Left Content */
.info-spirit-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  opacity: 0;
  transform: translateX(-50px);
  transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.banner-slide-aura.active .info-spirit-wrapper {
  opacity: 1;
  transform: translateX(0);
  transition-delay: 0.2s;
}

.badge-divine {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 4px 14px;
  background: linear-gradient(135deg, #22d3ee, #0ea5e9);
  color: #020617;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 0 15px rgba(34, 211, 238, 0.4);
}

.spirit-title-glow {
  font-size: 2.8rem;
  font-weight: 900;
  color: #fff;
  line-height: 1.2;
  cursor: pointer;
  background: linear-gradient(to bottom, #fff 40%, #94a3b8);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.2));
  margin: 0;
  transition: transform 0.3s ease;
}

.spirit-title-glow:hover {
  transform: translateX(5px);
}

.spirit-meta-aura {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #22d3ee;
  font-weight: 700;
  font-size: 0.95rem;
}

.aura-divider {
  opacity: 0.3;
  color: #94a3b8;
}

.spirit-summary {
  color: #94a3b8;
  font-size: 1rem;
  line-height: 1.7;
  max-width: 90%;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.spirit-actions {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.spirit-btn {
  display: inline-flex;
  align-items: center;
  padding: 12px 28px;
  border-radius: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.spirit-btn.cyan-glow {
  background: linear-gradient(135deg, #22d3ee, #0ea5e9);
  color: #020617;
  box-shadow: 0 4px 15px rgba(34, 211, 238, 0.4);
}

.spirit-btn.cyan-glow:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(34, 211, 238, 0.6);
}

.spirit-btn.dark-glass {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.spirit-btn.dark-glass:hover {
  background: rgba(34, 211, 238, 0.1);
  border-color: #22d3ee;
  color: #22d3ee;
  transform: translateY(-3px);
}

/* Right Content: 3D Cover */
.cover-aura-display {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  opacity: 0;
  transform: translateX(50px);
  transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.banner-slide-aura.active .cover-aura-display {
  opacity: 1;
  transform: translateX(0);
  transition-delay: 0.4s;
}

.book-3d-container {
  position: relative;
  width: 200px;
  height: 280px;
  transform: perspective(1000px) rotateY(-15deg);
  transition: transform 0.5s ease;
}

.book-3d-container:hover {
  transform: perspective(1000px) rotateY(-5deg) scale(1.05);
}

.book-cover-3d {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  border-radius: 4px 12px 12px 4px;
  box-shadow: 
    -10px 10px 30px rgba(0, 0, 0, 0.8),
    5px 0 15px rgba(34, 211, 238, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.book-glow-cyan {
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%);
  z-index: -1;
  border-radius: 50%;
  filter: blur(15px);
}

/* Animations */
@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.animate-pulse-slow {
  animation: pulse-slow 3s infinite ease-in-out;
}

/* Responsive */
@media (max-width: 1024px) {
  .desktop-only { display: none !important; }
}
</style>
