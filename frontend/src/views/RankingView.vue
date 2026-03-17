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
          <div class="rank-tabs">
            <button
              type="button"
              class="rank-tab"
              :class="{ active: activeTab === 'stories' }"
              @click="activeTab = 'stories'"
            >
              Top Bí Tịch
            </button>
            <button
              type="button"
              class="rank-tab"
              :class="{ active: activeTab === 'authors' }"
              @click="activeTab = 'authors'"
            >
              Top Đại Thần
            </button>
          </div>
          <div v-if="activeTab === 'authors'" class="rank-subtabs">
            <button
              type="button"
              class="rank-subtab"
              :class="{ active: authorType === 'weekly' }"
              @click="authorType = 'weekly'"
            >
              Tuần
            </button>
            <button
              type="button"
              class="rank-subtab"
              :class="{ active: authorType === 'monthly' }"
              @click="authorType = 'monthly'"
            >
              Tháng
            </button>
            <button
              type="button"
              class="rank-subtab"
              :class="{ active: authorType === 'potential' }"
              @click="authorType = 'potential'"
            >
              Tiềm Năng
            </button>
            <button
              type="button"
              class="rank-subtab"
              :class="{ active: authorType === 'all' }"
              @click="authorType = 'all'"
            >
              Uy Tín
            </button>
          </div>
          <div class="section-divider-aura-cloud">
            <div class="divider-dot-cloud"></div>
          </div>
        </div>

        <div v-if="activeTab === 'stories' && rankingStore.loading" class="loading-container">
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

        <div v-else-if="activeTab === 'stories' && rankingStore.error" class="error-message-aura-cloud">
          <i class="fas fa-wind"></i>
          <p>Thiên cơ nhiễu loạn: {{ rankingStore.error }}</p>
        </div>

        <div v-else-if="activeTab === 'stories' && rankingStore.hotStories.length === 0" class="empty-state-aura-cloud">
          <i class="fas fa-cloud-moon"></i>
          <h3>Thanh Vân Tĩnh Lặng</h3>
          <p>Bầu trời quang đãng, chưa có cường giả nào đạp mây bước lên.</p>
        </div>

        <div v-else-if="activeTab === 'stories'" class="ranking-content">
          <div class="ranking-list-v2">
            <div 
              v-for="(story, index) in rankingStore.hotStories" 
              :key="story.id" 
              class="ranking-pill mây-cap"
              :class="getRankClass(index)"
            >
              <div v-if="index < 3" class="rank-aura-glow-cloud"></div>

              <div class="rank-indicator">
                <div class="circle-inner">
                  <span class="rank-num">{{ index + 1 }}</span>
                  <i v-if="index < 3" class="fas fa-crown mini-crown"></i>
                </div>
              </div>

              <router-link :to="`/truyen-chu/${story.slug}`" class="story-cover-pill first-element">
                <img 
                  :src="getImageUrl(story.anh_bia)" 
                  :alt="story.ten_truyen"
                  class="cover-img"
                  loading="lazy"
                  @error="handleImageError"
                />
              </router-link>

              <div class="story-details">
                <router-link :to="`/truyen-chu/${story.slug}`" class="title-link">
                  <span class="story-name">{{ story.ten_truyen }}</span>
                </router-link>
                
                <div class="meta-row meta-row-cloud">
                  <span class="author-tag">
                    <i class="fas fa-pen-nib text-sky-400"></i>
                    <span class="author-name-text">{{ story.tac_gia }}</span>
                  </span>
                </div>
              </div>

              <div class="score-crystal-cloud">
                <div class="star-row">
                   <i class="fas fa-fire animate-pulse-slow"></i>
                   <span class="val">{{ formatScore(story.hot_score) }}</span>
                </div>
                <span class="total">HOT SCORE</span>
              </div>

            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'authors' && authorLoading" class="loading-container">
          <div class="skeleton-list">
            <div v-for="n in 8" :key="n" class="skeleton-item-pill">
              <div class="skeleton-rank-circle"></div>
              <div class="skeleton-cover-v2"></div>
              <div class="skeleton-content-v2">
                <div class="shimmer-line"></div>
                <div class="shimmer-line short"></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'authors' && authorError" class="error-message-aura-cloud">
          <i class="fas fa-wind"></i>
          <p>Thiên cơ nhiễu loạn: {{ authorError }}</p>
        </div>

        <div v-else-if="activeTab === 'authors' && authorList.length === 0" class="empty-state-aura-cloud">
          <i class="fas fa-cloud-moon"></i>
          <h3>Thanh Vân Tĩnh Lặng</h3>
          <p>Chưa có tác giả nào đạt chuẩn bảng xếp hạng.</p>
        </div>

        <div v-else-if="activeTab === 'authors'" class="ranking-content">
          <div class="ranking-list-v2">
            <div 
              v-for="(author, index) in authorList" 
              :key="author.id" 
              class="ranking-pill mây-cap author-pill"
              :class="getRankClass(index)"
              @click="navigateToAuthor(author.id)"
            >
              <div v-if="index < 3" class="rank-aura-glow-cloud"></div>

              <div class="rank-indicator">
                <div class="circle-inner">
                  <span class="rank-num">{{ index + 1 }}</span>
                  <i v-if="index < 3" class="fas fa-crown mini-crown"></i>
                </div>
              </div>

              <div class="author-avatar-ranking first-element">
                <div class="spirit-array-center" :class="author.equipped_frame?.css_class">
                  <div class="magic-circle-spin" v-if="author.equipped_frame"></div>
                  <div class="magic-circle-reverse" v-if="author.equipped_frame"></div>
                  <img
                    :src="getAvatarUrl(author.avatar || author.user_avatar)"
                    :alt="author.pen_name"
                    class="hero-avatar item-img"
                    loading="lazy"
                    crossorigin="anonymous"
                  />
                  <img
                    v-if="author.equipped_frame"
                    :src="getImageUrl(author.equipped_frame.image_url)"
                    alt="Avatar Frame"
                    class="hero-frame"
                    loading="lazy"
                    crossorigin="anonymous"
                  />
                </div>
              </div>

              <div class="story-details">
                <div class="title-link author-name-plate">
                  <span class="author-name-text">{{ author.pen_name }}</span>
                </div>
                
                <div class="meta-row meta-row-cloud">
                  <span class="author-tag">
                    <i class="fas fa-user text-sky-400"></i> {{ formatNumber(author.follower_count) }} theo dõi
                  </span>
                  <span class="stat-tag">
                    <i class="fas fa-book-open text-cyan-400"></i> {{ formatNumber(author.total_stories) }} truyện
                  </span>
                  <span class="stat-tag">
                    <i class="fas fa-eye text-indigo-400"></i> {{ formatNumber(author.total_views) }} lượt xem
                  </span>
                </div>
              </div>

              <div class="score-crystal-cloud">
                <div class="star-row">
                   <i class="fas fa-crown animate-pulse-slow"></i>
                   <span class="val">{{ formatNumber(getAuthorScore(author)) }}</span>
                </div>
                <span class="total">{{ authorScoreLabel }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import { useRankingStore } from '@/modules/ranking/ranking.store';
import { getAvatarUrl, getImageUrl } from "@/config/constants";
import { getTopAuthors, type AuthorRankType, type AuthorPublic } from "@/modules/author/author.api";
import { useRouter } from "vue-router";

const rankingStore = useRankingStore();
const router = useRouter();

const activeTab = ref<"stories" | "authors">("stories");
const authorType = ref<AuthorRankType>("monthly");
const authorList = ref<AuthorPublic[]>([]);
const authorLoading = ref(false);
const authorError = ref<string | null>(null);

onMounted(() => {
  rankingStore.fetchHotStories();
});

const fetchAuthors = async () => {
  if (authorList.value.length === 0) {
    authorLoading.value = true;
  }
  authorError.value = null;
  try {
    authorList.value = await getTopAuthors(authorType.value, 30);
  } catch (err: any) {
    authorError.value = err.message || "Failed to load authors";
  } finally {
    authorLoading.value = false;
  }
};

watch([activeTab, authorType], ([tab]) => {
  if (tab === "authors") {
    fetchAuthors();
  }
});

const getRankClass = (index: number): string => {
  if (index === 0) return 'rank-cloud-1'; // Lưu Ly (Trắng sáng tinh khiết / Vàng kim)
  if (index === 1) return 'rank-cloud-2'; // Bích Không (Bạc)
  if (index === 2) return 'rank-cloud-3'; // Thanh Lam (Đồng)
  return '';
};

const formatNumber = (num: number): string => {
  if (!num) return '0';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

const formatScore = (score?: number): string => {
  if (!score && score !== 0) return '0.0';
  return Number(score).toFixed(1);
};

const getAuthorScore = (author: AuthorPublic) => {
  if (authorType.value === "weekly") return author.weekly_score;
  if (authorType.value === "potential") return author.potential_score;
  if (authorType.value === "all") return author.author_score;
  return author.monthly_score;
};

const authorScoreLabel = computed(() => {
  if (authorType.value === "weekly") return "Điểm Tuần";
  if (authorType.value === "potential") return "Tiềm Năng";
  if (authorType.value === "all") return "Uy Tín";
  return "Điểm Tháng";
});

const navigateToAuthor = (authorId: number) => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  router.push(`/tac-gia/${authorId}`);
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
  background: #101724;
  color: #cbd5e1;
  font-family: 'Be Vietnam Pro', sans-serif;
  padding: 24px 0 68px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

/* ===== HEADER TU TIEN - THANH VÂN ===== */
.section-header-block {
  text-align: center;
  margin-bottom: 52px;
}

.title-wrapper {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

.cloud-main {
  font-size: 2.5rem;
  color: #38bdf8;
  filter: none;
  margin-bottom: 10px;
  animation: float-cloud 3s ease-in-out infinite;
}

.section-title {
  font-size: 3rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 5px;
  background: linear-gradient(to right, #e0f2fe, #38bdf8, #2dd4bf);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: none;
}

.section-subtitle {
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-top: 10px;
}

.rank-tabs {
  display: inline-flex;
  gap: 10px;
  margin-top: 18px;
  padding: 6px;
  border-radius: 999px;
  background: rgba(18, 26, 39, 0.82);
  border: 1px solid var(--app-border);
}

.rank-tab {
  border: 1px solid transparent;
  background: transparent;
  color: #cbd5e1;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 8px 18px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.rank-tab:hover {
  background: rgba(56, 189, 248, 0.12);
  color: #e2e8f0;
}

.rank-tab.active {
  background: rgba(91, 196, 232, 0.18);
  color: #e9f7fd;
  border-color: rgba(91, 196, 232, 0.28);
  box-shadow: none;
}

.rank-subtabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.rank-subtab {
  border: 1px solid rgba(91, 196, 232, 0.16);
  background: rgba(21, 31, 47, 0.75);
  color: #cbd5e1;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.rank-subtab:hover {
  border-color: rgba(56, 189, 248, 0.5);
  color: #e2e8f0;
}

.rank-subtab.active {
  background: rgba(91, 196, 232, 0.14);
  border-color: rgba(91, 196, 232, 0.28);
  color: #e2e8f0;
}

.author-pill {
  cursor: pointer;
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
  box-shadow: none;
}

/* ===== RANKING PILL (LỆNH BÀI THANH VÂN) ===== */
.ranking-list-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ranking-pill.mây-cap {
  display: flex;
  align-items: center;
  background: rgba(21, 31, 47, 0.9);
  border: 1px solid var(--app-border);
  border-radius: 24px;
  padding: 12px 22px 12px 12px;
  position: relative;
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
  box-shadow: var(--app-shadow-1);
}

.ranking-pill.rank-cloud-1 {
  transform: scale(1.025);
  transform-origin: center;
}

.ranking-pill.mây-cap:hover {
  transform: translateY(-2px);
  border-color: rgba(91, 196, 232, 0.24);
  background: rgba(24, 35, 52, 0.95);
  box-shadow: var(--app-shadow-2);
}

.ranking-pill.rank-cloud-1:hover {
  transform: scale(1.025) translateY(-2px);
}

.rank-indicator {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  padding: 3px;
  background: rgba(148, 163, 184, 0.12);
  border-radius: 50%;
  z-index: 5;
}

.circle-inner {
  width: 100%;
  height: 100%;
  background: #101724;
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

.mini-crown {
  position: absolute;
  top: -8px;
  font-size: 0.7rem;
  color: inherit;
}

/* Aura Glow Mây Xanh */
.rank-aura-glow-cloud {
  position: absolute;
  inset: 0;
  border-radius: 24px;
  opacity: 0;
  filter: blur(10px);
  transition: opacity 0.4s;
  pointer-events: none;
}

.ranking-pill.mây-cap:hover .rank-aura-glow-cloud {
  opacity: 0.12;
}

/* ===== STYLE CHO 3 THẺ TOP ĐẦU ===== */
/* Top 1 - Ánh Kim / Lưu Ly */
.ranking-pill.rank-cloud-1 { 
  border-color: rgba(243, 201, 107, 0.38); 
  background: linear-gradient(135deg, rgba(243, 201, 107, 0.12), rgba(21, 31, 47, 0.92));
  box-shadow: var(--app-shadow-1);
}
.rank-cloud-1 .rank-aura-glow-cloud { background: rgba(243, 201, 107, 0.85); }
.rank-cloud-1 .circle-inner { border-color: #eab308; background: rgba(234, 179, 8, 0.12); }
.rank-cloud-1 .rank-num { color: #eab308; }

/* Top 2 - Ánh Bạc / Bích Không */
.ranking-pill.rank-cloud-2 { 
  border-color: rgba(148, 163, 184, 0.34); 
  background: linear-gradient(135deg, rgba(148, 163, 184, 0.12), rgba(21, 31, 47, 0.92));
  box-shadow: var(--app-shadow-1);
}
.rank-cloud-2 .rank-aura-glow-cloud { background: rgba(148, 163, 184, 0.7); }
.rank-cloud-2 .circle-inner { border-color: #94a3b8; background: rgba(148, 163, 184, 0.12); }
.rank-cloud-2 .rank-num { color: #cbd5e1; }

/* Top 3 - Ánh Đồng / Thanh Lam */
.ranking-pill.rank-cloud-3 { 
  border-color: rgba(224, 129, 79, 0.36); 
  background: linear-gradient(135deg, rgba(224, 129, 79, 0.12), rgba(21, 31, 47, 0.92));
  box-shadow: var(--app-shadow-1);
}
.rank-cloud-3 .rank-aura-glow-cloud { background: rgba(224, 129, 79, 0.75); }
.rank-cloud-3 .circle-inner { border-color: #c2410c; background: rgba(194, 65, 12, 0.12); }
.rank-cloud-3 .rank-num { color: #fb923c; }

/* Story Cover */
.story-cover-pill {
  width: 70px;
  height: 95px;
  border-radius: 12px;
  overflow: hidden;
  margin-left: 10px;
  flex-shrink: 0;
  box-shadow: 0 8px 18px rgba(2, 8, 18, 0.24);
  border: 1px solid rgba(148, 163, 184, 0.16);
  position: relative;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  transition: transform 0.6s ease-out;
}

.ranking-pill.mây-cap:hover .cover-img {
  transform: scale(1.04);
}

/* ===== SPIRIT ARRAY AVATAR (Ranking Version) ===== */
.author-avatar-ranking {
  margin-left: 10px;
  flex-shrink: 0;
}

.spirit-array-center {
  position: relative; width: 68px; height: 68px;
  display: flex; align-items: center; justify-content: center;
  --aura-primary: 56, 189, 248; 
}

.magic-circle-spin, .magic-circle-reverse {
  position: absolute; inset: -4px; border-radius: 50%;
  border: 1.5px dashed rgba(var(--aura-primary), 0.4);
  animation: spinArray 20s linear infinite; pointer-events: none;
  filter: none;
}
.magic-circle-reverse {
  inset: -7px; border: 1px dotted rgba(var(--aura-primary), 0.6);
  animation: spinArrayReverse 15s linear infinite;
}

.hero-avatar {
  position: relative; z-index: 2; width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
  border: 2px solid rgba(var(--aura-primary), 0.8); background: #000;
  box-shadow: none;
  transform: scale(0.80);
}
 
.hero-frame {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain;
  transform: scale(1.45); z-index: 3; pointer-events: none;
}

.first-element {
  margin-left: 5px !important;
  position: relative;
  z-index: 5;
}

/* Story Details */
.story-details {
  flex-grow: 1;
  margin-left: 20px;
  min-width: 0;
}

.title-link {
  font-size: 1.18rem;
  font-weight: 800;
  color: #f1f5f9;
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

.rank-cloud-1 .title-link,
.rank-cloud-1 .story-name {
  font-weight: 900;
}

.title-link:hover {
  color: #38bdf8;
}

.author-name-plate { display: flex; align-items: center; gap: 8px; }
.author-name-text { font-weight: 800; }
.story-name { font-weight: 800; font-size: 1.1rem; }

.meta-row.meta-row-cloud {
  display: flex;
  gap: 15px;
  font-size: 0.78rem;
  color: var(--app-text-subtle);
  flex-wrap: wrap;
}

.meta-row span {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Score Crystal (Linh Đan Đánh Giá) */
.score-crystal-cloud {
  background: rgba(14, 20, 31, 0.52);
  border: 1px solid rgba(148, 163, 184, 0.08);
  padding: 10px 14px;
  border-radius: 14px;
  text-align: center;
  min-width: 80px;
  box-shadow: none;
  margin-left: 16px;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.star-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #38bdf8;
}

.star-row .val {
  font-size: 1.4rem;
  font-weight: 900;
}

.score-crystal-cloud .total {
  font-size: 0.6rem;
  color: var(--app-text-subtle);
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

/* Frame specific aura colors */
.spirit-array-center.frame-phoenix-fire { --aura-primary: 239, 68, 68; }
.spirit-array-center.frame-bang-tinh { --aura-primary: 56, 189, 248; }
.spirit-array-center.frame-thien-thanh { --aura-primary: 234, 179, 8; }
.spirit-array-center.frame-nine-tails-purple { --aura-primary: 168, 85, 247; }
.spirit-array-center.frame-chan-long { --aura-primary: 251, 191, 36; }

@keyframes spinArray { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes spinArrayReverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .container {
    padding-left: 15px;
    padding-right: 15px;
    overflow-x: hidden;
  }

  .section-title { font-size: 1.8rem; letter-spacing: 2px; }
  
  .ranking-list-v2 {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .ranking-pill.mây-cap {
    flex-direction: row;
    border-radius: 12px;
    padding: 12px;
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

  .circle-inner {
    border-width: 1.5px;
  }

  .rank-num {
    font-size: 0.9rem;
  }
  
  .story-cover-pill {
    width: 65px;
    height: 90px;
    margin-left: 0;
    margin-bottom: 0;
    border-radius: 8px;
  }

  .author-avatar-ranking {
    margin-left: 0;
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
