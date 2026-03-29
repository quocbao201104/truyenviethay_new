<template>
  <div class="topview-container xich-van-theme">
    
    <main class="main-content">
      <div class="container">
        
        <!-- PHONG VÂN BẢNG HEADER -->
         <!-- (Bảng gió giục mây vần) – Nơi các "đại lão" tranh giành vị thế. -->
        <div class="section-header-block animate-fadeIn">
          <div class="title-wrapper">
             <i class="fas fa-fire-alt fire-main"></i>
             <h2 class="section-title">PHONG VÂN BẢNG</h2>
          </div>
          <p class="section-subtitle">Linh khí hội tụ - Vạn chúng chú mục</p>
          <div class="section-divider-aura">
            <div class="divider-dot"></div>
          </div>
        </div>

        <!-- LOADING SKELETON (TONE HỎA) -->
        <div v-if="topviewStore.loading" class="loading-container">
          <div class="skeleton-list">
            <div v-for="n in 10" :key="n" class="skeleton-item-pill">
              <div class="skeleton-cover-v2"></div>
              <div class="skeleton-content-v2">
                <div class="shimmer-line"></div>
                <div class="shimmer-line short"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- ERROR STATE -->
        <div v-else-if="topviewStore.error" class="error-message-aura">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Thiên cơ nhiễu loạn: {{ topviewStore.error }}</p>
        </div>

        <!-- EMPTY STATE -->
        <div v-else-if="topviewStore.topStories.length === 0" class="empty-state-aura">
          <i class="fas fa-burn"></i>
          <h3>Hỏa Quang Tắt Lịm</h3>
          <p>Chưa có linh vật nào đủ nhiệt độ để lên bảng.</p>
        </div>

        <!-- TOP STORIES LIST (LỆNH BÀI HỎA CẤP) -->
        <div v-else class="topview-content">
          <div class="topview-list-v2">
            <div 
              v-for="(story, index) in topviewStore.topStories" 
              :key="story.id" 
              class="ranking-pill xich-cap"
              :class="getRankClass(index)"
            >
              <!-- Rank Aura (Hào quang Hỏa cho Top 3) -->
              <div v-if="index < 3" class="rank-aura-glow-fire"></div>

              <!-- Cảnh Giới Ấn (Rank Circle) -->
              <!-- Bìa Truyện -->
              <router-link :to="`/truyen-chu/${story.slug}`" class="story-cover-pill">
                <img 
                  :src="getStoryCoverUrl(story.anh_bia, 160)" 
                  :alt="story.ten_truyen"
                  class="cover-img"
                  @error="handleImageError"
                />
              </router-link>

              <!-- Thông Tin Chi Tiết -->
              <div class="story-details">
                <router-link :to="`/truyen-chu/${story.slug}`" class="title-link">
                  {{ story.ten_truyen }}
                </router-link>
                
                <div class="meta-row">
                  <span class="author-tag">
                    <i class="fas fa-feather-alt text-rose-500"></i> {{ story.tac_gia }}
                  </span>
                </div>
              </div>

              <!-- Nhiệt Độ (View Count Badge) -->
              <div class="score-crystal-fire">
                <div class="fire-row">
                   <i class="fas fa-fire-alt animate-pulse"></i>
                   <span class="val">{{ formatNumber(story.luot_xem) }}</span>
                </div>
                <span class="total">Nhiệt Độ</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useTopViewStore } from '@/modules/topview/topview.store';
import { getStoryCoverUrl, DEFAULT_STORY_COVER_URL } from "@/config/constants";
import { useHead } from "@unhead/vue";

useHead({
  title: "Thiên Bảng - Truyện Hot | TruyenVietHay",
  meta: [
    { name: "description", content: "Bảng xếp hạng truyện hot nhất, được xem nhiều nhất tại TruyenVietHay." },
  ]
});

const topviewStore = useTopViewStore();

onMounted(() => {
  topviewStore.fetchTopView();
});

const getRankClass = (index: number): string => {
  if (index === 0) return 'rank-crimson-1';
  if (index === 1) return 'rank-crimson-2';
  if (index === 2) return 'rank-crimson-3';
  return '';
};

const formatNumber = (num: number): string => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

const handleImageError = (event: Event) => {
  (event.target as HTMLImageElement).src = DEFAULT_STORY_COVER_URL;
};
</script>

<style scoped>
/* Premium red style matching RankingView composition */
.topview-container.xich-van-theme {
  --hot-bg-top: #120b0f;
  --hot-bg-mid: #1a1117;
  --hot-bg-bottom: #0f0a0d;
  --hot-surface: rgba(28, 16, 22, 0.9);
  --hot-border: rgba(245, 120, 146, 0.22);
  --hot-border-strong: rgba(252, 185, 108, 0.34);
  --hot-red: #ff5f7f;
  --hot-red-soft: #ff9ab0;
  --hot-gold: #f8bd74;
  --hot-text: #ffeef3;
  --hot-muted: #c59aa8;
  min-height: 100vh;
  background:
    radial-gradient(circle at 14% 0%, rgba(255, 95, 127, 0.14), transparent 34%),
    radial-gradient(circle at 86% 0%, rgba(248, 189, 116, 0.1), transparent 30%),
    linear-gradient(180deg, var(--hot-bg-top) 0%, var(--hot-bg-mid) 42%, var(--hot-bg-bottom) 100%);
  color: var(--hot-text);
  font-family: "Be Vietnam Pro", sans-serif;
  padding: 24px 0 68px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.section-header-block {
  text-align: center;
  margin-bottom: 52px;
}

.title-wrapper {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

.fire-main {
  font-size: 2.5rem;
  color: var(--hot-gold);
  margin-bottom: 10px;
  text-shadow: 0 0 14px rgba(248, 189, 116, 0.24);
  animation: float-fire 3s ease-in-out infinite;
}

.section-title {
  font-size: 3rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 5px;
  background: linear-gradient(120deg, #fff5ea 8%, #ff86a1 46%, #f8bd74 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.section-subtitle {
  color: var(--hot-muted);
  text-transform: uppercase;
  letter-spacing: 3px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-top: 10px;
}

.section-divider-aura {
  height: 1px;
  width: 300px;
  background: linear-gradient(90deg, transparent, var(--hot-red), transparent);
  margin: 20px auto;
  position: relative;
}

.divider-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: var(--hot-gold);
}

.topview-list-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ranking-pill.xich-cap {
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(180deg, rgba(31, 18, 25, 0.92), rgba(23, 14, 20, 0.95));
  border: 1px solid var(--hot-border);
  border-radius: 24px;
  padding: 14px 20px 14px 14px;
  position: relative;
  transition: transform 0.22s ease, border-color 0.22s ease, background-color 0.22s ease, box-shadow 0.22s ease;
  box-shadow: 0 14px 26px rgba(8, 3, 6, 0.3);
}

.ranking-pill.xich-cap:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 122, 151, 0.42);
  background: linear-gradient(180deg, rgba(34, 20, 28, 0.95), rgba(26, 16, 22, 0.96));
  box-shadow: 0 20px 36px rgba(19, 7, 12, 0.4);
}

.ranking-pill.rank-crimson-1 {
  transform: scale(1.022);
  border-color: rgba(252, 185, 108, 0.48);
  background: linear-gradient(135deg, rgba(252, 185, 108, 0.17), rgba(29, 16, 22, 0.95));
  box-shadow: 0 0 0 1px rgba(255, 222, 172, 0.12) inset, 0 20px 36px rgba(131, 63, 20, 0.3);
}

.ranking-pill.rank-crimson-2 {
  transform: scale(1.014);
  border-color: rgba(255, 137, 163, 0.42);
  background: linear-gradient(135deg, rgba(255, 137, 163, 0.14), rgba(29, 16, 22, 0.95));
  box-shadow: 0 0 0 1px rgba(255, 185, 200, 0.1) inset, 0 14px 28px rgba(100, 26, 53, 0.26);
}

.ranking-pill.rank-crimson-3 {
  transform: scale(1.008);
  border-color: rgba(218, 112, 134, 0.38);
  background: linear-gradient(135deg, rgba(218, 112, 134, 0.13), rgba(29, 16, 22, 0.95));
  box-shadow: 0 0 0 1px rgba(233, 167, 183, 0.09) inset, 0 10px 22px rgba(82, 24, 39, 0.22);
}

.ranking-pill.rank-crimson-1:hover {
  transform: scale(1.022) translateY(-2px);
}

.ranking-pill.rank-crimson-2:hover {
  transform: scale(1.014) translateY(-2px);
}

.ranking-pill.rank-crimson-3:hover {
  transform: scale(1.008) translateY(-2px);
}

.rank-aura-glow-fire {
  position: absolute;
  inset: 0;
  border-radius: 24px;
  opacity: 0;
  filter: blur(10px);
  transition: opacity 0.4s;
  pointer-events: none;
}

.ranking-pill.xich-cap:hover .rank-aura-glow-fire {
  opacity: 0.14;
}

.rank-crimson-1 .rank-aura-glow-fire {
  background: rgba(252, 185, 108, 0.72);
}

.rank-crimson-2 .rank-aura-glow-fire {
  background: rgba(255, 137, 163, 0.68);
}

.rank-crimson-3 .rank-aura-glow-fire {
  background: rgba(218, 112, 134, 0.62);
}

.story-cover-pill {
  width: 70px;
  height: 95px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid rgba(255, 184, 201, 0.18);
  box-shadow: 0 8px 18px rgba(10, 4, 7, 0.34);
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  transition: transform 0.6s ease-out;
}

.ranking-pill.xich-cap:hover .cover-img {
  transform: scale(1.04);
}

.story-details {
  flex-grow: 1;
  margin-left: 0;
  min-width: 0;
}

.title-link {
  font-size: 1.18rem;
  font-weight: 800;
  color: var(--hot-text);
  text-decoration: none;
  display: block;
  margin-bottom: 6px;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.45;
  max-height: 2.9em;
  transition: color 0.3s;
}

.rank-crimson-1 .title-link {
  font-weight: 900;
}

.title-link:hover {
  color: var(--hot-red-soft);
}

.meta-row {
  display: flex;
  gap: 12px;
  font-size: 0.78rem;
  color: var(--hot-muted);
  flex-wrap: wrap;
}

.meta-row span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.score-crystal-fire {
  background: rgba(17, 10, 14, 0.66);
  border: 1px solid rgba(245, 120, 146, 0.24);
  padding: 10px 14px;
  border-radius: 14px;
  text-align: center;
  min-width: 86px;
  margin-left: auto;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.fire-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: var(--hot-gold);
}

.fire-row .val {
  font-size: 1.35rem;
  font-weight: 900;
}

.score-crystal-fire .total {
  font-size: 0.62rem;
  color: var(--hot-muted);
  text-transform: uppercase;
  font-weight: 700;
}

.error-message-aura {
  text-align: center;
  color: var(--hot-red-soft);
  padding: 30px;
  background: rgba(255, 95, 127, 0.12);
  border: 1px solid rgba(255, 95, 127, 0.34);
  border-radius: 12px;
  margin: 30px 0;
}

.empty-state-aura {
  text-align: center;
  color: var(--hot-muted);
  padding: 40px;
}

.empty-state-aura i {
  font-size: 3rem;
  color: var(--hot-gold);
  margin-bottom: 20px;
  animation: float-fire 4s ease-in-out infinite;
}

.skeleton-item-pill {
  height: 108px;
  background: linear-gradient(180deg, rgba(31, 18, 25, 0.92), rgba(23, 14, 20, 0.95));
  border: 1px solid var(--hot-border);
  border-radius: 24px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
}

.skeleton-cover-v2 {
  width: 66px;
  height: 90px;
  border-radius: 10px;
  background: rgba(255, 174, 194, 0.08);
  border: 1px solid rgba(245, 120, 146, 0.16);
  flex-shrink: 0;
}

.skeleton-content-v2 {
  flex: 1;
}

.shimmer-line {
  height: 14px;
  background: rgba(255, 174, 194, 0.08);
  margin-bottom: 10px;
  border-radius: 4px;
  width: 72%;
  position: relative;
  overflow: hidden;
}

.shimmer-line.short {
  width: 42%;
}

.shimmer-line::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 149, 174, 0.26), transparent);
  animation: shimmer-swipe 1.8s infinite;
}

@keyframes shimmer-swipe {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes float-fire {
  0% {
    transform: translateY(0) rotate(0);
  }
  50% {
    transform: translateY(-8px) rotate(3deg);
  }
  100% {
    transform: translateY(0) rotate(0);
  }
}

@media (max-width: 768px) {
  .topview-container.xich-van-theme {
    padding: 20px 0 54px;
  }

  .container {
    padding-left: 15px;
    padding-right: 15px;
    overflow-x: hidden;
  }

  .section-header-block {
    margin-bottom: 34px;
  }

  .section-title {
    font-size: 1.8rem;
    letter-spacing: 2px;
  }

  .section-subtitle {
    letter-spacing: 1.8px;
    font-size: 0.72rem;
  }

  .section-divider-aura {
    width: 220px;
    margin-top: 16px;
  }

  .topview-list-v2 {
    gap: 14px;
  }

  .ranking-pill.xich-cap {
    border-radius: 12px;
    padding: 12px;
    gap: 12px;
  }

  .ranking-pill.rank-crimson-1,
  .ranking-pill.rank-crimson-2,
  .ranking-pill.rank-crimson-3 {
    transform: none;
  }

  .ranking-pill.rank-crimson-1:hover,
  .ranking-pill.rank-crimson-2:hover,
  .ranking-pill.rank-crimson-3:hover {
    transform: translateY(-1px);
  }

  .story-cover-pill {
    width: 65px;
    height: 90px;
    border-radius: 8px;
  }

  .story-details {
    width: auto;
    flex: 1;
    min-width: 0;
  }

  .title-link {
    font-size: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.35;
    margin-bottom: 4px;
  }

  .meta-row {
    gap: 10px;
    align-items: center;
    font-size: 0.74rem;
  }

  .score-crystal-fire {
    min-width: 62px;
    border-radius: 12px;
    padding: 6px 10px;
    background: rgba(12, 7, 10, 0.6);
    border-color: rgba(255, 155, 179, 0.22);
    box-shadow: none;
    display: block;
    align-self: auto;
  }

  .fire-row .val {
    font-size: 1.08rem;
  }

  .score-crystal-fire .total {
    font-size: 0.54rem;
  }

  .error-message-aura,
  .empty-state-aura {
    padding: 24px 16px;
  }

  .skeleton-item-pill {
    border-radius: 12px;
    padding: 0 12px;
    gap: 10px;
    height: 102px;
  }

  .skeleton-cover-v2 {
    width: 62px;
    height: 86px;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
