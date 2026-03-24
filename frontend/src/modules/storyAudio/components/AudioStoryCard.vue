<template>
  <article class="audio-story-card">
    <div class="audio-story-card__cover">
      <img
        :src="coverUrl"
        :srcset="coverSrcSet"
        sizes="(max-width: 640px) 44vw, (max-width: 1200px) 280px, 320px"
        :alt="story.ten_truyen"
        class="cover-image"
        loading="lazy"
        decoding="async"
      />
      <div class="cover-overlay"></div>
      
      <div class="audio-story-card__badges">
        <span class="badge badge--audio"><i class="fas fa-headphones"></i> Audio</span>
        <span class="badge badge--status">{{ story.audio_status || "Sẵn sàng" }}</span>
      </div>
    </div>

    <div class="audio-story-card__body">
      <h3 class="audio-story-card__title">
        <router-link :to="`/truyen-audio/${story.slug}`" :title="story.ten_truyen">
          {{ story.ten_truyen }}
        </router-link>
      </h3>
      
      <div class="audio-story-card__author">
        <i class="fas fa-feather-pointed"></i> {{ story.tac_gia || 'Đang cập nhật' }}
      </div>

      <p class="audio-story-card__desc">
        {{ story.mo_ta || "Truyện đã có bản audio đầy đủ, nhấn để bắt đầu nghe ngay." }}
      </p>

      <div v-if="audioData" class="audio-summary">
        <span><i class="fas fa-list-ul"></i> {{ audioData.audio.total_parts }} phần</span>
        <span><i class="far fa-clock"></i> {{ formatDuration(audioData.audio.total_duration_seconds) }}</span>
      </div>

      <div class="audio-story-card__actions">
        <router-link :to="`/truyen-audio/${story.slug}`" class="btn btn--primary">
          <i class="fas fa-play-circle"></i> Nghe ngay
        </router-link>

        <button
          type="button"
          class="btn btn--secondary btn--icon"
          :disabled="isLoading"
          :title="isExpanded ? 'Đóng preview' : 'Nghe thử'"
          @click="$emit('toggle-preview', story)"
        >
          <i :class="isExpanded ? 'fas fa-chevron-up' : (isLoading ? 'fas fa-spinner fa-spin' : 'fas fa-volume-up')"></i>
        </button>

        <router-link :to="`/truyen-chu/${story.slug}`" class="btn btn--icon" title="Đọc bản chữ">
          <i class="fas fa-book"></i>
        </router-link>
      </div>

      <div v-if="isExpanded && audioData" class="audio-preview">
        <div class="audio-preview__header">
          <strong>{{
            firstPlayablePart?.audio_url
              ? "Đang nghe thử phần đầu"
              : "Chưa có file audio"
          }}</strong>
        </div>

        <audio
          v-if="firstPlayablePart?.audio_url"
          controls
          controlsList="nodownload"
          preload="metadata"
          crossorigin="anonymous"
          class="audio-player"
          :src="firstPlayablePart?.audio_url"
        />

        <p v-else class="audio-preview__hint">
          Truyện này chưa có file audio sẵn sàng để phát.
        </p>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getStoryCoverSrcSet, getStoryCoverUrl } from "@/config/constants";
import type { Story, StoryAudioResponse, AudioPart } from '@/modules/storyAudio/storyAudio.service';

const props = defineProps<{
  story: Story;
  audioData?: StoryAudioResponse | null;
  isExpanded: boolean;
  isLoading: boolean;
}>();

defineEmits<{
  (e: 'toggle-preview', story: Story): void;
}>();

const coverUrl = computed(() => getStoryCoverUrl(props.story.anh_bia, 640));
const coverSrcSet = computed(() => getStoryCoverSrcSet(props.story.anh_bia, [320, 480, 640, 800]));

const firstPlayablePart = computed<AudioPart | null>(() => {
  if (!props.audioData?.audio?.videos?.length) return null;
  for (const video of props.audioData.audio.videos) {
    const playablePart = video.parts.find((part) => !!part.audio_url);
    if (playablePart) return playablePart;
  }
  return null;
});

const formatDuration = (seconds?: number | null) => {
  const totalSeconds = Number(seconds || 0);
  if (!totalSeconds) return "0 phút";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (!hours) return `${minutes || 1} phút`;
  if (!minutes) return `${hours} giờ`;
  return `${hours} giờ ${minutes} phút`;
};
</script>

<style scoped>
.audio-story-card {
  background: rgba(18, 26, 39, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.audio-story-card:hover {
  border-color: rgba(91, 196, 232, 0.4);
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.2);
}

.audio-story-card__cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  background: #0f1623;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 20%;
  transition: transform 0.4s ease;
}

.audio-story-card:hover .cover-image {
  transform: scale(1.05);
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(18, 26, 39, 1) 0%, rgba(18, 26, 39, 0) 70%);
}

.audio-story-card__badges {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 6px;
  z-index: 2;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  backdrop-filter: blur(4px);
}

.badge--audio {
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.badge--status {
  background: rgba(18, 26, 39, 0.8);
  color: #a9ebff;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.audio-story-card__body {
  padding: 16px 20px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.audio-story-card__title {
  margin: 0 0 4px;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.audio-story-card__title a {
  color: #f8fbff;
  text-decoration: none;
  transition: color 0.2s;
}

.audio-story-card__title a:hover {
  color: #74dbf3;
}

.audio-story-card__author {
  font-size: 0.85rem;
  color: #a9ebff;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.audio-story-card__desc {
  margin: 0 0 16px;
  color: var(--app-text-muted);
  font-size: 0.9rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.audio-summary {
  margin-bottom: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  color: var(--app-text-subtle);
  font-size: 0.85rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.audio-summary span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.audio-story-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 700;
  text-decoration: none;
  font-size: 0.85rem;
  border: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn--primary {
  flex: 1;
  background: linear-gradient(135deg, #48cfa5, #5bc4e8);
  color: #08111a;
}
.btn--primary:hover {
  background: linear-gradient(135deg, #5ddeb2, #74dbf3);
  box-shadow: 0 4px 12px rgba(91, 196, 232, 0.2);
}

.btn--secondary {
  background: rgba(91, 196, 232, 0.1);
  color: #dff7ff;
}
.btn--secondary:hover:not(:disabled) {
  background: rgba(91, 196, 232, 0.2);
}
.btn--secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn--icon {
  background: rgba(255, 255, 255, 0.05);
  color: #eff8ff;
  padding: 10px;
  width: 38px;
}
.btn--icon:hover {
  background: rgba(255, 255, 255, 0.15);
}

.audio-preview {
  margin-top: 16px;
  padding: 16px;
  background: rgba(10, 16, 27, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.05);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.audio-preview__header {
  margin-bottom: 12px;
  color: var(--app-text-muted);
  font-size: 0.85rem;
}

.audio-player {
  width: 100%;
  height: 36px;
}

.audio-player::-webkit-media-controls-panel {
  background-color: #d8ebf8;
}

.audio-preview__hint {
  margin: 0;
  color: var(--app-text-subtle);
  font-size: 0.85rem;
  font-style: italic;
}
</style>
