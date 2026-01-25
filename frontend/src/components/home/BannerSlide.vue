<template>
  <div class="banner-slide" :class="{ active: isActive }">
    <div class="slide-content">
      <div class="cover-wrapper">
        <img
  :src="coverUrl"
  :alt="story.ten_truyen"
  class="cover-bg"
  draggable="false"
/>

<img
  :src="coverUrl"
  :alt="story.ten_truyen"
  class="cover-image"
  draggable="false"
/>
        <div class="overlay"></div>
      </div>
      <div class="info-wrapper">
        <span class="suggested-badge">Đề xuất</span>
        <h2 class="title">{{ story.ten_truyen }}</h2>
        <div class="meta">
          <span class="author"><i class="fas fa-pen-nib"></i> {{ story.tac_gia || 'Đang cập nhật' }}</span>
          <span class="separator">•</span>
          <span class="views"><i class="fas fa-eye"></i> {{ formatNumber(story.luot_xem) }} lượt xem</span>
        </div>
        <p class="description">{{ truncateText(story.mo_ta, 150) }}</p>
        <router-link
  :to="`/truyen-chu/${story.slug}`"
  class="read-now-btn"
  draggable="false"
  @dragstart.prevent
>
  Đọc Ngay <i class="fas fa-arrow-right"></i>
</router-link>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getImageUrl } from "@/config/constants";

const props = defineProps({
  story: {
    type: Object,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

const coverUrl = computed(() => {
  return getImageUrl(props.story.anh_bia);
});

const formatNumber = (num: number) => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const truncateText = (text: string, length: number) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};
</script>

<style scoped>
.banner-slide {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  transition: transform 0.5s ease, opacity 0.5s ease;
  opacity: 0.4;
  transform: scale(0.9);
}

.banner-slide.active {
  opacity: 1;
  transform: scale(1);
  z-index: 10;
}


.slide-content {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  background-color: #2d3748;
}

.cover-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #1a202c;
}

/* Background blurred layer - Keeps the ambiance */
.cover-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(30px) brightness(0.4);
  z-index: 0;
  opacity: 0.8;
}

/* Foreground sharp image - Right aligned with mask */
.cover-image {
  position: absolute;
  top: 0;
  right: 0; /* Align to right */
  width: 65%; /* Take up ~2/3 of width */
  height: 100%;
  object-fit: cover;
  z-index: 1;
  /* Mask to fade left edge into background */
  mask-image: linear-gradient(to right, transparent, black 20%);
  -webkit-mask-image: linear-gradient(to right, transparent, black 20%);
  /* Also fade slightly at top/bottom for "blending" effect if needed, but side mask is key */
}

/* Info Wrapper - Left aligned, overlays the blurred bg */
.info-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%; /* Text takes left half */
  height: 100%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center; /* Center vertically */
  align-items: flex-start; /* Prevent items from stretching */
  z-index: 2; /* Up top */
  /* Gradient from left to help text pop if image bleeds over */
  background: linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
}

.suggested-badge {
  background: #f59e0b;
  color: #fff;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  align-self: flex-start;
  margin-bottom: 16px;
}

.title {
  font-size: 2.5rem; /* Larger title */
  font-weight: 800;
  color: #fff;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
  line-height: 1.1;
}

.meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
  color: #e5e7eb;
  margin-bottom: 20px;
}

.separator {
  color: #6b7280;
}

.description {
  font-size: 1rem;
  color: #d1d5db;
  margin: 0 0 24px 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.read-now-btn {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #4ade80;
  color: #111827;
  padding: 10px 24px;
  border-radius: 99px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s ease;
}

.read-now-btn:hover {
  background: #22c55e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 222, 128, 0.4);
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .banner-slide {
    padding: 0; /* Full width, no side padding */
    height: 100%;
  }

  .slide-content {
    border-radius: 0; /* Remove corners for edge-to-edge feel, or keep small radius if preferred */
    position: relative;
    box-shadow: none;
  }

  /* Full screen cover for mobile */
  .cover-image {
    width: 100%;
    left: 0;
    mask-image: none;
    -webkit-mask-image: none;
    opacity: 0.8; /* Make slightly dark for text contrast */
  }

  .cover-bg {
    display: none; /* Hide blurred bg, just use main image */
  }

  /* Text overlay at bottom */
  .info-wrapper {
    width: 100%;
    height: 100%;
    justify-content: flex-end; /* Push text to bottom */
    background: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%);
    padding: 20px;
    align-items: flex-start;
  }

  .suggested-badge {
    position: absolute;
    top: 20px;
    left: 20px;
    font-size: 0.7rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
  }

  .title {
    font-size: 1.8rem;
    margin-bottom: 8px;
    line-height: 1.2;
    text-shadow: 0 2px 4px rgba(0,0,0,0.8);
  }

  .meta {
    margin-bottom: 16px;
    font-size: 0.85rem;
    opacity: 0.9;
  }

  .description {
    display: none;
  }

  .read-now-btn {
    width: 100%;
    justify-content: center;
    background: rgba(74, 222, 128, 0.9);
    backdrop-filter: blur(4px);
    margin-top: 0;
  }
}
</style>
