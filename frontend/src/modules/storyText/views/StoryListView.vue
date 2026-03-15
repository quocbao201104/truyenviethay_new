<template>
  <div class="story-list-page-xianxia">
    
    <main class="main-content-spirit">
      <section class="hero-aura-wrapper animate-fadeIn">
        <HeroGrid 
          :stories="hotStories.slice(0, 5)" 
          :trendingStories="topMonthlyStories"
        />
      </section>

      <div class="continue-cultivation-area">
        <ContinueReadingStrip />
      </div>

      <div class="content-body-grid">
        <div class="main-col-spirit">
          
          <section class="spirit-block">
            <div class="spirit-header emerald">
              <h2 class="spirit-title">
                <i class="fas fa-seedling"></i>
                Tân Tú Bảng
                <span class="spirit-note">Kỳ tài mới nổi</span>
              </h2>
              <router-link to="/tim-kiem" class="view-all-spirit emerald">
                Xem thêm <i class="fas fa-arrow-right-long ml-1"></i>
              </router-link>
            </div>
            
            <div class="spirit-grid-responsive">
              <NewStoryCard 
                v-for="story in newStories" 
                :key="story.id" 
                :story="story" 
              />
            </div>
          </section>

          <section class="spirit-block">  
            <div class="spirit-header gold">
              <h2 class="spirit-title">
                <i class="fas fa-medal"></i>
                Lệnh Bài Bảng
                <span class="spirit-note">Vạn người tín ngưỡng</span>
              </h2>
              <router-link to="/xep-hang" class="view-all-spirit gold">Xem thêm</router-link>
            </div>
            
            <div class="spirit-grid-responsive">
              <NewStoryCard 
                v-for="story in topRatedStories.slice(0, 8)" 
                :key="story.id" 
                :story="story" 
              />
            </div>
          </section>

          <section class="spirit-block">
            <div class="spirit-header purple">
              <h2 class="spirit-title">
                <i class="fas fa-yin-yang"></i>
                Đại Viên Mãn
                <span class="spirit-note">Công đức tròn đầy</span>
              </h2>
              <router-link to="/tim-kiem?status=hoan_thanh" class="view-all-spirit purple">Toàn Thư</router-link>
            </div>
            <div class="spirit-grid-responsive">
              <NewStoryCard 
                v-for="story in completedStories.slice(0, 8)" 
                :key="story.id" 
                :story="story" 
              />
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
                  :to="`/the-loai?categories=${cat.id_theloai}`"
                  class="tag-pill-spirit fire-pill"
                >
                  {{ cat.ten_theloai }}
                </router-link>
              </div>
            </section>
          </div>
        </div>

        <aside class="sidebar-col-spirit">
          <div class="sticky-spirit-box">
            
            <div class="sidebar-card-aura ranking moon-board">
              <div class="spirit-header moon mb-4">
                <h3 class="sidebar-title-xianxia">
                  <i class="fas fa-moon moon-icon"></i> Nguyệt Bảng
                </h3>
              </div>
              <p class="moon-subtitle">{{ moonSubtitle }}</p>
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
              
              <div class="ranking-spirit-list">
                <div 
                  v-for="(story, index) in moonStories.slice(0, 5)" 
                  :key="story.id" 
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
              <div class="tag-cloud-spirit">
                <router-link 
                  v-for="cat in categories" 
                  :key="cat.id_theloai"
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
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Story, getHotStories } from "@/modules/storyText/story.service";
import type { Category } from "@/types/category";
import NewStoryCard from "@/modules/storyText/components/NewStoryCard.vue";
import HeroGrid from "@/components/home/HeroGrid.vue"; 
import ContinueReadingStrip from "@/components/home/ContinueReadingStrip.vue";
import { useStoryStore } from "@/modules/storyText/story.store";
import { useRouter } from "vue-router";

const storyStore = useStoryStore();
const router = useRouter();

const navigateToStory = (slug: string) => {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
    router.push(`/truyen-chu/${slug}`);
};

const categories = ref<Category[]>([]);
const newStories = ref<Story[]>([]);
const hotStories = ref<Story[]>([]);
const topMonthlyStories = ref<Story[]>([]);
const topWeeklyStories = ref<Story[]>([]);
const topDailyStories = ref<Story[]>([]);
const topRatedStories = ref<Story[]>([]);
const completedStories = ref<Story[]>([]);
const moonTab = ref<"thang" | "tuan" | "ngay">("thang");

const moonStories = computed(() => {
  if (moonTab.value === "tuan") return topWeeklyStories.value;
  if (moonTab.value === "ngay") return topDailyStories.value;
  return topMonthlyStories.value;
});

const moonSubtitle = computed(() => {
  if (moonTab.value === "tuan") {
    return "Kỳ lân xuất thế - Quần hùng tranh bá trong tuần.";
  }
  if (moonTab.value === "ngay") {
    return "Kỳ lân xuất thế - Quần hùng tranh bá trong ngày.";
  }
  return "Kỳ lân xuất thế - Quần hùng tranh bá trong tháng.";
});

const fetchAllData = async () => {
  try {
    const results = await Promise.all([
      storyStore.fetchCategories(),
      storyStore.fetchNewStories(10),
      getHotStories(5),
      storyStore.fetchTopMonthlyStories(5),
      storyStore.fetchTopWeeklyStories(5),
      storyStore.fetchTopDailyStories(5),
      storyStore.fetchTopRatedStories(8),
      storyStore.fetchCompletedStories(10)
    ]);

    categories.value = results[0];
    newStories.value = results[1];
    hotStories.value = results[2];
    topMonthlyStories.value = results[3];
    topWeeklyStories.value = results[4];
    topDailyStories.value = results[5];
    topRatedStories.value = results[6];
    completedStories.value = results[7];
  } catch (err) {
    console.error("Thiên cơ bị nhiễu loạn:", err);
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

onMounted(() => {
  fetchAllData();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap");

/* ===== CORE BACKGROUND ===== */
.story-list-page-xianxia {
  min-height: 100vh;
  background-color: #03050a; /* Nền tối sâu hơn để Glow nổi bật */
  background-image: 
    radial-gradient(circle at 15% 50%, rgba(52, 211, 153, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 85% 30%, rgba(148, 163, 184, 0.04) 0%, transparent 50%);
  color: #cbd5e1;
  font-family: 'Be Vietnam Pro', sans-serif;
  overflow-x: hidden;
}

.main-content-spirit {
  max-width: 1440px;
  margin: 0 auto;
  padding: 30px 25px 80px;
}

.hero-aura-wrapper {
  margin-bottom: 50px;
  border-radius: 20px;
  overflow: hidden;
}

.continue-cultivation-area {
  margin-bottom: 60px;
  position: relative;
  z-index: 10;
}

.content-body-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 40px;
}

.spirit-block { margin-bottom: 55px; }

/* ===== LINH KHÍ TRẬN (SECTION HEADERS CHUNG) ===== */
.spirit-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 25px;
  padding-bottom: 12px;
  position: relative;
}

.spirit-title {
  font-size: 1.6rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.spirit-note {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  margin-left: 10px;
  opacity: 0.7;
  display: inline-block;
  transform: translateY(-2px);
}

.view-all-spirit {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 6px 16px;
  border-radius: 50px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* ===== TONE MÀU CÁC BẢNG ===== */

/* 1. EMERALD (Tân Tú - Lục Bảo) */
.spirit-header.emerald { border-bottom: 1px solid rgba(52, 211, 153, 0.15); }
.spirit-header.emerald::before {
  content: ''; position: absolute; bottom: -1.5px; left: 0; width: 80px; height: 3px;
  background: #34d399; box-shadow: 0 0 15px #34d399; border-radius: 50px;
}
.spirit-header.emerald .spirit-title { color: #f8fafc; text-shadow: 0 0 15px rgba(52, 211, 153, 0.3); }
.spirit-header.emerald .spirit-title i { color: #34d399; filter: drop-shadow(0 0 8px #34d399); }
.view-all-spirit.emerald { color: #34d399; background: rgba(52, 211, 153, 0.1); border: 1px solid rgba(52, 211, 153, 0.2); }
.view-all-spirit.emerald:hover { background: #34d399; color: #05080f; box-shadow: 0 0 15px rgba(52, 211, 153, 0.4); transform: translateY(-2px); }

/* 2. GOLD (Lệnh Bài - Hoàng Kim) */
.spirit-header.gold { border-bottom: 1px solid rgba(251, 191, 36, 0.15); }
.spirit-header.gold::before {
  content: ''; position: absolute; bottom: -1.5px; left: 0; width: 80px; height: 3px;
  background: #fbbf24; box-shadow: 0 0 15px #fbbf24; border-radius: 50px;
}
.spirit-header.gold .spirit-title { color: #f8fafc; text-shadow: 0 0 15px rgba(251, 191, 36, 0.3); }
.spirit-header.gold .spirit-title i { color: #fbbf24; filter: drop-shadow(0 0 8px #fbbf24); }
.view-all-spirit.gold { color: #fbbf24; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.2); }
.view-all-spirit.gold:hover { background: #fbbf24; color: #05080f; box-shadow: 0 0 15px rgba(251, 191, 36, 0.4); transform: translateY(-2px); }

/* 3. PURPLE (Đại Viên Mãn - Tử Khí) */
.spirit-header.purple { border-bottom: 1px solid rgba(192, 132, 252, 0.15); }
.spirit-header.purple::before {
  content: ''; position: absolute; bottom: -1.5px; left: 0; width: 80px; height: 3px;
  background: #c084fc; box-shadow: 0 0 15px #c084fc; border-radius: 50px;
}
.spirit-header.purple .spirit-title { color: #f8fafc; text-shadow: 0 0 15px rgba(192, 132, 252, 0.3); }
.spirit-header.purple .spirit-title i { color: #c084fc; filter: drop-shadow(0 0 8px #c084fc); }
.view-all-spirit.purple { color: #c084fc; background: rgba(192, 132, 252, 0.1); border: 1px solid rgba(192, 132, 252, 0.2); }
.view-all-spirit.purple:hover { background: #c084fc; color: #05080f; box-shadow: 0 0 15px rgba(192, 132, 252, 0.4); transform: translateY(-2px); }

/* 4. FIRE (Linh Anh - Đỏ Cam) */
.spirit-header.fire { border-bottom: 1px solid rgba(249, 115, 22, 0.15); padding-bottom: 8px;}
.spirit-header.fire::before {
  content: ''; position: absolute; bottom: -1.5px; left: 0; width: 60px; height: 3px;
  background: #f97316; box-shadow: 0 0 15px #f97316; border-radius: 50px;
}
.sidebar-title-xianxia { margin: 0; font-size: 1.2rem; font-weight: 900; color: #f8fafc; text-transform: uppercase; letter-spacing: 1.5px; display: flex; align-items: center; gap: 10px; }
.spirit-header.fire .sidebar-title-xianxia i { color: #f97316; filter: drop-shadow(0 0 8px #f97316); }

/* ===== 5. MOON (Nguyệt Bảng - Ánh Trăng Bạc/Xám Nhạt) ĐẶC BIỆT ===== */
.moon-board {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(3, 5, 10, 0.9) 100%) !important;
  border: 1px solid rgba(148, 163, 184, 0.2) !important;
  box-shadow: 0 10px 40px rgba(0,0,0,0.6), inset 0 0 30px rgba(148, 163, 184, 0.05) !important;
  position: relative;
  overflow: hidden;
}
/* Hiệu ứng trăng sáng góc trên phải */
.moon-board::before {
  content: ''; position: absolute; top: -50px; right: -50px; width: 150px; height: 150px;
  background: radial-gradient(circle, rgba(226, 232, 240, 0.15) 0%, transparent 70%);
  border-radius: 50%; pointer-events: none;
}

.spirit-header.moon { border-bottom: 1px solid rgba(148, 163, 184, 0.2); padding-bottom: 10px;}
.spirit-header.moon::before {
  content: ''; position: absolute; bottom: -1.5px; left: 0; width: 60px; height: 3px;
  background: #e2e8f0; box-shadow: 0 0 15px #e2e8f0; border-radius: 50px;
}
.spirit-header.moon .sidebar-title-xianxia i, .spirit-header.moon .spirit-title i { color: #e2e8f0; filter: drop-shadow(0 0 8px #e2e8f0); }
.spirit-header.moon .spirit-title { color: #f8fafc; text-shadow: 0 0 15px rgba(226, 232, 240, 0.3); }

.moon-subtitle { font-size: 0.8rem; color: #94a3b8; margin-bottom: 20px; font-style: italic; }

.moon-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.moon-tab {
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(148, 163, 184, 0.08);
  color: #cbd5e1;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.moon-tab:hover {
  background: rgba(226, 232, 240, 0.15);
  border-color: rgba(226, 232, 240, 0.35);
  color: #e2e8f0;
}

.moon-tab.active {
  background: #e2e8f0;
  color: #0f172a;
  border-color: #e2e8f0;
  box-shadow: 0 0 12px rgba(226, 232, 240, 0.35);
}

/* Grid mặc định cho Desktop */
.spirit-grid-responsive {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
  gap: 28px 24px;
}

/* ===== SIDEBAR - GLASSMORPHISM ===== */
.sticky-spirit-box { 
  position: sticky; top: 90px; display: flex; flex-direction: column; gap: 30px; 
}

.sidebar-card-aura { 
  background: rgba(11, 15, 25, 0.6); 
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05); 
  border-radius: 20px; padding: 24px; 
}

/* NGUYỆT BẢNG ITEM */
.ranking-spirit-list, .ranking-spirit-list-mobile { display: flex; flex-direction: column; gap: 12px; }

.ranking-spirit-item {
  display: flex; align-items: center; gap: 15px; padding: 12px 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255,255,255,0.03); 
  border-radius: 12px; cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
}

.ranking-spirit-item:hover {
  background: rgba(226, 232, 240, 0.08);
  border-color: rgba(226, 232, 240, 0.2);
  transform: translateX(8px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.rank-orb {
  width: 36px; height: 36px; flex-shrink: 0; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 1rem; color: #94a3b8; 
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
}

/* Top 1-2-3 Nguyệt Bảng (Tone Bạc/Trăng) */
.moon-item .rank-orb.top-1 { background: rgba(241, 245, 249, 0.15); border-color: #f8fafc; color: #f8fafc; box-shadow: 0 0 15px rgba(248, 250, 252, 0.4); text-shadow: 0 0 5px #f8fafc; }
.moon-item .rank-orb.top-2 { background: rgba(203, 213, 225, 0.1); border-color: #cbd5e1; color: #cbd5e1; box-shadow: 0 0 12px rgba(203, 213, 225, 0.3); }
.moon-item .rank-orb.top-3 { background: rgba(148, 163, 184, 0.1); border-color: #94a3b8; color: #94a3b8; box-shadow: 0 0 10px rgba(148, 163, 184, 0.2); }

.rank-details {
  flex-grow: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; gap: 6px;
}

.rank-name { 
  margin: 0; padding: 0; font-size: 0.95rem; font-weight: 800; color: #f1f5f9; 
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;
  transition: color 0.3s;
}

.ranking-spirit-item:hover .rank-name { color: #e2e8f0; text-shadow: 0 0 8px rgba(226, 232, 240, 0.5); }

.rank-val { 
  margin: 0; font-size: 0.75rem; color: #94a3b8; font-weight: 600; 
  display: flex; align-items: center; gap: 6px; 
}
.rank-val::before { content: '\f06e'; font-family: 'Font Awesome 6 Free'; font-weight: 900; color: #94a3b8; font-size: 0.75rem; }

.spirit-more-link, .spirit-more-link-mobile {
  display: block; text-align: center; margin-top: 20px;
  font-size: 0.8rem; font-weight: 800; text-transform: uppercase;
  transition: all 0.3s; text-decoration: none; padding: 10px; border-radius: 8px;
}
.spirit-more-link.moon-text { color: #cbd5e1; background: rgba(255,255,255,0.02); }
.spirit-more-link.moon-text:hover { color: #0f172a; background: #e2e8f0; box-shadow: 0 0 15px rgba(226, 232, 240, 0.5); }

/* PHÂN LOẠI (TAG CLOUD) */
.tag-cloud-spirit { display: flex; flex-wrap: wrap; gap: 12px; }

.tag-pill-spirit {
  padding: 8px 16px; 
  background: rgba(0, 0, 0, 0.3); 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  border-radius: 8px; /* Đổi sang bo góc nhẹ thay vì pill tròn */
  color: #cbd5e1; font-size: 0.85rem; font-weight: 600; text-decoration: none;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.tag-pill-spirit.fire-pill:hover {
  background: rgba(249, 115, 22, 0.15); border-color: #f97316; color: #f97316;
  transform: translateY(-3px) scale(1.05); box-shadow: 0 5px 15px rgba(249, 115, 22, 0.2);
}

.mobile-extra-aura { display: none; }

/* ===== MOBILE OPTIMIZATION ===== */
@media (max-width: 1024px) {
  .content-body-grid { grid-template-columns: 1fr; }
  .sidebar-col-spirit { display: none; }
  .mobile-extra-aura { display: block; margin-top: 30px; }
}

@media (max-width: 640px) {
  .main-content-spirit { padding: 15px 12px 60px; }
  .hero-aura-wrapper { margin-bottom: 30px; border-radius: 16px; }
  .continue-cultivation-area { margin-bottom: 40px; }
  .spirit-block { margin-bottom: 40px; }
  
  .spirit-title { font-size: 1.3rem; }
  .spirit-note { display: none; /* Ẩn note phụ trên mobile cho gọn */ }

  .spirit-grid-responsive { grid-template-columns: repeat(2, 1fr); gap: 16px 12px; }

  .ranking-spirit-list-mobile { padding: 15px; border-radius: 16px; }
}

@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
</style>
