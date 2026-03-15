<template>
  <div class="favorites-view-container-xianxia">
    
    <main class="main-content">
      <div class="container">
        
        <div class="section-header-aura animate-fadeIn">
          <h2 class="section-title-xianxia">Thần Thức Lạc Ấn</h2>
          <p class="section-subtitle">Những bí tịch đã kết ấn, đồng hành trên đạo lộ tu tiên</p>
          <div class="header-divider-spirit">
            <div class="dot"></div>
          </div>
        </div>

        <div v-if="favoriteStore.loading" class="loading-aura-container">
          <div class="skeleton-grid-xianxia">
            <div v-for="n in 10" :key="n" class="skeleton-pill-card">
              <div class="skeleton-cover-aura"></div>
              <div class="skeleton-info-aura">
                <div class="line"></div>
                <div class="line short"></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="favoriteStore.error" class="state-box-aura error">
          <i class="fas fa-link-slash text-rose-500 opacity-50"></i>
          <p>Lạc ấn đứt đoạn: {{ favoriteStore.error }}</p>
        </div>

        <div v-else-if="favoriteStore.favorites.length === 0" class="state-box-aura empty">
          <i class="fas fa-fingerprint opacity-20"></i>
          <h3>Vô Ấn Lạc Trống</h3>
          <p>Đạo hữu chưa dùng thần thức để phong ấn bất kỳ linh thư nào làm của riêng.</p>
          <router-link to="/the-loai" class="btn-seek-destiny">
            <i class="fas fa-compass-drafting mr-2"></i>
            Tầm Tiên Lộ
          </router-link>
        </div>

        <div v-else class="favorites-spirit-content animate-fadeIn">
          <div class="favorites-grid-xianxia">
            <div v-for="story in favoriteStore.favorites" :key="story.id" class="story-aura-wrapper group">
              <NewStoryCard :story="story" />
              
              <button 
                class="btn-sever-bond" 
                @click.prevent.stop="handleUnfollow(story.id)"
                title="Giải trừ lạc ấn"
              >
                <i class="fas fa-fire-flame-simple"></i>
                <span class="tooltip-aura">Giải Ấn</span>
              </button>
            </div>
          </div>

          <div v-if="favoriteStore.totalPages > 1" class="xianxia-pagination">
            <button 
              class="page-nav-btn" 
              :disabled="!favoriteStore.hasPrevPage"
              @click="favoriteStore.prevPage()"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            
            <div class="page-counter-aura">
              Tầng <span class="current">{{ favoriteStore.pagination.page }}</span> / {{ favoriteStore.totalPages }}
            </div>
            
            <button 
              class="page-nav-btn" 
              :disabled="!favoriteStore.hasNextPage"
              @click="favoriteStore.nextPage()"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useFavoriteStore } from '@/modules/favorite/favorite.store';
import NewStoryCard from '@/modules/storyText/components/NewStoryCard.vue';

const favoriteStore = useFavoriteStore();

onMounted(() => {
  favoriteStore.fetchFavorites();
});

const handleUnfollow = async (storyId: number) => {
  await favoriteStore.toggleFollow(storyId);
  // Optional: Thêm hiệu ứng toast báo giải ấn thành công
};
</script>

<style scoped>
/* ===== CORE THEME XIANXIA ===== */
.favorites-view-container-xianxia {
  min-height: 100vh;
  background: #0b0f19;
  color: #cbd5e1;
  font-family: 'Be Vietnam Pro', sans-serif;
  padding-bottom: 50px;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* ===== HEADER SPIRIT (Tone Tím Thần Thức) ===== */
.section-header-aura {
  text-align: center;
  margin-bottom: 50px;
}

.section-title-xianxia {
  font-size: 2.8rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 4px;
  /* Chuyển sang dải màu Tím Amethyst - Mộng Ảo */
  background: linear-gradient(to right, #a855f7, #ffffff, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 15px rgba(168, 85, 247, 0.4));
}

.section-subtitle {
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-top: 10px;
}

.header-divider-spirit {
  height: 1px;
  width: 240px;
  background: linear-gradient(90deg, transparent, #a855f7, transparent);
  margin: 20px auto;
  position: relative;
}

.header-divider-spirit .dot {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);
  width: 8px; height: 8px; background: #a855f7; box-shadow: 0 0 10px #a855f7;
}

/* ===== FAVORITES GRID ===== */
.favorites-grid-xianxia {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 25px;
  margin-bottom: 50px;
}

.story-aura-wrapper {
  position: relative;
  height: 100%;
}

/* ===== BTN SEVER BOND (GIẢI ẤN) ===== */
.btn-sever-bond {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  /* Màu đỏ của nghiệp hỏa để cảnh báo hủy theo dõi */
  background: rgba(225, 29, 72, 0.15);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(225, 29, 72, 0.4);
  color: #fb7185;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.btn-sever-bond:hover {
  background: #e11d48;
  color: #fff;
  transform: scale(1.15) rotate(15deg);
  box-shadow: 0 0 15px rgba(225, 29, 72, 0.6);
}

.tooltip-aura {
  position: absolute;
  bottom: 110%;
  right: 0;
  background: #0b0f19;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  transform: translateY(5px);
  transition: all 0.2s;
  pointer-events: none;
  border: 1px solid #e11d4840;
}

.btn-sever-bond:hover .tooltip-aura {
  opacity: 1;
  transform: translateY(0);
}

/* ===== EMPTY STATE AURA ===== */
.state-box-aura {
  text-align: center;
  padding: 80px 20px;
  background: #131b2c;
  border-radius: 24px;
  border: 1px solid #1e293b;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}

.state-box-aura i { font-size: 4rem; margin-bottom: 25px; color: #a855f7; }
.state-box-aura.error i { color: #e11d48; }

.btn-seek-destiny {
  display: inline-flex;
  align-items: center;
  padding: 14px 35px;
  margin-top: 30px;
  /* Nút bấm dải màu gradient tím */
  background: linear-gradient(135deg, #a855f7, #7e22ce);
  color: #fff;
  border-radius: 12px;
  font-weight: 800;
  text-transform: uppercase;
  text-decoration: none;
  letter-spacing: 1px;
  box-shadow: 0 10px 20px rgba(168, 85, 247, 0.3);
  transition: all 0.3s;
}

.btn-seek-destiny:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 15px 30px rgba(168, 85, 247, 0.5);
}

/* ===== PAGINATION XIANXIA ===== */
.xianxia-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 25px;
  margin-top: 40px;
}

.page-nav-btn {
  width: 45px;
  height: 45px;
  background: #131b2c;
  border: 1px solid #1e293b;
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.page-nav-btn:hover:not(:disabled) {
  border-color: #a855f7;
  color: #a855f7;
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.3);
}

.page-nav-btn:disabled { opacity: 0.2; cursor: not-allowed; }

.page-counter-aura {
  font-size: 1rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.page-counter-aura .current { color: #a855f7; font-weight: 900; }

/* ===== ANIMATIONS ===== */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn { animation: fadeIn 0.8s ease-out; }

/* Responsive */
@media (max-width: 768px) {
  .section-title-xianxia { font-size: 1.8rem; }
  .favorites-grid-xianxia { grid-template-columns: repeat(2, 1fr); gap: 15px; }
  .btn-sever-bond { width: 30px; height: 30px; font-size: 0.8rem; }
}
</style>