<template>
  <router-link :to="`/truyen-chu/${story.slug}`" class="new-story-card">
    <div class="cover-wrapper">
      <img
        :src="story.anh_bia ? getImageUrl(story.anh_bia) : '/img/default-cover.png'"
        :alt="`Bìa truyện ${story.ten_truyen}`"
        class="cover"
        crossorigin="anonymous"
        loading="lazy"
      />
      <div class="overlay">
        <span class="read-more-icon">Đọc ngay</span>
      </div>
      <div class="chapter-badge">
        Chương {{ story.so_chuong || 0 }}
      </div>
    </div>

    <div class="card-content">
      <h3 class="title" :title="story.ten_truyen">{{ story.ten_truyen }}</h3>
      
      <div class="info-row">
        <span class="author-name"><i class="fas fa-pen-nib"></i> {{ story.tac_gia || 'Đang cập nhật' }}</span>
      </div>

      <div class="stats-row">
        <span class="stat"><i class="fas fa-eye"></i> {{ formatNumber(story.luot_xem) }}</span>
        <span class="stat"><i class="fas fa-clock"></i> {{ timeAgo(story.thoi_gian_cap_nhat) }}</span>
      </div>
      
      <div class="tags-row">
         <span :class="['status-tag', getStatusClass(story.trang_thai)]">
          {{ getStatusText(story.trang_thai) }}
        </span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({ story: Object });

const getImageUrl = (path) => {
  if (!path) return '/img/default-cover.png';
  return path.startsWith("http")
    ? path
    : `http://localhost:3000/uploads_img/bia_truyen/${path}`;
};

const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

const timeAgo = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " năm";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ";
    return "Vừa xong";
};

const getStatusText = (status) => {
  switch (status) {
    case 'completed': return 'Full';
    case 'on-going': return 'Đang ra';
    case 'paused': return 'Tạm ngưng';
    default: return 'Đang ra';
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case 'completed': return 'status-completed';
    case 'on-going': return 'status-on-going';
    case 'paused': return 'status-paused';
    default: return 'status-on-going';
  }
};
</script>

<style scoped>
.new-story-card {
  background: #1f2937; /* Darker gray background */
  border-radius: 12px;
  color: #e0e0e0;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.05);
  height: 100%;
}

.new-story-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
}

.cover-wrapper {
  position: relative;
  width: 100%;
  padding-top: 140%; /* 5:7 Aspect Ratio */
  overflow: hidden;
}

.cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.new-story-card:hover .cover {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.new-story-card:hover .overlay {
  opacity: 1;
}

.read-more-icon {
  background-color: #22c55e;
  color: white;
  padding: 8px 16px;
  border-radius: 99px;
  font-weight: 700;
  font-size: 0.85rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  transform: translateY(10px);
  transition: transform 0.3s ease;
}

.new-story-card:hover .read-more-icon {
  transform: translateY(0);
}

.chapter-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.7);
    color: #ffd700;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 700;
    backdrop-filter: blur(4px);
}

.card-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 6px;
}

.title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.4;
  height: 2.8em; /* 2 lines */
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: color 0.2s;
}

.new-story-card:hover .title {
  color: #4ade80;
}

.info-row {
    font-size: 0.8rem;
    color: #9ca3af;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.stats-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: auto; /* Push to bottom */
    padding-top: 8px;
    border-top: 1px solid rgba(255,255,255,0.05);
}

.stat i { margin-right: 4px; }

.status-tag {
    position: absolute;
    top: 8px;
    left: 8px;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.65rem;
    font-weight: 700;
    color: #fff;
    text-transform: uppercase;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.status-completed { background-color: #10b981; }
.status-on-going { background-color: #3b82f6; }
.status-paused { background-color: #ef4444; }

</style>