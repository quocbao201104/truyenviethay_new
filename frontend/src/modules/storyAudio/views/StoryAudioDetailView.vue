<template>
  <div class="story-audio-detail-page">
    <main v-if="loading" class="audio-detail-container">
      <section class="audio-shell audio-shell--loading">
        <div class="loading-state">
          <i class="fas fa-circle-notch fa-spin"></i>
          <p>Đang tải không gian audio...</p>
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
          Trở về thư viện
        </router-link>

        <section class="stage-shell">
          <div class="stage-feature">
            <div class="stage-cover">
              <img
                :src="coverUrl"
                :alt="audioPayload.story.ten_truyen"
                class="stage-cover__image"
                @error="handleCoverError"
              />
              <div class="stage-cover__overlay"></div>
            </div>

            <div class="stage-center">
              <div class="stage-title-block">
                <span class="stage-kicker">Listening Stage</span>
                <h1>{{ audioPayload.story.ten_truyen }}</h1>

                <div class="stage-meta">
                  <span class="stage-meta__item" title="Tác giả">
                    <i class="fas fa-feather-pointed"></i>
                    <strong>{{ audioPayload.story.tac_gia || "Đang cập nhật" }}</strong>
                  </span>
                  <span class="stage-meta__item" title="Trạng thái">
                    <i class="fas fa-circle-check"></i>
                    <strong>{{ displayAudioStatus }}</strong>
                  </span>
                </div>
              </div>

              <div class="stage-player">
                <div class="stage-player__header">
                  <div class="stage-player__top-row">
                    <span class="panel-label">
                      <i class="fas fa-compact-disc"></i>
                      live
                    </span>
                    <div v-if="currentPart" class="part-duration-badge">
                      <i class="far fa-clock"></i>
                      {{ formatPartDuration(currentPart.duration) }}
                    </div>
                  </div>

                  <div class="now-playing-info">
                    <h2>{{ currentPlaybackContext.title }}</h2>
                    <p class="stage-player__context" :title="currentPlaybackContext.cluster">
                      {{ currentPlaybackContext.cluster }} | {{ currentPlaybackContext.duration }}
                    </p>
                  </div>
                </div>

                <div class="audio-controls-wrapper">
                  <button
                    type="button"
                    class="audio-nav-btn"
                    :disabled="!hasPrevPart"
                    title="Bài trước"
                    @click="playAdjacentPart(-1)"
                  >
                    <i class="fas fa-backward-step"></i>
                  </button>

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

                  <button
                    type="button"
                    class="audio-nav-btn"
                    :disabled="!hasNextPart"
                    title="Bài tiếp theo"
                    @click="playAdjacentPart(1)"
                  >
                    <i class="fas fa-forward-step"></i>
                  </button>
                </div>
              </div>

            </div> <!-- /.stage-center -->

            <section class="panel-card editorial-notes">
              <div class="editorial-notes__header">
                <span class="panel-label">Ghi chú biên tập</span>
                <h3>Mở đầu cho người nghe</h3>
              </div>
              <p class="editorial-notes__description">{{ cleanDescription }}</p>
              <p v-if="copyrightHolder" class="editorial-notes__copyright">
                Bản quyền thuộc về:
                <a
                  class="editorial-notes__copyright-link"
                  :href="copyrightHolder.url || '#'"
                  :target="copyrightHolder.url ? '_blank' : undefined"
                  :rel="copyrightHolder.url ? 'noreferrer' : undefined"
                  @click.prevent="handleCopyrightClick"
                >
                  {{ copyrightHolder.name }}
                </a>
              </p>
            </section>
          </div> <!-- /.stage-feature -->

          <aside class="stage-queue">
            <div class="panel-card playlist-card">
              <div class="playlist-header">
                <div>
                  <span class="panel-label">Danh sách phát</span>
                  <h3>{{ playlistClusters.length }} Quyển</h3>
                </div>
                <router-link
                  :to="`/truyen-chu/${audioPayload.story.slug}`"
                  class="btn-read-top"
                >
                  <i class="fas fa-book-open"></i>
                  Đọc chữ
                </router-link>
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
                    <div class="playlist-group__title">
                      <span class="playlist-group__kicker">Audio Series</span>
                      <strong :title="cluster.fullLabel">{{ cluster.label }}</strong>
                    </div>
                    <span class="playlist-group__summary">
                      <span class="part-count">{{ cluster.parts.length }} tập</span>
                      <span
                        v-if="currentClusterKey === cluster.key"
                        class="playlist-group__status"
                      >
                        live
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
                        <span class="part-item__index">{{ part.part_number }}</span>
                        <div class="part-item__copy">
                          <span class="part-item__title">Tập {{ part.part_number }}</span>
                          <span class="part-item__subtitle">
                            {{
                              currentPart?.id === part.id
                                ? "Đang phát hiện tại"
                                : "Sẵn sàng cho lượt nghe"
                            }}
                          </span>
                        </div>
                        <div class="part-indicator" v-if="currentPart?.id === part.id">
                          <div class="bar"></div>
                          <div class="bar"></div>
                          <div class="bar"></div>
                        </div>
                      </div>
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </aside>
        </section>
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
const fetchRequestId = ref(0);
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
    `Quyển ${video.video_index ?? video.video_id}`
  );
};

const shortenClusterTitle = (title: string, maxLength = 28) => {
  const normalized = title.trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(maxLength - 3, 12)).trim()}...`;
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

const currentCluster = computed<PlaylistCluster | null>(() => {
  if (!currentPart.value) return null;
  return (
    playlistClusters.value.find((cluster) =>
      cluster.parts.some((part) => part.id === currentPart.value?.id),
    ) || null
  );
});

const currentClusterKey = computed(() => currentCluster.value?.key || null);



const currentPlaybackContext = computed(() => ({
  title: currentPartTitle.value,
  duration: currentPart.value ? formatPartDuration(currentPart.value.duration) : "đang cập nhật",
  cluster: currentCluster.value?.fullLabel || "Chưa chọn cụm",
}));

const hasPrevPart = computed(() => currentPartIndex.value > 0);
const hasNextPart = computed(
  () => currentPartIndex.value >= 0 && currentPartIndex.value < flatParts.value.length - 1,
);

const currentPartTitle = computed(() => {
  if (!currentPart.value) return "Chưa chọn tập";
  return `Tập ${currentPart.value.part_number}`;
});

const displayAudioStatus = computed(() => {
  const status = audioPayload.value?.story.audio_status;
  if (!status) return "San sang";

  switch (String(status).toUpperCase()) {
    case "READY":
      return "Sẵn sàng";
    case "COMPLETED":
    case "COMPLETE":
      return "Hoàn thành";
    case "PROCESSING":
      return "Đang xử lý";
    default:
      return String(status);
  }
});

const coverUrl = computed(() => {
  const cover = audioPayload.value?.story.anh_bia;
  if (!cover) return DEFAULT_COVER_URL;
  if (String(cover).startsWith("http")) return String(cover);
  return getImageUrl(cover);
});

const cleanDescription = computed(() => {
  const desc = audioPayload.value?.story.mo_ta?.trim();
  if (!desc || /^Auto-created from partner audio ingest/i.test(desc)) {
    return "Tác phẩm này đang được giới thiệu theo hướng gọn, để người nghe vào truyện nhanh hơn.";
  }
  return desc;
});

const copyrightHolder = computed(() => {
  const holder = audioPayload.value?.story.copyright_holder;
  if (!holder?.name) return null;
  return holder;
});

const handleCopyrightClick = () => {
  if (!copyrightHolder.value?.url) return;
  window.open(copyrightHolder.value.url, "_blank", "noopener,noreferrer");
};

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

const selectPart = async (
  part: AudioPart,
  autoplay = false,
  options: { preservePendingSeek?: boolean; skipPreviousFlush?: boolean } = {},
) => {
  const previousPart = currentPart.value;

  if (!options.skipPreviousFlush && previousPart && previousPart.id !== part.id) {
    flushResumeState(false);
  }

  if (!options.preservePendingSeek) {
    pendingSeekSeconds.value = null;
  }

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
  if (!totalSeconds) return "0 phút";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (!hours) return `${minutes || 1} phút`;
  if (!minutes) return `${hours} giờ`;
  return `${hours} giờ ${minutes} phút`;
};

const formatPartDuration = (seconds?: number | null) => {
  const totalSeconds = Number(seconds || 0);
  if (!totalSeconds) return "đang cập nhật";

  const minutes = Math.floor(totalSeconds / 60);
  const remainSeconds = totalSeconds % 60;
  return `${minutes}:${String(remainSeconds).padStart(2, "0")}`;
};

watch(currentPart, (part) => {
  if (!part) return;

  const cluster = currentCluster.value;

  if (cluster) {
    expandedClusterKey.value = cluster.key;
  }

  if (isRestoringInitialPart.value) return;

  // Defer local resume writes until the new audio source has settled and
  // playback events provide a timestamp for the new part.
  void saveRemoteResume(false);
});

const fetchAudioDetail = async () => {
  const slug = route.params.slug as string;
  if (!slug) return;
  const requestId = ++fetchRequestId.value;

  loading.value = true;
  error.value = "";
  pendingSeekSeconds.value = null;
  flushResumeState(true);
  audioElement.value?.pause();
  currentPart.value = null;
  isPlaying.value = false;
  expandedClusterKey.value = null;

  try {
    const response = await getStoryAudioBySlug(slug);
    if (requestId !== fetchRequestId.value || route.params.slug !== slug) {
      return;
    }

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
      await selectPart(initialPart, false, {
        preservePendingSeek: true,
        skipPreviousFlush: true,
      });
      isRestoringInitialPart.value = false;
    }
  } catch (err: any) {
    if (requestId !== fetchRequestId.value) {
      return;
    }

    error.value = err?.response?.data?.message || "Không thể tải chi tiết truyện audio.";
  } finally {
    if (requestId !== fetchRequestId.value) {
      return;
    }

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

.stage-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 380px);
  gap: 24px;
  align-items: start;
}

.stage-feature {
  display: grid;
  grid-template-columns: clamp(180px, 22vw, 250px) minmax(0, 1fr);
  gap: 28px;
  align-items: start;
  padding: 24px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 28px;
  background:
    radial-gradient(circle at top left, rgba(91, 196, 232, 0.08), transparent 36%),
    rgba(18, 26, 39, 0.62);
  box-shadow: var(--app-shadow-1);
}

.stage-cover {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 24px;
  box-shadow: var(--app-shadow-2);
}

.stage-cover__image {
  width: 100%;
  height: auto;
  max-height: 500px; /* Optional to prevent excessively tall images */
  display: block;
  object-fit: contain;
  object-position: center;
}

.stage-cover__overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, rgba(11, 17, 27, 0.82), transparent 40%),
    linear-gradient(180deg, rgba(91, 196, 232, 0.05), transparent 36%);
}



.stage-center {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.stage-queue {
  min-width: 0;
}

.stage-title-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stage-kicker {
  color: #8af0ca;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
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

.stage-title-block h1 {
  margin: 0;
  color: #f8fbff;
  font-size: clamp(1.8rem, 2.7vw, 2.65rem);
  font-weight: 800;
  line-height: 1.14;
}

.stage-mood {
  margin: 0;
  color: var(--app-text-muted);
  max-width: 52ch;
  font-size: 0.98rem;
  line-height: 1.65;
}

.stage-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  color: #c3d6e4;
  font-size: 0.92rem;
}

.stage-meta__item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
}

.stage-meta__item strong {
  color: #eff8ff;
  font-weight: 700;
}

.stage-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.stage-stat {
  min-width: 140px;
  padding: 16px 18px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  background: rgba(18, 26, 39, 0.6);
}

.stage-stat span {
  display: block;
  margin-bottom: 6px;
  color: var(--app-text-subtle);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stage-stat strong {
  display: block;
  color: #f8fbff;
  font-size: 1.2rem;
}

.stage-player {
  flex: 1;
  min-width: 0;
  padding: 20px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 24px;
  background: rgba(12, 18, 29, 0.72);
  box-shadow: var(--app-shadow-1);
  margin-top: auto;
}

.stage-player__header {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  margin-bottom: 18px;
}

.stage-player__top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.now-playing-info {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  text-align: left;
}

.stage-player__header h2 {
  margin: 0;
  color: #f8fbff;
  font-size: 1.3rem;
  text-align: center;
}

.stage-player__context {
  margin: 0;
  color: var(--app-text-subtle);
  font-size: 0.92rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.audio-controls-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.audio-nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #eff8ff;
  font-size: 1.1rem;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s, color 0.2s;
}

.audio-nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.audio-nav-btn:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-read-top {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 999px;
  background: transparent;
  color: #eff8ff;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}

.btn-read-top:hover {
  background: rgba(255, 255, 255, 0.05);
}

.editorial-notes {
  grid-column: 1 / -1;
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

.now-playing-info h2,
.editorial-notes__header h3,
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

.main-audio-player {
  flex: 1;
  min-width: 0;
  outline: none;
  color-scheme: dark;
}

.editorial-notes__description {
  margin-top: 16px;
  color: var(--app-text-muted);
  line-height: 1.8;
  font-size: 1rem;
}

.editorial-notes__copyright {
  margin-top: 12px;
  color: rgba(148, 163, 184, 0.92);
  font-size: 0.84rem;
  line-height: 1.7;
}

.editorial-notes__copyright-link {
  color: #7dd3fc;
  font-weight: 700;
  text-decoration: none;
}

.editorial-notes__copyright-link:hover {
  color: #bae6fd;
  text-decoration: underline;
}

.playlist-card {
  display: flex;
  flex-direction: column;
  max-height: 800px;
  padding: 24px;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.playlist-header h3 {
  margin-top: 4px;
}

.queue-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  max-width: 220px;
  text-align: right;
}

.queue-summary__eyebrow {
  color: #8af0ca;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.queue-summary strong {
  color: #f8fbff;
  font-size: 1.08rem;
  line-height: 1.3;
}

.queue-summary p {
  margin: 0;
  color: var(--app-text-subtle);
  font-size: 0.82rem;
  line-height: 1.5;
}

.queue-summary__meta {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px 10px;
  color: #bfd4e2;
  font-size: 0.78rem;
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
  align-items: flex-start;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.025);
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.playlist-group__title {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.playlist-group__kicker {
  color: #c7a96b;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.playlist-group__header strong {
  color: #eff8ff;
  font-size: 0.95rem;
  line-height: 1.45;
}

.playlist-group__summary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
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
  gap: 10px;
  margin-top: 12px;
}

.part-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 15px 16px;
  border: 1px solid rgba(148, 163, 184, 0.05);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.018);
  color: var(--app-text-muted);
  cursor: pointer;
  text-align: left;
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s,
    transform 0.2s;
}

.part-item:hover:not(.active) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(148, 163, 184, 0.15);
  color: #eff8ff;
  transform: translateY(-1px);
}

.part-item.active {
  border-color: rgba(91, 196, 232, 0.22);
  background:
    linear-gradient(135deg, rgba(91, 196, 232, 0.12), rgba(72, 207, 165, 0.08)),
    rgba(255, 255, 255, 0.02);
  color: #f0fbff;
}

.part-item__main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.part-item__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: #d8ebf8;
  font-size: 0.88rem;
  font-weight: 800;
  flex: 0 0 auto;
}

.part-item__copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.part-item__title {
  font-size: 0.95rem;
  font-weight: 600;
}

.part-item__subtitle {
  color: var(--app-text-subtle);
  font-size: 0.8rem;
  line-height: 1.4;
}

.part-item__meta {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  color: #bfd4e2;
  font-size: 0.82rem;
  white-space: nowrap;
}

.part-item__playing {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(72, 207, 165, 0.16);
  color: #8af0ca;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
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
  .stage-shell {
    grid-template-columns: minmax(0, 1fr);
  }

  .stage-feature {
    grid-template-columns: minmax(0, 1fr);
    gap: 22px;
    padding: 20px;
  }

  .stage-cover {
    max-width: 280px;
    margin: 0 auto;
  }

  .stage-queue {
    width: 100%;
  }

  .playlist-card {
    max-height: 540px;
  }
}

@media (max-width: 768px) {
  .audio-detail-container {
    padding-bottom: 120px;
  }

  .stage-shell {
    gap: 18px;
  }

  .stage-feature {
    padding: 18px;
    border-radius: 24px;
  }

  .stage-center {
    align-items: center;
    text-align: center;
  }

  .stage-title-block {
    align-items: center;
  }

  .stage-cover {
    max-width: 220px;
    border-radius: 18px;
    margin: 0 auto;
  }

  .stage-meta {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 4px; /* for scrollbar affordance if any */
    justify-content: center;
  }

  .stage-stat {
    flex: 1;
    min-width: calc(50% - 8px);
    padding: 12px;
  }

  .panel-card {
    padding: 20px;
  }

  .stage-player__header {
    align-items: stretch;
    text-align: center;
  }
  
  .now-playing-info {
    align-items: center;
    text-align: center;
  }

  .queue-summary {
    align-items: flex-start;
    max-width: none;
    text-align: left;
  }

  .queue-summary__meta {
    justify-content: flex-start;
  }

  .part-item {
    align-items: flex-start;
  }

  .part-item__meta {
    align-items: flex-end;
  }
}

@media (max-width: 640px) {
  .stage-cover {
    max-width: 160px;
  }

  .stage-title-block h1 {
    font-size: 1.55rem;
  }

  .stage-mood {
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .stage-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin: 8px 0;
  }

  .stage-stat {
    padding: 10px 4px;
    min-width: 0;
  }

  .stage-stat span {
    font-size: 0.65rem;
    margin-bottom: 4px;
    letter-spacing: 0;
  }

  .stage-stat strong {
    font-size: 1rem;
  }

  .stage-player {
    padding: 16px 14px;
    border-radius: 20px;
  }

  .stage-player__header h2 {
    font-size: 1.15rem;
  }

  .part-duration-badge {
    padding: 4px 10px;
    font-size: 0.78rem;
  }

  .hero-actions {
    gap: 16px;
  }

  .hero-btn {
    padding: 10px 16px;
    font-size: 0.9rem;
  }

  .hero-actions-group {
    width: 100%;
    margin-bottom: 4px;
  }

  .panel-card {
    padding: 16px;
  }

  .playlist-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .queue-summary {
    align-items: flex-start;
    text-align: left;
    margin-top: 8px;
    padding-top: 12px;
    border-top: 1px dashed rgba(255, 255, 255, 0.08);
  }

  .queue-summary__meta {
    justify-content: flex-start;
  }

  .part-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 14px;
  }

  .part-item__meta {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .playlist-group__header {
    padding: 12px;
  }
}
</style>
