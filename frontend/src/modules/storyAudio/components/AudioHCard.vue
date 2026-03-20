<template>
  <article class="hcard">
    <router-link :to="`/truyen-audio/${story.slug}`" class="hcard__cover-link">
      <img :src="coverUrl" :alt="story.ten_truyen" loading="lazy" />
      <div class="hcard__cover-overlay"></div>
      <span class="hcard__badge">
        <i class="fas fa-headphones"></i>
        Audio
      </span>
    </router-link>

    <div class="hcard__body">
      <h2 class="hcard__title">
        <router-link :to="`/truyen-audio/${story.slug}`">
          {{ story.ten_truyen }}
        </router-link>
      </h2>

      <div class="hcard__meta">
        <span><i class="fas fa-feather-pointed"></i> {{ story.tac_gia || "Tác giả ẩn danh" }}</span>
        <span :class="`status-tag status--${statusClass}`">
          <i class="fas fa-circle"></i> {{ statusLabel }}
        </span>
        <span v-if="chapterCount">
          <i class="far fa-file-lines"></i> {{ chapterCount }} chương
        </span>
      </div>

      <div v-if="genres.length" class="hcard__genres">
        <span
          v-for="genre in genres.slice(0, 6)"
          :key="genre.id_theloai"
          class="genre-pill"
        >
          {{ genre.ten_theloai }}
        </span>
      </div>

      <div class="hcard__footer">
        <div class="hcard__stats">
          <span class="hcard__rating">
            <i class="fas fa-star"></i>
            {{ ratingLabel }}
          </span>
          <span><i class="fas fa-eye"></i> {{ formatViews(story.luot_xem) }}</span>
          <span v-if="formattedDate" class="hcard__date">
            <i class="far fa-clock"></i> {{ formattedDate }}
          </span>
        </div>

        <router-link :to="`/truyen-audio/${story.slug}`" class="listen-btn">
          <i class="fas fa-play-circle"></i>
          Nghe Audio
        </router-link>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getImageUrl } from "@/config/constants";
import type { Story } from "@/modules/storyText/story.service";

const props = defineProps<{ story: Story }>();

const coverUrl = computed(() => {
  if (!props.story.anh_bia) return "https://res.cloudinary.com/dg9ftuhv4/image/upload/v1774000516/h%C3%ACnh_5_clb3fa.jpg";
  if (props.story.anh_bia.startsWith("http")) return props.story.anh_bia;
  return getImageUrl(props.story.anh_bia);
});

const genres = computed(() => props.story.genres || []);
const chapterCount = computed(() => props.story.so_chuong || props.story.so_luong_chuong || 0);

const STATUS_LABELS: Record<string, string> = {
  dang_ra: "Đang ra",
  hoan_thanh: "Hoàn thành",
  ready: "Sẵn sàng",
};

const normalizedStatus = computed(() =>
  String(props.story.trang_thai || props.story.audio_status || "dang_ra")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "_")
    .trim(),
);

const statusLabel = computed(() => STATUS_LABELS[normalizedStatus.value] || (props.story.trang_thai || "Đang ra"));

const statusClass = computed(() => normalizedStatus.value.replace(/_/g, "-"));

const ratingLabel = computed(() => {
  const raw = Number(props.story.avg_rating || props.story.rating || 0);
  return raw ? raw.toFixed(1) : "0.0";
});

const formattedDate = computed(() => {
  if (!props.story.thoi_gian_cap_nhat) return "";
  const date = new Date(props.story.thoi_gian_cap_nhat);
  if (Number.isNaN(date.getTime())) return props.story.thoi_gian_cap_nhat.slice(0, 10);
  return date.toLocaleDateString("vi-VN");
});

const formatViews = (value = 0) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(value);
};
</script>

<style scoped>
.hcard {
  display: flex;
  min-height: 176px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 18px;
  background: rgba(18, 26, 39, 0.75);
  transition: transform 0.22s, border-color 0.22s, box-shadow 0.22s;
}

.hcard:hover {
  transform: translateY(-3px);
  border-color: rgba(91, 196, 232, 0.35);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
}

.hcard__cover-link {
  position: relative;
  flex: 0 0 108px;
  display: block;
  overflow: hidden;
  text-decoration: none;
  background: #0f1623;
}

.hcard__cover-link img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center 16%;
  transition: transform 0.35s ease;
}

.hcard:hover .hcard__cover-link img {
  transform: scale(1.05);
}

.hcard__cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, transparent 54%, rgba(18, 26, 39, 0.92));
}

.hcard__badge {
  position: absolute;
  top: 10px;
  left: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(72, 207, 165, 0.92);
  color: #08111a;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.hcard__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
}

.hcard__title {
  margin: 0;
  overflow: hidden;
  color: #f0f8ff;
  font-size: 0.98rem;
  font-weight: 800;
  line-height: 1.4;
}

.hcard__title a {
  display: -webkit-box;
  overflow: hidden;
  color: inherit;
  text-decoration: none;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  transition: color 0.2s;
}

.hcard__title a:hover {
  color: #74dbf3;
}

.hcard__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  color: var(--app-text-muted, #94a3b8);
  font-size: 0.76rem;
}

.hcard__meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.status-tag {
  font-weight: 700;
}

.status--dang-ra {
  color: #48cfa5;
}

.status--hoan-thanh,
.status--hoan-thành {
  color: #a9ebff;
}

.hcard__genres {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.genre-pill {
  display: inline-flex;
  padding: 3px 9px;
  border: 1px solid rgba(91, 196, 232, 0.2);
  border-radius: 999px;
  background: rgba(91, 196, 232, 0.05);
  color: #a9ebff;
  font-size: 0.72rem;
}

.hcard__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto;
  flex-wrap: wrap;
}

.hcard__stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  color: var(--app-text-subtle, #64748b);
  font-size: 0.76rem;
}

.hcard__stats span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.hcard__rating {
  color: #f59e0b;
  font-weight: 700;
}

.listen-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 9px 16px;
  border-radius: 999px;
  background: linear-gradient(135deg, #48cfa5, #74dbf3);
  color: #08111a;
  font-size: 0.8rem;
  font-weight: 800;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.listen-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(116, 219, 243, 0.3);
}

@media (max-width: 640px) {
  .hcard:hover {
    transform: none;
    border-color: rgba(148, 163, 184, 0.13);
    box-shadow: none;
  }

  .hcard {
    align-items: stretch;
    gap: 12px;
    padding: 12px;
    border-radius: 18px;
    /* Removed light mode overrides to inherit dark theme */
  }

  .hcard__cover-link {
    flex: 0 0 108px;
    width: 108px;
    min-width: 108px;
    border-radius: 14px;
  }

  .hcard:hover .hcard__cover-link img {
    transform: none;
  }

  .hcard__cover-overlay {
    background: linear-gradient(to right, transparent 68%, rgba(0, 0, 0, 0.15));
  }

  .hcard__badge {
    top: 8px;
    left: 8px;
    padding: 4px 8px;
    background: #2bc58a;
    color: #ffffff;
    font-size: 0.62rem;
  }

  .hcard__body {
    gap: 8px;
    padding: 2px 0 0;
  }

  .hcard__title {
    font-size: 1rem;
    line-height: 1.45;
  }

  .hcard__title a:hover {
    color: inherit;
  }

  .hcard__meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    font-size: 0.78rem;
  }

  .status--dang-ra {
    /* Inherit */
  }

  .status--hoan-thanh,
  .status--hoan-thành {
    /* Inherit */
  }

  .hcard__genres {
    display: none;
  }

  .hcard__footer {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .hcard__stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    font-size: 0.8rem;
  }

  .hcard__rating {
    /* Inherit */
  }

  .listen-btn {
    width: 100%;
    justify-content: center;
    padding: 11px 16px;
    box-shadow: none;
  }

  .listen-btn:hover {
    transform: none;
    box-shadow: none;
    color: inherit;
  }
}
</style>
