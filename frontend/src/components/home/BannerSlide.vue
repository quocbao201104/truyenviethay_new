<template>
  <div class="banner-slide-aura desktop-only" :class="{ active: isActive }">
    
    <div class="slide-jade-scroll">
      <div class="cover-spirit-wrapper">
        <img :src="coverUrl" class="cover-bg-aura" alt="Background" />
      </div>
      
      <img :src="coverUrl" class="cover-img-spirit" :alt="story.ten_truyen" />

      <div class="info-spirit-wrapper">
        <span class="badge-spirit-suggested">ĐỀ CỬ TUYỆT HẢO</span>
        <h2 class="title-spectral">{{ story.ten_truyen }}</h2>
        <div class="meta-spirit-row">
          <span class="author-tag"><i class="fas fa-feather-alt"></i> {{ story.tac_gia || 'Đang cập nhật' }}</span>
          <span class="view-tag"><i class="fas fa-eye text-emerald-400"></i> {{ formatNumber(story.luot_xem) }} lượt xem</span>
        </div>
        <p class="description-spirit">{{ truncateText(story.mo_ta, 160) }}</p>
        
        <router-link :to="`/truyen-chu/${story.slug}`" class="btn-khai-mon-aura">
          KHAI MÔN TU LUYỆN <i class="fas fa-arrow-right ml-2"></i>
        </router-link>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getImageUrl } from "@/config/constants";

const props = defineProps({
  story: { type: Object, required: true },
  isActive: { type: Boolean, default: false },
  index: { type: Number, default: 0 } // Giữ lại cho an toàn nếu mảng cha cần
});

const coverUrl = computed(() => getImageUrl(props.story.anh_bia));

const formatNumber = (num: number) => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

const truncateText = (text: string, length: number) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Spectral:wght@700;800&family=Be+Vietnam+Pro:wght@400;500;700;800&display=swap");

.banner-slide-aura {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 15px;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.2;
  transform: scale(0.92);
  font-family: 'Be Vietnam Pro', sans-serif;
}
.banner-slide-aura.active { opacity: 1; transform: scale(1); z-index: 10; }

/* Ẩn hoàn toàn component này trên Mobile */
@media (max-width: 1024px) {
  .desktop-only { display: none !important; }
}

/* ===== DESKTOP STYLES ===== */
.slide-jade-scroll {
  position: relative; width: 100%; height: 100%;
  border-radius: 24px; overflow: hidden;
  background-color: #0b0f19;
  border: 1px solid rgba(52, 211, 153, 0.2);
  box-shadow: 0 20px 50px rgba(0,0,0,0.6);
}
.cover-spirit-wrapper { position: absolute; inset: 0; z-index: 1; }
.cover-bg-aura { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: blur(40px) brightness(0.3); opacity: 0.8; }

.cover-img-spirit {
  position: absolute; top: 0; right: 0; width: 60%; height: 100%; object-fit: cover;
  /* Kỹ thuật cắt ảnh Gradient cực đẹp cho banner */
  mask-image: linear-gradient(to right, transparent, black 30%);
  -webkit-mask-image: linear-gradient(to right, transparent, black 30%);
}

.info-spirit-wrapper {
  position: relative; z-index: 10; width: 55%; height: 100%; padding: 50px; display: flex; flex-direction: column;
  justify-content: center; align-items: flex-start; background: linear-gradient(90deg, #0b0f19 0%, rgba(11, 15, 25, 0.85) 65%, transparent 100%);
}

.badge-spirit-suggested {
  background: linear-gradient(135deg, #fbbf24, #d97706); color: #0b0f19;
  padding: 5px 14px; border-radius: 50px; font-size: 0.7rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; box-shadow: 0 0 15px rgba(251, 191, 36, 0.3);
}

.title-spectral {
  font-family: 'Spectral', serif; font-size: 3.2rem; font-weight: 800; color: #fff; line-height: 1.1; margin-bottom: 15px; text-shadow: 0 4px 15px rgba(0,0,0,0.5); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.meta-spirit-row { display: flex; align-items: center; gap: 20px; color: #94a3b8; font-size: 0.95rem; font-weight: 600; margin-bottom: 25px; }
.meta-spirit-row i { margin-right: 5px; }

.description-spirit { font-size: 1.05rem; color: #cbd5e1; line-height: 1.7; margin-bottom: 35px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-shadow: 0 2px 4px rgba(0,0,0,0.8); }

.btn-khai-mon-aura { background: linear-gradient(135deg, #10b981, #34d399); color: #05080f; padding: 14px 35px; border-radius: 12px; font-weight: 800; font-size: 0.9rem; text-decoration: none; transition: all 0.3s; letter-spacing: 1px; box-shadow: 0 6px 20px rgba(52, 211, 153, 0.3); }
.btn-khai-mon-aura:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(52, 211, 153, 0.5); background: linear-gradient(135deg, #34d399, #6ee7b7); }
</style>