<template>
  <div
    @click="navigateToStory"
    @mouseenter="prefetchStory"
    @focus="prefetchStory"
    @touchstart.passive="prefetchStory"
    :class="['xianxia-story-card', { 'xianxia-story-card--rich': variant === 'rich' }]"
    role="link"
    tabindex="0"
  >
    <div class="cover-aura-wrapper">
      <img
        :src="story.anh_bia ? getImageUrl(story.anh_bia, 320) : '/img/default-cover.png'"
        :srcset="buildSrcSet(story.anh_bia)"
        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
        width="200"
        height="280"
        :alt="`Bìa truyện ${story.ten_truyen}`"
        class="story-cover-img"
        crossorigin="anonymous"
        loading="lazy"
        decoding="async"
      />
      
      <div v-if="variant === 'rich'" class="bottom-vignette"></div>

      <div v-if="variant === 'rich'" class="aura-overlay">
        <div class="read-btn-spirit">
          <i class="fas fa-eye-low-vision mr-2"></i>
          Lĩnh Hội
        </div>
      </div>

      <div class="jade-chapter-badge">
        <i class="fas fa-scroll text-[10px] text-sky-400"></i>
        <span>{{ story.chuong_moi || `Chương ${story.so_chuong || story.so_luong_chuong || 0}` }}</span>
      </div>  

      <div :class="['sigil-status', getStatusClass(story.trang_thai)]">
        <i v-if="getStatusClass(story.trang_thai) === 'status-completed'" class="fas fa-circle-check"></i>
        <i v-else-if="getStatusClass(story.trang_thai) === 'status-suggested'" class="fas fa-fire-flame-curved"></i>
        <i v-else :class="['fas fa-atom', { 'animate-spin-slow': animateStatus }]"></i>
        <span class="sigil-text">{{ getStatusText(story.trang_thai) }}</span>
      </div>
    </div>

    <div class="card-spirit-content">
      <h3 class="story-title-main" :title="story.ten_truyen">
        {{ story.ten_truyen }}
      </h3>
      
      <div class="meta-spirit-row">
        <span class="author-spirit">
          <i class="fas fa-feather-pointed"></i> 
          {{ story.tac_gia || 'Ẩn Danh' }}
        </span>
      </div>

      <div class="stats-spirit-footer">
        <div class="stat-spirit">
          <i class="fas fa-eye stat-icon-blue"></i> 
          <span>{{ formatNumber(story.luot_xem) }}</span>
        </div>

        <div class="stat-spirit">
          <i class="fas fa-clock stat-icon-gray"></i>
          <span>{{ timeAgo(story.thoi_gian_cap_nhat) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';
import { getImageUrl } from "@/config/constants";
import { prefetchStoryBySlug, prefetchChaptersByStoryId } from "@/modules/storyText/story.service";

const props = defineProps({
  story: { type: Object, required: true },
  variant: { type: String, default: 'list' },
  animateStatus: { type: Boolean, default: false }
});
const router = useRouter();
let didPrefetch = false;

const navigateToStory = () => {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
    router.push(`/truyen-chu/${props.story.slug}`);
};

const prefetchStory = () => {
  if (didPrefetch) return;
  didPrefetch = true;
  if (props.story?.slug) prefetchStoryBySlug(props.story.slug);
  if (props.story?.id) prefetchChaptersByStoryId(props.story.id);
};

const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
};

const timeAgo = (date) => {
    if (!date) return 'Vừa xong';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " năm";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ";
    return "Mới đây";
};

const getStatusText = (status) => {
  if (!status) return 'Đang Ra';
  const s = status.toLowerCase().trim();
  if (s === 'hoan_thanh' || s.includes('hoàn thành')) return 'Viên Mãn';
  return 'Đang Ra';
};

const getStatusClass = (status) => {
  if (!status) return 'status-on-going';
  const s = status.toLowerCase().trim();
  if (s === 'hoan_thanh' || s.includes('hoàn thành')) return 'status-completed';
  return 'status-on-going';
};

const buildSrcSet = (path) => {
  if (!path) return '';
  const widths = [220, 320, 420];
  return widths.map((w) => getImageUrl(path, w) + ' ' + w + 'w').join(', ');
};
</script>

<style scoped>
/* Import Be Vietnam Pro */
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap");

.xianxia-story-card {
  font-family: 'Be Vietnam Pro', sans-serif;
  background: rgba(15, 23, 42, 0.6); 
  border-radius: 16px;
  color: #f8fafc; /* Ch??? s??ng h??n */
  transition: transform 0.25s ease, opacity 0.25s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(56, 189, 248, 0.15); /* Vi???n B??ng Lam m??? */
  height: 100%;
  cursor: pointer;
  position: relative;
  box-shadow: 0 2px 8px rgba(0,0,0,0.35);
  content-visibility: auto;
  contain-intrinsic-size: 260px 185px;
  contain: layout paint style;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.xianxia-story-card--rich {
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 3px 12px rgba(0,0,0,0.45);
}

@media (hover: hover) {
  .xianxia-story-card:hover {
    transform: translateY(-6px);
    border-color: rgba(56, 189, 248, 0.6);
    will-change: transform;
  }

  .xianxia-story-card:hover .story-cover-img {
    transform: scale(1.03);
    will-change: transform;
  }

  .xianxia-story-card--rich:hover .aura-overlay { opacity: 1; }
  .xianxia-story-card--rich:hover .read-btn-spirit { transform: translateY(0); will-change: transform; }
  .xianxia-story-card:hover .story-title-main { color: #38bdf8; } /* ?????i text hover sang B??ng Lam */
}

.cover-aura-wrapper {
  position: relative;
  width: 100%;
  padding-top: 140%;
  overflow: hidden;
  background: #0b0f19;
}

/* Ảnh chính của truyện */
.story-cover-img {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  
  /* Lấp đầy 100% khung không để lại khoảng trống */
  object-fit: cover; 
  
  /* QUAN TRỌNG: Neo ảnh từ đỉnh trên cùng, giữ trọn vẹn khuôn mặt/đầu nhân vật */
  object-position: top center; 
  
  transition: transform 0.3s ease-out;
  z-index: 1;
}

/* Lưu ý: Nếu đạo hữu có hover zoom ảnh thì phải giữ nguyên z-index */
@media (hover: hover) {
  .xianxia-story-card:hover .story-cover-img {
    transform: scale(1.03); 
  }
}

/* Lớp phủ chân ảnh TỐI ƯU LẠI: Mỏng hơn, chỉ che 30% dưới cùng */
.bottom-vignette {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, transparent 40%);
  pointer-events: none;
  z-index: 1;
}

/* Hover Overlay */
.aura-overlay {
  position: absolute;
  inset: 0;
  background: rgba(2, 6, 23, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 5;
}

.read-btn-spirit {
  background: linear-gradient(135deg, #0ea5e9, #38bdf8); /* Màu Băng Lam */
  color: #020617;
  padding: 8px 20px;
  border-radius: 50px;
  font-weight: 800;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 2px 6px rgba(56, 189, 248, 0.35);
  transform: translateY(10px);
  transition: transform 0.2s ease;
}

/* NGỌC PHIẾN CHƯƠNG (Chapter Badge) */
.jade-chapter-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(15, 23, 42, 0.85); /* Tối ưu nền badge */
  color: #e0f2fe;
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 0.7rem;
  font-weight: 700;
  border: 1px solid rgba(56, 189, 248, 0.3);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.35);
}

.jade-chapter-badge i { color: #38bdf8; }

/* CẢNH GIỚI TAG (Status Sigil - Lệnh Bài) */
.sigil-status {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 10px;
  border-radius: 6px 14px 14px 6px;
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.4);
}

/* Viên Mãn - Ngọc Bích (Giữ nguyên màu xanh lá cho trạng thái hoàn thành) */
.status-completed { 
  background: rgba(16, 185, 129, 0.2); 
  border: 1px solid rgba(16, 185, 129, 0.4); 
  color: #34d399;
  text-shadow: 0 0 5px rgba(52, 211, 153, 0.4);
}

/* Đang Ra - Băng Lam */
.status-on-going { 
  background: rgba(56, 189, 248, 0.2); 
  border: 1px solid rgba(56, 189, 248, 0.4); 
  color: #38bdf8;
  text-shadow: 0 0 5px rgba(56, 189, 248, 0.4);
}

/* Đề Cử - Xích Kim */
.status-suggested { 
  background: rgba(245, 158, 11, 0.2); 
  border: 1px solid rgba(245, 158, 11, 0.4); 
  color: #fbbf24;
  text-shadow: 0 0 5px rgba(251, 191, 36, 0.4);
}

/* NỘI DUNG */
.card-spirit-content {
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 8px;
  background: transparent; /* Kế thừa nền kính mờ của card */
  min-width: 0;
}

.story-title-main {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #ffffff; /* Text trắng tinh cho sáng sủa */
  line-height: 1.4;
  height: 2.8em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: color 0.3s;
  text-shadow: 0 1px 1px rgba(0,0,0,0.35);
}

.author-spirit {
  font-size: 0.8rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.author-spirit i { color: rgba(56, 189, 248, 0.8); font-size: 0.75rem; }

/* Thống kê Footer */
.stats-spirit-footer {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05); /* Đổi sang vạch trắng mờ cho sáng */
}

.stat-spirit {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
}

.stat-icon-blue { color: #38bdf8; }
.stat-icon-gray { color: #64748b; }

.animate-spin-slow { animation: spin 8s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.xianxia-story-card--rich .aura-overlay { backdrop-filter: blur(3px); }
.xianxia-story-card--rich .jade-chapter-badge { backdrop-filter: blur(6px); }
.xianxia-story-card--rich .sigil-status { backdrop-filter: blur(6px); }

@media (max-width: 640px) {
  .xianxia-story-card {
    border-radius: 15px;
  }
  .card-spirit-content {
    padding: 13px 11px;
  }
  .story-title-main { font-size: 0.95rem; }
  .sigil-status { font-size: 0.55rem; padding: 3px 8px; }
  .jade-chapter-badge { font-size: 0.65rem; padding: 3px 10px; }
}
</style>
