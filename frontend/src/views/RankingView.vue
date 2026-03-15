<template>
  <div class="ranking-container thanh-van-theme">
    
    <main class="main-content">
      <div class="container">
        
        <div class="section-header-block animate-fadeIn">
          <div class="title-wrapper">
             <i class="fas fa-cloud cloud-main"></i>
             <h2 class="section-title">Thanh Vân Bảng</h2>
          </div>
          <p class="section-subtitle">Cửu Thiên Khai Mở - Đạp Nguyệt Đăng Vân</p>
          <div class="section-divider-aura-cloud">
            <div class="divider-dot-cloud"></div>
          </div>
        </div>

        <div v-if="rankingStore.loading" class="loading-container">
          <div class="skeleton-list">
            <div v-for="n in 10" :key="n" class="skeleton-item-pill">
              <div class="skeleton-rank-circle"></div>
              <div class="skeleton-cover-v2"></div>
              <div class="skeleton-content-v2">
                <div class="shimmer-line"></div>
                <div class="shimmer-line short"></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="rankingStore.error" class="error-message-aura-cloud">
          <i class="fas fa-wind"></i>
          <p>Thiên cơ nhiễu loạn: {{ rankingStore.error }}</p>
        </div>

        <div v-else-if="rankingStore.topRatedStories.length === 0" class="empty-state-aura-cloud">
          <i class="fas fa-cloud-moon"></i>
          <h3>Thanh Vân Tĩnh Lặng</h3>
          <p>Bầu trời quang đãng, chưa có cường giả nào đạp mây bước lên.</p>
        </div>

        <div v-else class="ranking-content">
          <div class="ranking-list-v2">
            <div 
              v-for="(story, index) in rankingStore.topRatedStories" 
              :key="story.id" 
              class="ranking-pill mây-cap"
              :class="getRankClass(index)"
            >
              <div v-if="index < 3" class="rank-aura-glow-cloud"></div>

              <div class="rank-indicator">
                <div class="circle-inner">
                  <span class="rank-num">{{ index + 1 }}</span>
                  <i v-if="index < 3" class="fas fa-feather-alt mini-feather"></i>
                </div>
              </div>

              <router-link :to="`/truyen-chu/${story.slug}`" class="story-cover-pill">
                <img 
                  :src="getImageUrl(story.anh_bia)" 
                  :alt="story.ten_truyen"
                  class="cover-img"
                  @error="handleImageError"
                />
              </router-link>

              <div class="story-details">
                <router-link :to="`/truyen-chu/${story.slug}`" class="title-link">
                  {{ story.ten_truyen }}
                </router-link>
                
                <div class="meta-row meta-row-cloud">
                  <span class="author-tag">
                    <i class="fas fa-pen-nib text-sky-400"></i> {{ story.tac_gia }}
                  </span>
                  <span class="stat-tag">
                    <i class="fas fa-eye text-cyan-400"></i> {{ formatNumber(story.luot_xem) }}
                  </span>
                  <span v-if="story.total_ratings" class="stat-tag">
                    <i class="fas fa-comment-dots text-indigo-400"></i> {{ formatNumber(story.total_ratings) }}
                  </span>
                </div>
              </div>

              <div class="score-crystal-cloud">
                <div class="star-row">
                   <i class="fas fa-star animate-pulse-slow"></i>
                   <span class="val">{{ Number(story.avg_rating).toFixed(1) }}</span>
                </div>
                <span class="total">/ 5.0</span>
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
import { useRankingStore } from '@/modules/ranking/ranking.store';
import { getImageUrl } from "@/config/constants";

const rankingStore = useRankingStore();

onMounted(() => {
  rankingStore.fetchTopRated();
});

const getRankClass = (index: number): string => {
  if (index === 0) return 'rank-cloud-1'; // Lưu Ly (Trắng sáng tinh khiết)
  if (index === 1) return 'rank-cloud-2'; // Bích Không (Xanh da trời trong)
  if (index === 2) return 'rank-cloud-3'; // Thanh Lam (Xanh ngọc bích)
  return '';
};

const formatNumber = (num: number): string => {
  if (!num) return '0';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = '/placeholder.jpg';
};
</script>

<style scoped>
/* ===== CORE THEME - THANH VÂN (MÂY XANH) ===== */
.ranking-container.thanh-van-theme {
  min-height: 100vh;
  background: #081121; /* Nền xanh đêm huyền ảo, bớt đen hơn */
  color: #cbd5e1;
  font-family: 'Be Vietnam Pro', sans-serif;
  padding-bottom: 50px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

/* ===== HEADER TU TIEN - THANH VÂN ===== */
.section-header-block {
  text-align: center;
  margin-bottom: 60px;
}

.title-wrapper {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

.cloud-main {
  font-size: 2.5rem;
  color: #38bdf8; /* Sky 400 */
  filter: drop-shadow(0 0 15px rgba(56, 189, 248, 0.6));
  margin-bottom: 10px;
  animation: float-cloud 3s ease-in-out infinite;
}

.section-title {
  font-size: 3rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 5px;
  /* Dải màu bầu trời: Trắng, Xanh thiên thanh, Xanh ngọc */
  background: linear-gradient(to right, #e0f2fe, #38bdf8, #2dd4bf);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.3));
}

.section-subtitle {
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-top: 10px;
}

.section-divider-aura-cloud {
  height: 1px;
  width: 300px;
  background: linear-gradient(90deg, transparent, #38bdf8, transparent);
  margin: 20px auto;
  position: relative;
}

.divider-dot-cloud {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: #38bdf8;
  box-shadow: 0 0 10px #38bdf8;
}

/* ===== RANKING PILL (LỆNH BÀI THANH VÂN) ===== */
.ranking-list-v2 {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ranking-pill.mây-cap {
  display: flex;
  align-items: center;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 50px;
  padding: 10px 25px 10px 10px;
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.ranking-pill.mây-cap:hover {
  transform: translateY(-5px); /* Hiệu ứng lơ lửng bay lên thay vì trượt ngang */
  border-color: #38bdf860;
  background: #152033;
  box-shadow: 0 10px 25px rgba(56, 189, 248, 0.1);
}

/* Rank Indicator (Circle) */
.rank-indicator {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  padding: 3px;
  background: #1e293b;
  border-radius: 50%;
  z-index: 5;
}

.circle-inner {
  width: 100%;
  height: 100%;
  background: #081121;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #334155;
  position: relative;
}

.rank-num {
  font-size: 1.5rem;
  font-weight: 900;
  color: #475569;
}

/* Aura Glow Mây Xanh */
.rank-aura-glow-cloud {
  position: absolute;
  inset: 0;
  border-radius: 50px;
  opacity: 0;
  filter: blur(20px);
  transition: opacity 0.4s;
  pointer-events: none;
}

.ranking-pill.mây-cap:hover .rank-aura-glow-cloud {
  opacity: 0.2;
}

/* Top 1 - Lưu Ly (Sáng rực) */
.rank-cloud-1 { border-color: #bae6fd80; }
.rank-cloud-1 .circle-inner { border-color: #bae6fd; background: rgba(186, 230, 253, 0.15); }
.rank-cloud-1 .rank-num { color: #bae6fd; }
.rank-cloud-1 .rank-aura-glow-cloud { background: #bae6fd; }
.rank-cloud-1 .mini-feather { color: #bae6fd; }

/* Top 2 - Bích Không (Xanh trời) */
.rank-cloud-2 { border-color: #38bdf880; }
.rank-cloud-2 .circle-inner { border-color: #38bdf8; background: rgba(56, 189, 248, 0.15); }
.rank-cloud-2 .rank-num { color: #38bdf8; }
.rank-cloud-2 .rank-aura-glow-cloud { background: #38bdf8; }
.rank-cloud-2 .mini-feather { color: #38bdf8; }

/* Top 3 - Thanh Lam (Xanh ngọc) */
.rank-cloud-3 { border-color: #2dd4bf80; }
.rank-cloud-3 .circle-inner { border-color: #2dd4bf; background: rgba(45, 212, 191, 0.15); }
.rank-cloud-3 .rank-num { color: #2dd4bf; }
.rank-cloud-3 .rank-aura-glow-cloud { background: #2dd4bf; }
.rank-cloud-3 .mini-feather { color: #2dd4bf; }

.mini-feather {
  position: absolute;
  top: -10px;
  font-size: 0.85rem;
  animation: float-cloud 3s ease-in-out infinite;
}

/* Story Cover */
.story-cover-pill {
  width: 70px;
  height: 95px;
  border-radius: 12px;
  overflow: hidden;
  margin-left: 10px;
  flex-shrink: 0;
  box-shadow: 0 5px 15px rgba(0,0,0,0.4);
  border: 1px solid #334155;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  transition: transform 0.6s ease-out;
}

.ranking-pill.mây-cap:hover .cover-img {
  transform: scale(1.1) rotate(-2deg); /* Lượn nhẹ mây */
}

/* Story Details */
.story-details {
  flex-grow: 1;
  margin-left: 20px;
  min-width: 0;
}

.title-link {
  font-size: 1.3rem;
  font-weight: 800;
  color: #f1f5f9;
  text-decoration: none;
  display: block;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s;
}

.title-link:hover {
  color: #38bdf8;
}

.meta-row.meta-row-cloud {
  display: flex;
  gap: 15px;
  font-size: 0.8rem;
  color: #64748b;
}

.meta-row span {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Score Crystal (Linh Đan Đánh Giá) */
.score-crystal-cloud {
  background: #081121;
  border: 1px solid #1e293b;
  padding: 10px 15px;
  border-radius: 20px;
  text-align: center;
  min-width: 80px;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.3);
}

.star-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #38bdf8; /* Đổi sao vàng thành sao băng xanh */
}

.star-row .val {
  font-size: 1.4rem;
  font-weight: 900;
}

.score-crystal-cloud .total {
  font-size: 0.6rem;
  color: #475569;
  text-transform: uppercase;
  font-weight: 700;
}

/* Error/Empty State Cloud Colors */
.error-message-aura-cloud {
  text-align: center;
  color: #38bdf8;
  padding: 30px;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid #38bdf8;
  border-radius: 12px;
  margin: 30px 0;
}

.empty-state-aura-cloud {
  text-align: center;
  color: #94a3b8;
  padding: 40px;
}

.empty-state-aura-cloud i {
  font-size: 3rem;
  color: #38bdf8;
  margin-bottom: 20px;
  animation: float-cloud 4s ease-in-out infinite;
}

/* ===== ANIMATIONS ===== */
@keyframes float-cloud {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(3deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}

.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.shimmer-line {
  height: 15px;
  background: #1e293b;
  margin-bottom: 10px;
  border-radius: 4px;
  width: 200px;
  position: relative;
  overflow: hidden;
}

.shimmer-line::after {
  content: "";
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.1), transparent);
  animation: shimmer-swipe 2s infinite;
}

@keyframes shimmer-swipe {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== RESPONSIVE ===== */
/* Giữ nguyên như cũ, chỉ cập nhật tên class tương ứng */
@media (max-width: 768px) {
  .section-title { font-size: 1.8rem; letter-spacing: 2px; }
  
  .ranking-list-v2 {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .ranking-pill.mây-cap {
    flex-direction: row;
    border-radius: 12px;
    padding: 10px;
    height: auto;
    align-items: center;
    text-align: left;
    gap: 12px;
  }
  
  .rank-indicator {
    position: absolute;
    top: -8px;
    left: -8px;
    width: 35px;
    height: 35px;
    z-index: 10;
  }
  
  .rank-num { font-size: 0.9rem; }
  
  .story-cover-pill {
    width: 65px;
    height: 90px;
    margin-left: 0;
    margin-bottom: 0;
    border-radius: 8px;
  }
  
  .story-details {
    margin-left: 0;
    width: auto;
    flex: 1;
    min-width: 0;
  }
  
  .title-link { 
    font-size: 1rem; 
    white-space: nowrap; 
    overflow: hidden; 
    text-overflow: ellipsis;
    margin-bottom: 4px;
  }
  
  .meta-row.meta-row-cloud { 
    flex-direction: row; 
    flex-wrap: wrap;
    gap: 10px; 
    align-items: center; 
    font-size: 0.75rem; 
  }
  
  .score-crystal-cloud {
    margin-top: 0;
    width: auto;
    min-width: 60px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.05);
    padding: 6px 10px;
    border-radius: 12px;
    box-shadow: none;
    display: block;
    text-align: center;
  }

  .star-row .val { font-size: 1.1rem; }
}
</style>