<template>
  <article
    class="hcard"
    :class="{ 'hcard--hero': variant === 'hero' }"
    @mouseenter="warmDetailExperience"
    @focusin="warmDetailExperience"
    @touchstart.passive="warmDetailExperience"
  >
    <router-link :to="`/truyen-audio/${story.slug}`" class="hcard__cover-link">
      <img
        :src="coverUrl"
        :srcset="coverSrcSet"
        sizes="(max-width: 640px) 42vw, (max-width: 1200px) 240px, 320px"
        :alt="story.ten_truyen"
        loading="lazy"
        decoding="async"
      />
      <div class="hcard__cover-overlay"></div>
      <span class="hcard__badge">
        <i class="fas fa-headphones"></i>
        Audio
      </span>
    </router-link>

    <div class="hcard__body">
      <div class="hcard__eyebrow">
        <span class="hcard__kicker">{{ variant === "hero" ? "Tuyển chọn" : "Audio series" }}</span>
        <span :class="`status-tag status--${statusClass}`">
          <i class="fas fa-circle"></i>
          {{ statusLabel }}
        </span>
      </div>

      <h2 class="hcard__title">
        <router-link :to="`/truyen-audio/${story.slug}`">
          {{ story.ten_truyen }}
        </router-link>
      </h2>

      <p class="hcard__desc">
        {{ descriptionText }}
      </p>

      <div class="hcard__meta">
        <span><i class="fas fa-feather-pointed"></i> {{ story.tac_gia || "Tác giả ẩn danh" }}</span>
        <span v-if="formattedDate"><i class="far fa-clock"></i> {{ formattedDate }}</span>
        <span v-if="chapterCount"><i class="far fa-file-lines"></i> {{ chapterCount }} chương</span>
      </div>

      <div v-if="visibleGenres.length" class="hcard__genres">
        <span
          v-for="genre in visibleGenres"
          :key="genre.id_theloai"
          class="genre-pill"
        >
          {{ genre.ten_theloai }}
        </span>
      </div>

      <div class="hcard__audio-meta">
        <span v-if="audioParts">
          <i class="fas fa-list-ul"></i>
          {{ audioParts }} phần
        </span>
        <span v-if="audioDurationLabel">
          <i class="far fa-clock"></i>
          {{ audioDurationLabel }}
        </span>
        <a
          v-if="partnerUrl && partnerName"
          :href="partnerUrl"
          class="hcard__partner"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i class="fab fa-youtube"></i>
          {{ partnerName }}
        </a>
      </div>

      <div class="hcard__footer">
        <router-link :to="`/truyen-audio/${story.slug}`" class="listen-btn">
          <i class="fas fa-play-circle"></i>
          Nghe ngay
        </router-link>

        <router-link :to="`/truyen-audio/${story.slug}`" class="detail-btn">
          Chi tiết
        </router-link>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { getStoryCoverSrcSet, getStoryCoverUrl } from "@/config/constants";
import { prefetchStoryAudioBySlug } from "@/modules/storyAudio/storyAudio.service";
import type { Story } from "@/modules/storyText/story.service";

const props = withDefaults(
  defineProps<{
    story: Story;
    variant?: "default" | "hero";
  }>(),
  {
    variant: "default",
  },
);

const coverUrl = computed(() => {
  return getStoryCoverUrl(props.story.anh_bia, props.variant === "hero" ? 720 : 480);
});

const coverSrcSet = computed(() =>
  getStoryCoverSrcSet(
    props.story.anh_bia,
    props.variant === "hero" ? [360, 480, 640, 720, 960] : [240, 320, 480, 640],
  ),
);

const hasWarmedDetail = ref(false);

const genres = computed(() => props.story.genres || []);
const visibleGenres = computed(() => genres.value.slice(0, props.variant === "hero" ? 4 : 3));
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

const statusLabel = computed(
  () => STATUS_LABELS[normalizedStatus.value] || String(props.story.trang_thai || "Đang ra"),
);
const statusClass = computed(() => normalizedStatus.value.replace(/_/g, "-"));

const rawDescription = computed(() => String(props.story.mo_ta || "").trim());
const descriptionText = computed(() => {
  if (
    rawDescription.value &&
    !/^auto-created from partner audio ingest/i.test(rawDescription.value)
  ) {
    return rawDescription.value;
  }

  if (partnerName.value) {
    return `Bản audio được biên tập để nghe liền mạch, phù hợp khi thư giãn, di chuyển, hoặc muốn theo truyện bằng giọng đọc của kênh ${partnerName.value}.`;
  }

  return "Bản audio được sắp xếp để nghe liền mạch, giữ nhịp truyện gọn gàng và dễ theo dõi ngay trên mọi thiết bị.";
});

const audioParts = computed(() => Number(props.story.audio_total_parts || 0));
const audioDurationLabel = computed(() => formatDuration(props.story.audio_total_duration_seconds));
const partnerName = computed(() => String(props.story.source_partner_name || "").trim());
const partnerUrl = computed(() => String(props.story.source_partner_url || "").trim());

const formattedDate = computed(() => {
  const rawValue = props.story.audio_latest_part_at || props.story.thoi_gian_cap_nhat;
  if (!rawValue) return "";
  const date = new Date(rawValue);
  if (Number.isNaN(date.getTime())) return String(rawValue).slice(0, 10);
  return date.toLocaleDateString("vi-VN");
});

function formatDuration(seconds?: number | null) {
  const totalSeconds = Number(seconds || 0);
  if (!totalSeconds) return "";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (!hours) return `${Math.max(minutes, 1)} phút`;
  if (!minutes) return `${hours} giờ`;
  return `${hours} giờ ${minutes} phút`;
}

function warmDetailExperience() {
  if (hasWarmedDetail.value || !props.story.slug) return;

  hasWarmedDetail.value = true;

  void import("@/modules/storyAudio/views/StoryAudioDetailView.vue");
  void prefetchStoryAudioBySlug(props.story.slug);
}
</script>

<style scoped>
.hcard {
  --audio-card-bg: linear-gradient(135deg, rgba(11, 21, 34, 0.96), rgba(19, 31, 47, 0.9));
  --audio-card-border: rgba(120, 144, 168, 0.16);
  --audio-card-highlight: rgba(98, 214, 194, 0.28);
  --audio-card-text: #f5f7fb;
  --audio-card-muted: #9cb0c2;
  --audio-card-soft: #73869b;
  display: flex;
  gap: 18px;
  min-height: 248px;
  overflow: hidden;
  border: 1px solid var(--audio-card-border);
  border-radius: 24px;
  background: var(--audio-card-bg);
  box-shadow: 0 18px 44px rgba(3, 8, 18, 0.28);
  transition: transform 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease;
}

.hcard:hover {
  transform: translateY(-4px);
  border-color: var(--audio-card-highlight);
  box-shadow: 0 24px 56px rgba(4, 9, 20, 0.34);
}

.hcard--hero {
  min-height: 304px;
  border-color: rgba(216, 179, 106, 0.26);
  box-shadow: 0 24px 64px rgba(5, 10, 22, 0.34);
}

.hcard__cover-link {
  position: relative;
  flex: 0 0 168px;
  overflow: hidden;
  border-radius: 24px 0 0 24px;
  background: #0c121d;
  text-decoration: none;
}

.hcard--hero .hcard__cover-link {
  flex-basis: 210px;
}

.hcard__cover-link img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center 18%;
  transition: transform 0.4s ease;
}

.hcard:hover .hcard__cover-link img {
  transform: scale(1.05);
}

.hcard__cover-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(3, 7, 14, 0.06), rgba(5, 11, 22, 0.46)),
    linear-gradient(90deg, transparent 35%, rgba(11, 21, 34, 0.92));
}

.hcard__badge {
  position: absolute;
  top: 14px;
  left: 14px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border: 1px solid rgba(216, 179, 106, 0.24);
  border-radius: 999px;
  background: rgba(12, 18, 28, 0.78);
  color: #f6dfaa;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  backdrop-filter: blur(10px);
}

.hcard__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px 22px 20px 0;
}

.hcard__eyebrow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.hcard__kicker {
  color: #d1b371;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--audio-card-muted);
  font-size: 0.76rem;
  font-weight: 700;
}

.status--dang-ra {
  color: #61dcc4;
}

.status--hoan-thanh {
  color: #d6e6f6;
}

.status--ready {
  color: #f6dfaa;
}

.hcard__title {
  margin: 0;
  color: var(--audio-card-text);
  font-size: 1.32rem;
  font-weight: 800;
  line-height: 1.36;
}

.hcard--hero .hcard__title {
  font-size: 1.62rem;
}

.hcard__title a {
  display: -webkit-box;
  overflow: hidden;
  color: inherit;
  text-decoration: none;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  transition: color 0.2s ease;
}

.hcard__title a:hover {
  color: #7ddccc;
}

.hcard__desc {
  margin: 0;
  color: var(--audio-card-muted);
  font-size: 0.94rem;
  line-height: 1.72;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.hcard--hero .hcard__desc {
  -webkit-line-clamp: 4;
}

.hcard__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 9px 16px;
  color: var(--audio-card-soft);
  font-size: 0.82rem;
}

.hcard__meta span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.hcard__genres {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.genre-pill {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border: 1px solid rgba(125, 220, 204, 0.15);
  border-radius: 999px;
  background: rgba(125, 220, 204, 0.07);
  color: #bcd7d9;
  font-size: 0.72rem;
  font-weight: 600;
}

.hcard__audio-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: #e3edf8;
  font-size: 0.82rem;
}

.hcard__audio-meta span,
.hcard__partner {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
}

.hcard__partner {
  color: #f3dba4;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;
}

.hcard__partner:hover {
  background: rgba(216, 179, 106, 0.12);
  color: #fff0cb;
}

.hcard__footer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  padding-top: 4px;
  flex-wrap: wrap;
}

.listen-btn,
.detail-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 800;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.listen-btn {
  padding: 0 20px;
  background: linear-gradient(135deg, #62d6c2, #7bc7e8);
  color: #06111d;
  box-shadow: 0 10px 24px rgba(98, 214, 194, 0.18);
}

.listen-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(98, 214, 194, 0.24);
}

.detail-btn {
  padding: 0 18px;
  border: 1px solid rgba(216, 179, 106, 0.22);
  background: rgba(216, 179, 106, 0.06);
  color: #f4ddb0;
}

.detail-btn:hover {
  transform: translateY(-1px);
  background: rgba(216, 179, 106, 0.12);
}

@media (max-width: 900px) {
  .hcard,
  .hcard--hero {
    min-height: 0;
  }

  .hcard__cover-link,
  .hcard--hero .hcard__cover-link {
    flex-basis: 146px;
  }

  .hcard__body {
    padding-right: 18px;
  }
}

@media (max-width: 640px) {
  .hcard,
  .hcard--hero {
    flex-direction: column;
    gap: 0;
  }

  .hcard:hover {
    transform: none;
  }

  .hcard__cover-link,
  .hcard--hero .hcard__cover-link {
    flex-basis: auto;
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 24px 24px 0 0;
  }

  .hcard__body {
    padding: 18px;
  }

  .hcard__title,
  .hcard--hero .hcard__title {
    font-size: 1.18rem;
  }

  .hcard__desc,
  .hcard--hero .hcard__desc {
    -webkit-line-clamp: 3;
  }

  .hcard__audio-meta {
    gap: 8px 10px;
  }

  .hcard__genres .genre-pill:nth-child(n+3) {
    display: none;
  }

  .hcard__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .listen-btn,
  .detail-btn {
    width: 100%;
  }
}
</style>
