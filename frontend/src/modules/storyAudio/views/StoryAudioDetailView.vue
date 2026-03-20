<template>
  <div class="story-audio-detail-page">
    <main v-if="loading" class="audio-detail-container">
      <section class="audio-shell audio-shell--loading">
        <div class="loading-state">
          <i class="fas fa-circle-notch fa-spin"></i>
          <p>Dang tai khong gian audio...</p>
        </div>
      </section>
    </main>

    <main v-else-if="error" class="audio-detail-container">
      <section class="audio-shell audio-shell--error">
        <i class="fas fa-exclamation-circle"></i>
        {{ error }}
      </section>
    </main>

    <main v-else-if="audioPayload" class="audio-detail-container">
      <section class="audio-hero-shell">
        <router-link to="/truyen-audio" class="back-link">
          <i class="fas fa-arrow-left"></i>
          Tro ve thu vien
        </router-link>

        <div class="hero-grid">
          <div class="hero-cover-card">
            <img
              :src="coverUrl"
              :alt="audioPayload.story.ten_truyen"
              class="hero-cover-image"
              @error="handleCoverError"
            />
            <div class="hero-cover-overlay"></div>
          </div>

          <div class="hero-info-card">
            <div class="hero-topline">
              <span class="audio-chip">
                <i class="fas fa-headphones"></i>
                Truyen Audio
              </span>
              <span class="audio-chip audio-chip--soft">
                {{ displayAudioStatus }}
              </span>
            </div>

            <h1>{{ audioPayload.story.ten_truyen }}</h1>

            <p class="hero-author">
              <i class="fas fa-feather-pointed"></i>
              Tac gia:
              <span>{{ audioPayload.story.tac_gia || "Dang cap nhat" }}</span>
            </p>

            <div class="hero-stats">
              <div class="hero-stat">
                <span>So tap</span>
                <strong>{{ flatParts.length }}</strong>
              </div>
              <div class="hero-stat">
                <span>So cum</span>
                <strong>{{ playlistClusters.length }}</strong>
              </div>
              <div class="hero-stat">
                <span>Thoi luong</span>
                <strong>{{ formatDuration(audioPayload.audio.total_duration_seconds) }}</strong>
              </div>
            </div>

            <div class="hero-actions">
              <button
                type="button"
                class="hero-btn hero-btn--primary"
                :disabled="!currentPart"
                @click="togglePlayback"
              >
                <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
                {{ isPlaying ? "Tam dung" : "Nghe ngay" }}
              </button>

              <div class="hero-actions-group">
                <button
                  type="button"
                  class="hero-btn hero-btn--icon"
                  :disabled="!hasPrevPart"
                  title="Bai truoc"
                  @click="playAdjacentPart(-1)"
                >
                  <i class="fas fa-backward-step"></i>
                </button>

                <button
                  type="button"
                  class="hero-btn hero-btn--icon"
                  :disabled="!hasNextPart"
                  title="Bai tiep theo"
                  @click="playAdjacentPart(1)"
                >
                  <i class="fas fa-forward-step"></i>
                </button>
              </div>

              <a
                v-if="currentPart?.audio_url"
                class="hero-btn hero-btn--outline"
                :href="currentPart.audio_url"
                target="_blank"
                rel="noreferrer"
              >
                <i class="fas fa-download"></i>
                Tai MP3
              </a>

              <router-link
                :to="`/truyen-chu/${audioPayload.story.slug}`"
                class="hero-btn hero-btn--outline"
              >
                <i class="fas fa-book-open"></i>
                Doc chu
              </router-link>
            </div>
          </div>
        </div>
      </section>

      <section class="audio-layout">
        <div class="player-panel">
          <div class="panel-card player-card">
            <div class="player-card__header">
              <div class="now-playing-info">
                <span class="panel-label">
                  <i class="fas fa-compact-disc"></i>
                  Dang phat
                </span>
                <h2>{{ currentPartTitle }}</h2>
              </div>

              <div v-if="currentPart" class="part-duration-badge">
                <i class="far fa-clock"></i>
                {{ formatPartDuration(currentPart.duration) }}
              </div>
            </div>

            <div class="audio-player-wrapper">
              <audio
                ref="audioElement"
                class="main-audio-player"
                controls
                controlsList="nodownload"
                preload="metadata"
                crossorigin="anonymous"
                :src="currentPart?.audio_url || ''"
                @play="handlePlay"
                @pause="handlePause"
                @ended="handleEnded"
                @timeupdate="handleTimeUpdate"
                @loadedmetadata="handleLoadedMetadata"
              />
            </div>
          </div>

          <div class="panel-card intro-card">
            <div class="intro-header">
              <span class="panel-label">Gioi thieu</span>
              <h3>Noi dung truyen</h3>
            </div>
            <p class="story-description">{{ cleanDescription }}</p>
          </div>
        </div>

        <aside class="playlist-panel">
          <div class="panel-card playlist-card">
            <div class="playlist-header">
              <div>
                <span class="panel-label">Danh sach phat</span>
                <h3>{{ playlistClusters.length }} cum tap</h3>
              </div>
            </div>

            <div class="playlist-groups">
              <section
                v-for="cluster in playlistClusters"
                :key="cluster.key"
                class="playlist-group"
                :class="{ 'playlist-group--expanded': expandedClusterKey === cluster.key }"
              >
                <button
                  type="button"
                  class="playlist-group__header"
                  @click="toggleCluster(cluster.key)"
                >
                  <strong :title="cluster.fullLabel">{{ cluster.label }}</strong>
                  <span class="playlist-group__summary">
                    <span class="part-count">{{ cluster.parts.length }} tap</span>
                    <span
                      v-if="currentClusterKey === cluster.key"
                      class="playlist-group__status"
                    >
                      Dang nghe
                    </span>
                    <i
                      class="fas fa-chevron-down playlist-group__chevron"
                      :class="{ 'playlist-group__chevron--open': expandedClusterKey === cluster.key }"
                    ></i>
                  </span>
                </button>

                <div v-if="expandedClusterKey === cluster.key" class="playlist-items">
                  <button
                    v-for="part in cluster.parts"
                    :key="part.id"
                    type="button"
                    class="part-item"
                    :class="{ active: currentPart?.id === part.id }"
                    @click="selectPart(part, true)"
                  >
                    <div class="part-item__main">
                      <div class="part-indicator" v-if="currentPart?.id === part.id">
                        <div class="bar"></div>
                        <div class="bar"></div>
                        <div class="bar"></div>
                      </div>
                      <span class="part-item__title">Tap {{ part.part_number }}</span>
                    </div>
                    <span class="part-item__meta">{{ formatPartDuration(part.duration) }}</span>
                  </button>
                </div>
              </section>
            </div>
          </div>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { getImageUrl } from "@/config/constants";
import { useAuthStore } from "@/modules/auth/auth.store";
import {
  getStoryAudioBySlug,
  saveStoryAudioProgress,
  type AudioPart,
  type StoryAudioVideo,
  type StoryAudioResponse,
} from "@/modules/storyAudio/storyAudio.service";

const route = useRoute();
const authStore = useAuthStore();

const DEFAULT_COVER_URL =
  "https://res.cloudinary.com/dg9ftuhv4/image/upload/v1774000516/h%C3%ACnh_5_clb3fa.jpg";
const RESUME_STORAGE_PREFIX = "storyAudioResume";
const LOCAL_PROGRESS_MIN_SECONDS = 3;

type PlaylistCluster = {
  key: string;
  label: string;
  fullLabel: string;
  parts: AudioPart[];
};

type LocalAudioResume = {
  partId: number;
  currentTime: number;
  updatedAt: string;
};

const loading = ref(false);
const error = ref("");
const audioPayload = ref<StoryAudioResponse | null>(null);
const currentPart = ref<AudioPart | null>(null);
const isPlaying = ref(false);
const audioElement = ref<HTMLAudioElement | null>(null);
const expandedClusterKey = ref<string | null>(null);
const pendingSeekSeconds = ref<number | null>(null);
const lastRemoteSavedPartId = ref<number | null>(null);
const isRestoringInitialPart = ref(false);
const beforeUnloadListener = () => {
  flushResumeState();
};
const visibilityListener = () => {
  if (document.visibilityState === "hidden") {
    flushResumeState();
  }
};

const flatParts = computed(
  () => audioPayload.value?.audio.videos.flatMap((video) => video.parts) || [],
);

const getClusterSourceTitle = (video: StoryAudioVideo) => {
  return (
    video.title?.trim() ||
    video.raw_title?.trim() ||
    `Cum ${video.video_index ?? video.video_id}`
  );
};

const shortenClusterTitle = (title: string, maxLength = 28) => {
  const normalized = title.trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(maxLength - 9, 12)).trim()} {......}`;
};

const playlistClusters = computed<PlaylistCluster[]>(() => {
  const videos = audioPayload.value?.audio.videos || [];
  return videos
    .filter((video) => Array.isArray(video.parts) && video.parts.length > 0)
    .map((video) => {
      const fullLabel = getClusterSourceTitle(video);
      return {
        key: `video-${video.video_id}`,
        label: shortenClusterTitle(fullLabel),
        fullLabel,
        parts: video.parts,
      };
    });
});

const currentPartIndex = computed(() =>
  flatParts.value.findIndex((part) => part.id === currentPart.value?.id),
);

const currentClusterKey = computed(() => {
  if (!currentPart.value) return null;
  return (
    playlistClusters.value.find((cluster) =>
      cluster.parts.some((part) => part.id === currentPart.value?.id),
    )?.key || null
  );
});

const hasPrevPart = computed(() => currentPartIndex.value > 0);
const hasNextPart = computed(
  () => currentPartIndex.value >= 0 && currentPartIndex.value < flatParts.value.length - 1,
);

const currentPartTitle = computed(() => {
  if (!currentPart.value) return "Chua chon tap";
  return `Tap ${currentPart.value.part_number}`;
});

const displayAudioStatus = computed(() => {
  const status = audioPayload.value?.story.audio_status;
  if (!status) return "San sang";
  if (status === "READY") return "Tron bo";
  return status;
});

const coverUrl = computed(() => {
  const cover = audioPayload.value?.story.anh_bia;
  if (!cover) return DEFAULT_COVER_URL;
  if (String(cover).startsWith("http")) return String(cover);
  return getImageUrl(cover);
});

const cleanDescription = computed(() => {
  const desc = audioPayload.value?.story.mo_ta;
  if (!desc) return "Chua co loi tua cho tac pham nay.";
  if (
    desc.includes("Duoc tao tu dong tu du lieu am thanh") ||
    desc.includes("Duoc tao tu du lieu am thanh")
  ) {
    return "Chua co loi tua cho tac pham nay.";
  }
  return desc;
});

const resumeStorageKey = computed(() => {
  const storyId = audioPayload.value?.story.id;
  if (!storyId) return null;
  const identity = authStore.user?.id || (authStore.token ? "auth" : "guest");
  return `${RESUME_STORAGE_PREFIX}:${identity}:${storyId}`;
});

const readLocalResume = (): LocalAudioResume | null => {
  if (!resumeStorageKey.value || typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(resumeStorageKey.value);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as LocalAudioResume;
    if (!parsed?.partId || typeof parsed.currentTime !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
};

const saveLocalResume = (force = false) => {
  if (!resumeStorageKey.value || !currentPart.value || !audioElement.value || typeof window === "undefined") {
    return;
  }

  const currentTime = Math.max(0, Math.floor(audioElement.value.currentTime || 0));
  if (!force && currentTime < LOCAL_PROGRESS_MIN_SECONDS) return;

  const payload: LocalAudioResume = {
    partId: currentPart.value.id,
    currentTime,
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(resumeStorageKey.value, JSON.stringify(payload));
};

const saveRemoteResume = async (force = false) => {
  if (!authStore.token || !audioPayload.value?.story.id || !currentPart.value) return;
  if (!force && lastRemoteSavedPartId.value === currentPart.value.id) return;

  try {
    await saveStoryAudioProgress(audioPayload.value.story.id, currentPart.value.id);
    lastRemoteSavedPartId.value = currentPart.value.id;
  } catch {
    // Keep playback smooth even if saving progress fails.
  }
};

function flushResumeState(forceRemote = false) {
  saveLocalResume(true);
  void saveRemoteResume(forceRemote);
}

const handleCoverError = (event: Event) => {
  const image = event.target as HTMLImageElement | null;
  if (!image) return;
  image.src = DEFAULT_COVER_URL;
};

const toggleCluster = (clusterKey: string) => {
  expandedClusterKey.value = expandedClusterKey.value === clusterKey ? null : clusterKey;
};

const selectPart = async (part: AudioPart, autoplay = false) => {
  currentPart.value = part;
  isPlaying.value = false;

  await nextTick();

  if (autoplay && audioElement.value) {
    try {
      await audioElement.value.play();
      isPlaying.value = true;
    } catch {
      isPlaying.value = false;
    }
  }
};

const playAdjacentPart = async (delta: number) => {
  const nextIndex = currentPartIndex.value + delta;
  const nextPart = flatParts.value[nextIndex];
  if (!nextPart) return;
  pendingSeekSeconds.value = null;
  await selectPart(nextPart, true);
};

const togglePlayback = async () => {
  if (!audioElement.value || !currentPart.value) return;

  if (audioElement.value.paused) {
    try {
      await audioElement.value.play();
      isPlaying.value = true;
    } catch {
      isPlaying.value = false;
    }
    return;
  }

  audioElement.value.pause();
  isPlaying.value = false;
};

const handlePlay = () => {
  isPlaying.value = true;
};

const handlePause = () => {
  isPlaying.value = false;
  flushResumeState(false);
};

const handleTimeUpdate = () => {
  saveLocalResume(false);
};

const handleLoadedMetadata = () => {
  if (!audioElement.value || pendingSeekSeconds.value == null) return;

  const duration = Number(audioElement.value.duration || 0);
  const safeTime =
    duration > 1
      ? Math.min(Math.max(pendingSeekSeconds.value, 0), Math.max(duration - 1, 0))
      : Math.max(pendingSeekSeconds.value, 0);

  if (safeTime > 0) {
    audioElement.value.currentTime = safeTime;
  }

  pendingSeekSeconds.value = null;
};

const handleEnded = () => {
  isPlaying.value = false;
  flushResumeState(false);
  if (hasNextPart.value) {
    void playAdjacentPart(1);
  }
};

const formatDuration = (seconds?: number | null) => {
  const totalSeconds = Number(seconds || 0);
  if (!totalSeconds) return "0 phut";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (!hours) return `${minutes || 1} phut`;
  if (!minutes) return `${hours} gio`;
  return `${hours} gio ${minutes} phut`;
};

const formatPartDuration = (seconds?: number | null) => {
  const totalSeconds = Number(seconds || 0);
  if (!totalSeconds) return "dang cap nhat";

  const minutes = Math.floor(totalSeconds / 60);
  const remainSeconds = totalSeconds % 60;
  return `${minutes}:${String(remainSeconds).padStart(2, "0")}`;
};

watch(currentPart, (part) => {
  if (!part) return;

  const cluster = playlistClusters.value.find((item) =>
    item.parts.some((clusterPart) => clusterPart.id === part.id),
  );

  if (cluster) {
    expandedClusterKey.value = cluster.key;
  }

  if (isRestoringInitialPart.value) return;

  saveLocalResume(true);
  void saveRemoteResume(false);
});

const fetchAudioDetail = async () => {
  const slug = route.params.slug as string;
  if (!slug) return;

  loading.value = true;
  error.value = "";
  pendingSeekSeconds.value = null;

  try {
    const response = await getStoryAudioBySlug(slug);
    audioPayload.value = response;
    lastRemoteSavedPartId.value = response.progress?.last_part_id || null;

    const localResume = readLocalResume();
    const backendUpdatedAt = response.progress?.updated_at
      ? new Date(response.progress.updated_at).getTime()
      : 0;
    const localUpdatedAt = localResume?.updatedAt ? new Date(localResume.updatedAt).getTime() : 0;

    let initialPart =
      flatParts.value.find((part) => part.id === response.progress?.last_part_id) ||
      flatParts.value[0] ||
      null;

    if (localResume) {
      const localPart = flatParts.value.find((part) => part.id === localResume.partId) || null;

      if (localPart && localUpdatedAt >= backendUpdatedAt) {
        initialPart = localPart;
        pendingSeekSeconds.value = localResume.currentTime;
      } else if (localPart && response.progress?.last_part_id === localResume.partId) {
        pendingSeekSeconds.value = localResume.currentTime;
      }
    }

    expandedClusterKey.value =
      playlistClusters.value.find((cluster) =>
        cluster.parts.some((part) => part.id === initialPart?.id),
      )?.key ||
      playlistClusters.value[0]?.key ||
      null;

    if (initialPart) {
      isRestoringInitialPart.value = true;
      await selectPart(initialPart, false);
      isRestoringInitialPart.value = false;
    }
  } catch (err: any) {
    error.value = err?.response?.data?.message || "Khong the tai chi tiet truyen audio.";
  } finally {
    isRestoringInitialPart.value = false;
    loading.value = false;
  }
};

onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", beforeUnloadListener);
  }

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", visibilityListener);
  }
});

onBeforeUnmount(() => {
  flushResumeState();
  if (typeof window !== "undefined") {
    window.removeEventListener("beforeunload", beforeUnloadListener);
  }
  if (typeof document !== "undefined") {
    document.removeEventListener("visibilitychange", visibilityListener);
  }
});

watch(
  () => route.params.slug,
  () => {
    void fetchAudioDetail();
  },
  { immediate: true },
);
</script>

<style scoped>
.story-audio-detail-page {
  min-height: 100vh;
  color: var(--app-text);
  background: #0b111b;
  position: relative;
}

.story-audio-detail-page::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 500px;
  background:
    radial-gradient(circle at top left, rgba(91, 196, 232, 0.08), transparent 50%),
    linear-gradient(180deg, rgba(18, 26, 39, 0.5) 0%, #0b111b 100%);
  pointer-events: none;
  z-index: 0;
}

.audio-detail-container {
  position: relative;
  z-index: 1;
  max-width: 1320px;
  margin: 0 auto;
  padding: 32px 20px 80px;
}

.audio-shell {
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(18, 26, 39, 0.8);
  padding: 40px;
  text-align: center;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--app-text-muted);
}

.loading-state i {
  font-size: 2rem;
  color: #74dbf3;
}

.audio-shell--error {
  color: #ffd6d6;
  border-color: rgba(223, 120, 135, 0.28);
  background: rgba(223, 120, 135, 0.05);
}

.audio-hero-shell {
  margin-bottom: 32px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--app-text-muted);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 700;
}

.hero-grid {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 32px;
}

.hero-cover-card {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  aspect-ratio: 3 / 4;
  box-shadow: var(--app-shadow-2);
}

.hero-cover-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
}

.hero-cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(11, 17, 27, 0.8), transparent 40%);
}

.hero-info-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 0;
}

.hero-topline {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.audio-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(72, 207, 165, 0.15);
  color: #8af0ca;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
}

.audio-chip--soft {
  background: rgba(91, 196, 232, 0.15);
  color: #a9ebff;
}

.hero-info-card h1 {
  margin-bottom: 12px;
  color: #f8fbff;
  font-size: clamp(1.45rem, 2.7vw, 2.15rem);
  font-weight: 800;
  line-height: 1.2;
}

.hero-author {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  color: var(--app-text-muted);
  font-size: 1rem;
}

.hero-author span {
  color: #d8ebf8;
  font-weight: 700;
}

.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 32px;
}

.hero-stat {
  min-width: 130px;
  padding: 16px 20px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  background: rgba(18, 26, 39, 0.6);
}

.hero-stat span {
  display: block;
  margin-bottom: 6px;
  color: var(--app-text-subtle);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.hero-stat strong {
  display: block;
  color: #f8fbff;
  font-size: 1.2rem;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.hero-actions-group {
  display: flex;
  gap: 8px;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.hero-btn--primary {
  padding: 12px 28px;
  background: linear-gradient(135deg, #48cfa5, #74dbf3);
  color: #08111a;
}

.hero-btn--icon {
  width: 50px;
  height: 50px;
  padding: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: #eff8ff;
  font-size: 1.1rem;
}

.hero-btn--outline {
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: transparent;
  color: #eff8ff;
}

.hero-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.audio-layout {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.player-panel {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.playlist-panel {
  width: 400px;
  flex: 0 0 400px;
}

.panel-card {
  padding: 28px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 24px;
  background: rgba(18, 26, 39, 0.7);
  box-shadow: var(--app-shadow-1);
}

.panel-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  color: #74dbf3;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.player-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.now-playing-info h2,
.intro-header h3,
.playlist-header h3 {
  margin: 0;
  color: #f8fbff;
}

.now-playing-info h2 {
  font-size: 1.35rem;
}

.part-duration-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(91, 196, 232, 0.1);
  color: #a9ebff;
  font-size: 0.85rem;
  font-weight: 700;
}

.audio-player-wrapper {
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.05);
  border-radius: 16px;
  background: rgba(10, 16, 27, 0.5);
}

.main-audio-player {
  width: 100%;
  outline: none;
  color-scheme: dark;
}

.story-description {
  margin-top: 16px;
  color: var(--app-text-muted);
  line-height: 1.8;
  font-size: 1rem;
}

.playlist-card {
  display: flex;
  flex-direction: column;
  max-height: 800px;
  padding: 24px;
}

.playlist-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.playlist-groups {
  overflow-y: auto;
  padding-right: 8px;
}

.playlist-groups::-webkit-scrollbar {
  width: 6px;
}

.playlist-groups::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.playlist-groups::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 10px;
}

.playlist-group {
  margin-bottom: 14px;
}

.playlist-group:last-child {
  margin-bottom: 0;
}

.playlist-group__header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.playlist-group__header strong {
  color: #eff8ff;
  font-size: 0.95rem;
}

.playlist-group__summary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.playlist-group__chevron {
  transition: transform 0.2s ease;
}

.playlist-group__chevron--open {
  transform: rotate(180deg);
}

.playlist-group--expanded .playlist-group__header {
  border-color: rgba(91, 196, 232, 0.22);
  background: rgba(91, 196, 232, 0.06);
}

.part-count {
  color: var(--app-text-subtle);
  font-size: 0.85rem;
}

.playlist-group__status {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(72, 207, 165, 0.16);
  color: #8af0ca;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.playlist-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.part-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border: 1px solid rgba(148, 163, 184, 0.05);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  color: var(--app-text-muted);
  cursor: pointer;
  text-align: left;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.part-item:hover:not(.active) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(148, 163, 184, 0.15);
  color: #eff8ff;
}

.part-item.active {
  border-color: rgba(91, 196, 232, 0.3);
  background: rgba(91, 196, 232, 0.1);
  color: #74dbf3;
}

.part-item__main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.part-item__title {
  font-size: 0.95rem;
  font-weight: 600;
}

.part-item__meta {
  opacity: 0.8;
  font-size: 0.85rem;
}

.part-indicator {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 12px;
}

.part-indicator .bar {
  width: 3px;
  height: 3px;
  border-radius: 2px;
  background-color: #74dbf3;
}

.part-indicator .bar:nth-child(2) {
  height: 8px;
}

.part-indicator .bar:nth-child(3) {
  height: 12px;
}

@media (max-width: 1100px) {
  .audio-layout {
    flex-direction: column;
  }

  .playlist-panel {
    width: 100%;
    flex: auto;
  }

  .playlist-card {
    max-height: 540px;
  }
}

@media (max-width: 768px) {
  .audio-detail-container {
    padding-bottom: 120px;
  }

  .hero-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .hero-cover-card {
    max-width: 180px;
    margin: 0 auto;
    border-radius: 16px;
  }

  .hero-info-card {
    text-align: center;
  }

  .hero-topline,
  .hero-author,
  .hero-stats,
  .hero-actions {
    justify-content: center;
  }

  .hero-author {
    flex-wrap: wrap;
  }

  .hero-stat {
    flex: 1;
    min-width: calc(50% - 8px);
    padding: 12px;
  }

  .hero-actions {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .hero-btn--primary {
    width: 100%;
    grid-column: 1 / -1;
  }

  .hero-actions-group {
    grid-column: 1 / -1;
    justify-content: center;
    gap: 24px;
    padding: 8px 0;
  }

  .hero-btn--outline {
    width: 100%;
    justify-content: center;
  }

  .panel-card {
    padding: 20px;
  }

  .player-card__header {
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
  }
}
</style>
