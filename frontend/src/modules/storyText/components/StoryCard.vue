<template>
  <router-link :to="`/truyen/${story.slug}`" class="story-card">
    <img
      :src="getImageUrl(story.anh_bia)"
      alt="Bìa truyện"
      class="cover"
      crossorigin="anonymous"
      @error="handleImageError"
    />
    <h3>{{ story.ten_truyen }}</h3>
    <p class="author">✍️ {{ story.tac_gia }}</p>
    <p class="desc">{{ story.mo_ta.slice(0, 100) }}...</p>
    <div class="meta">
      👁 {{ story.luot_xem }} • 🕒 {{ formatDate(story.thoi_gian_cap_nhat) }}
    </div>
  </router-link>
</template>

<script setup>
defineProps({ story: Object });

const getImageUrl = (path) =>
  path.startsWith("http")
    ? path
    : `http://localhost:3000/uploads_img/bia_truyen/${path}`;

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
</script>

<style scoped>
.story-card {
  background: #232635;
  border-radius: 12px;
  padding: 16px;
  color: #fff;
  text-decoration: none;
  transition: 0.2s;
  display: flex;
  flex-direction: column;
}

.story-card:hover {
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
  transform: translateY(-2px);
}

.cover {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}

h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #4caf50;
}

.author {
  font-size: 0.9rem;
  color: #ccc;
}

.desc {
  font-size: 0.85rem;
  margin: 6px 0;
  color: #aaa;
}

.meta {
  font-size: 0.8rem;
  margin-top: auto;
  color: #888;
}
</style>
