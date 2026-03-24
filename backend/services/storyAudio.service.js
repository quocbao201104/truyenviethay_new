const StoryModel = require("../models/story.model");
const { getOrSet } = require("../utils/cache");
const { resolveAudioUrl } = require("../utils/audioUrl");

const STORY_AUDIO_META_CACHE_TTL_SECONDS = 120; // 2 phut
const STORY_AUDIO_PLAYLIST_CACHE_TTL_SECONDS = 1800; // 30 phut

const storyAudioMetaKey = (id) => `storyAudio:meta:id:${id}`;
const storyAudioPlaylistKey = (id) => `storyAudio:playlist:id:${id}`;

const cloneAudioResponse = (payload) => ({
  story: { ...payload.story },
  audio: {
    ...payload.audio,
    videos: Array.isArray(payload.audio?.videos)
      ? payload.audio.videos.map((video) => ({
          ...video,
          parts: Array.isArray(video.parts) ? video.parts.map((part) => ({ ...part })) : [],
        }))
      : [],
  },
  progress: payload.progress ? { ...payload.progress } : null,
});

const buildAudioStoryMeta = async (story) => {
  const partnerId = Number.parseInt(story.source_partner_id, 10);
  const partner = Number.isFinite(partnerId)
    ? await StoryModel.getPartnerById(partnerId)
    : null;

  return {
    id: story.id,
    slug: story.slug,
    ten_truyen: story.ten_truyen,
    tac_gia: story.tac_gia,
    anh_bia: story.anh_bia || null,
    mo_ta: story.mo_ta || null,
    has_audio: !!story.has_audio,
    audio_status: story.audio_status || null,
    source_type: story.source_type || null,
    source_partner_id: story.source_partner_id || null,
    copyright_holder: partner
      ? {
          id: partner.id,
          name: partner.name,
          url: partner.youtube_url || null,
        }
      : null,
  };
};

const buildAudioPlaylist = async (storyId) => {
  const parts = await StoryModel.getAudioPartsByStoryId(storyId);

  const videosMap = new Map();
  for (const part of parts) {
    if (!videosMap.has(part.video_id)) {
      videosMap.set(part.video_id, {
        video_id: part.video_id,
        youtube_video_id: part.youtube_video_id,
        youtube_playlist_id: part.youtube_playlist_id,
        title: part.video_title,
        raw_title: part.video_raw_title,
        video_index: part.video_index,
        duration_seconds: part.video_duration_seconds,
        process_status: part.process_status,
        thumbnail: part.thumbnail,
        parts: [],
      });
    }

    videosMap.get(part.video_id).parts.push({
      id: part.id,
      video_id: part.video_id,
      truyen_id: part.truyen_id,
      part_number: part.part_number,
      audio_url: resolveAudioUrl(part.audio_url, part.r2_key),
      duration: part.duration_seconds,
      created_at: part.created_at,
    });
  }

  const videos = Array.from(videosMap.values());
  const totalDurationSeconds = parts.reduce((sum, part) => sum + (Number(part.duration_seconds) || 0), 0);

  return {
    total_videos: videos.length,
    total_parts: parts.length,
    total_duration_seconds: totalDurationSeconds,
    videos,
  };
};

const buildAudioResponse = async (story, userId) => {
  const [storyMeta, playlist] = await Promise.all([
    getOrSet(
      storyAudioMetaKey(story.id),
      STORY_AUDIO_META_CACHE_TTL_SECONDS,
      () => buildAudioStoryMeta(story),
    ),
    getOrSet(
      storyAudioPlaylistKey(story.id),
      STORY_AUDIO_PLAYLIST_CACHE_TTL_SECONDS,
      () => buildAudioPlaylist(story.id),
    ),
  ]);
  const response = cloneAudioResponse({
    story: storyMeta,
    audio: playlist,
    progress: null,
  });

  if (userId && Number.isFinite(parseInt(userId, 10))) {
    const progress = await StoryModel.getAudioProgressByUserAndStory(userId, story.id);
    response.progress = progress
      ? {
          user_id: progress.user_id,
          truyen_id: progress.truyen_id,
          last_part_id: progress.last_part_id,
          updated_at: progress.updated_at,
          part_number: progress.part_number,
          audio_url: resolveAudioUrl(progress.audio_url, progress.r2_key),
          video_id: progress.video_id,
          youtube_video_id: progress.youtube_video_id,
          video_index: progress.video_index,
        }
      : null;
  }

  return response;
};

module.exports = {
  buildAudioResponse,
};
