import axios from "@/utils/axios";
import { cachedGet } from "@/utils/requestCache";
import {
  getPublicStories,
  type PublicStoriesParams,
  type Story,
} from "@/modules/storyText/story.service";

export interface AudioPart {
  id: number;
  video_id: number;
  truyen_id: number;
  part_number: number;
  audio_url: string;
  duration?: number | null;
  created_at?: string;
}

export interface StoryAudioVideo {
  video_id: number;
  youtube_video_id?: string | null;
  youtube_playlist_id?: string | null;
  title?: string | null;
  raw_title?: string | null;
  video_index?: number | null;
  duration_seconds?: number | null;
  process_status?: string | null;
  thumbnail?: string | null;
  parts: AudioPart[];
}

export interface StoryAudioResponse {
  story: {
    id: number;
    slug: string;
    ten_truyen: string;
    tac_gia: string;
    anh_bia?: string | null;
    mo_ta?: string | null;
    has_audio: boolean;
    audio_status?: string | null;
    source_type?: string | null;
    source_partner_id?: string | number | null;
  };
  audio: {
    total_videos: number;
    total_parts: number;
    total_duration_seconds: number;
    videos: StoryAudioVideo[];
  };
  progress?: {
    user_id: number;
    truyen_id: number;
    last_part_id: number;
    updated_at?: string;
    part_number?: number | null;
    current_time_seconds?: number | null;
    audio_url?: string | null;
    video_id?: number | null;
    youtube_video_id?: string | null;
    video_index?: number | null;
  } | null;
}

export const getAudioStories = async ({
  page = 1,
  limit = 12,
  sort_by = "thoi_gian_cap_nhat",
  order = "DESC",
}: PublicStoriesParams = {}) => {
  return await getPublicStories({
    page,
    limit,
    sort_by,
    order,
    has_audio: true,
  });
};

export const getStoryAudioBySlug = async (slug: string): Promise<StoryAudioResponse> => {
  return await cachedGet<StoryAudioResponse>(
    `/api/truyen/slug/${slug}/audio`,
    {},
    { ttlMs: 60000, dedupe: true, abortKey: `storyAudio:${slug}` },
  );
};

export const getStoryAudioById = async (id: number): Promise<StoryAudioResponse> => {
  return await cachedGet<StoryAudioResponse>(
    `/api/truyen/${id}/audio`,
    {},
    { ttlMs: 60000, dedupe: true, abortKey: `storyAudio:${id}` },
  );
};

export const saveStoryAudioProgress = async (storyId: number, lastPartId: number) => {
  return await axios.post<{ success: boolean; progress: StoryAudioResponse["progress"] }>(
    `/api/truyen/${storyId}/audio-progress`,
    {
      last_part_id: lastPartId,
    },
  );
};

export type { Story };
