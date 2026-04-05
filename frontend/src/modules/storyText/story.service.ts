import axios from "@/utils/axios";
import { cachedGet, prefetchGet } from "@/utils/requestCache";

// TypeScript Interfaces
export interface Chapter {
  id: number;
  truyen_id: number;
  ten_chuong: string;
  slug: string;
  content_url?: string;
  so_chuong: number;
  truyen?: {
    id: number;
    ten_truyen: string;
    slug: string;
  };
}

export interface ChapterListResponse {
  chapters: Chapter[];
}

// Reuse or import Story interface if available globally
export interface Story {
  id: number;
  ten_truyen: string;
  slug: string;
  anh_bia: string;
  tac_gia: string;
  mo_ta: string;
  luot_xem: number;
  luot_xem_thang?: number;
  luot_xem_tuan?: number;
  luot_xem_ngay?: number;
  trang_thai: string;
  thoi_gian_cap_nhat: string;
  the_loai_chinh?: string;
  luot_thich?: number;
  luot_theo_doi?: number;
  rating?: number;
  rating_count?: number;
  hot_score?: number;
  user_id?: number;
  author_id?: number;
  genres?: Array<{
    id_theloai: number;
    ten_theloai: string;
  }>;
  genre_names?: string;
  so_luong_chuong?: number;
  so_chuong?: number;
  avg_rating?: number | string;
  total_ratings?: number;
  /** Khi đăng nhập: backend trả thêm */
  is_followed?: boolean;
  last_read_chuong_id?: number | null;
  badge?: any;
  equipped_frame?: any;
  has_audio?: boolean;
  audio_status?: string | null;
  source_type?: string | null;
  source_partner_id?: string | number | null;
  audio_total_parts?: number;
  audio_total_series?: number;
  audio_total_duration_seconds?: number;
  audio_latest_part_at?: string | null;
  source_partner_name?: string | null;
  source_partner_url?: string | null;
}

export interface PublicStoriesParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  order?: "ASC" | "DESC" | string;
  keyword?: string;
  category_ids?: number[] | string | null;
  author_id?: number | null;
  trang_thai?: string;
  min_days_ago?: number | null;
  has_audio?: boolean | number | null;
  require_text_chapters?: boolean | number | null;
  skip_request_cache?: boolean;
}


export interface AdminStoriesParams {
  page?: number;
  limit?: number;
  trang_thai_kiem_duyet?: string;
  keyword?: string;
  author_id?: number | null;
  category_id?: number | null;
  has_audio?: boolean | number | null;
  require_text_chapters?: boolean | number | null;
}

// --- Chapter APIs ---

export const getChapterBySlug = async (
  slug: string,
  storySlug: string,
): Promise<Chapter> => {
  return await cachedGet<Chapter>(
    `/api/chuong/slug/${storySlug}/${slug}`,
    {},
    { ttlMs: 60000, dedupe: true, abortKey: `chapter:${storySlug}:${slug}` },
  );
};

export const getChaptersByStoryId = async (
  storyId: number,
  page = 1,
  limit = 1000,
): Promise<ChapterListResponse> => {
  return await cachedGet<ChapterListResponse>(
    `/api/chuong/truyen/${storyId}`,
    { params: { page, limit } },
    { ttlMs: 60000, dedupe: true, abortKey: `chapters:${storyId}` },
  );
};

// --- Story APIs (Merged from legacy) ---

export const getPublicStories = async ({
  page = 1,
  limit = 20,
  sort_by = "thoi_gian_cap_nhat",
  order = "DESC",
  keyword = "",
  category_ids = null,
  author_id = null,
  trang_thai = "",
  min_days_ago = null,
  has_audio = null,
  require_text_chapters = null,
  skip_request_cache = false,
}: PublicStoriesParams = {}) => {
  const normalizedCategoryIds = Array.isArray(category_ids)
    ? category_ids.join(",")
    : (category_ids ?? "");
  const params = {
    page,
    limit,
    sort_by,
    order,
    keyword,
    category_ids: normalizedCategoryIds || undefined,
    author_id,
    trang_thai,
    min_days_ago,
    has_audio,
    require_text_chapters,
  };

  if (skip_request_cache) {
    const response = await axios.get(`/api/truyen/public`, { params });
    return response.data;
  }

  const abortKey = `publicStories:${page}:${limit}:${sort_by}:${order}:${keyword}:${normalizedCategoryIds}:${author_id ?? ""}:${trang_thai ?? ""}:${min_days_ago ?? ""}:${has_audio ?? ""}:${require_text_chapters ?? ""}`;
  return await cachedGet<any>(
    `/api/truyen/public`,
    { params },
    { ttlMs: 30000, dedupe: true, abortKey },
  );
};

export const prefetchPublicStories = async ({
  page = 1,
  limit = 20,
  sort_by = "thoi_gian_cap_nhat",
  order = "DESC",
  keyword = "",
  category_ids = null,
  author_id = null,
  trang_thai = "",
  min_days_ago = null,
  has_audio = null,
  require_text_chapters = null,
}: PublicStoriesParams = {}) => {
  const normalizedCategoryIds = Array.isArray(category_ids)
    ? category_ids.join(",")
    : (category_ids ?? "");

  await prefetchGet<any>(
    `/api/truyen/public`,
    {
      params: {
        page,
        limit,
        sort_by,
        order,
        keyword,
        category_ids: normalizedCategoryIds || undefined,
        author_id,
        trang_thai,
        min_days_ago,
        has_audio,
        require_text_chapters,
      },
    },
    { ttlMs: 30000, dedupe: true },
  );
};

export const getAdminStories = async ({
  page = 1,
  limit = 10,
  trang_thai_kiem_duyet = "",
  keyword = "",
  author_id = null,
  category_id = null,
  has_audio = null,
  require_text_chapters = null,
}: AdminStoriesParams = {}) => {
  const res = await axios.get(`/api/truyen`, {
    params: {
      page,
      limit,
      trang_thai_kiem_duyet,
      keyword,
      author_id,
      category_id,
      has_audio,
      require_text_chapters,
    },
  });
  return res.data;
};

export const getStoryById = async (id: number) => {
  return await cachedGet<any>(
    `/api/truyen/${id}`,
    {},
    { ttlMs: 60000, dedupe: true, abortKey: `story:${id}` },
  );
};

export const getStorySampleChapter = async (id: number) => {
  return await cachedGet<any>(
    `/api/truyen/${id}/sample-chapter`,
    {},
    { ttlMs: 60000, dedupe: true, abortKey: `storySample:${id}` },
  );
};

export const getStoryBySlug = async (slug: string) => {
  return await cachedGet<any>(
    `/api/truyen/slug/${slug}`,
    {},
    { ttlMs: 60000, dedupe: true, abortKey: `storySlug:${slug}` },
  );
};

export const prefetchStoryBySlug = async (slug: string) => {
  if (!slug) return;
  await prefetchGet<any>(
    `/api/truyen/slug/${slug}`,
    {},
    { ttlMs: 60000, dedupe: true },
  );
};

export const approveOrRejectStoryApi = async (
  storyId: number,
  action: "duyet" | "tu_choi",
) => {
  const res = await axios.put(`/api/truyen/${storyId}/duyet-truyen`, {
    action,
  });
  return res.data;
};

export const updateStoryAdmin = async (
  storyId: number,
  storyData: FormData,
) => {
  const res = await axios.put(`/api/truyen/${storyId}`, storyData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const deleteStoryAdmin = async (storyId: number) => {
  const res = await axios.delete(`/api/truyen/${storyId}`);
  return res.data;
};

export const getMyStories = async (params: any) => {
  const response = await axios.get("/api/truyen/truyen-cua-toi", { params });
  return response.data;
};

export const getTopMonthlyStories = async (limit: number = 10) => {
  const response = await cachedGet<{ data: Story[] }>(
    "/api/truyen/top-thang",
    { params: { limit } },
    { ttlMs: 60000, dedupe: true },
  );
  return (response as any).data ?? response;
};

export const getTopWeeklyStories = async (limit: number = 10) => {
  const response = await cachedGet<{ data: Story[] }>(
    "/api/truyen/top-tuan",
    { params: { limit } },
    { ttlMs: 60000, dedupe: true },
  );
  return (response as any).data ?? response;
};

export const getTopDailyStories = async (limit: number = 10) => {
  const response = await cachedGet<{ data: Story[] }>(
    "/api/truyen/top-ngay",
    { params: { limit } },
    { ttlMs: 60000, dedupe: true },
  );
  return (response as any).data ?? response;
};

export const prefetchChaptersByStoryId = async (storyId: number, page = 1, limit = 200) => {
  if (!storyId) return;
  await prefetchGet(
    `/api/chuong/truyen/${storyId}`,
    { params: { page, limit } },
    { ttlMs: 60000, dedupe: true },
  );
};

export const getLikeStatus = async (storyId: number) => {
  const response = await axios.get<{ liked: boolean; luot_thich: number }>(
    `/api/like/${storyId}`,
  );
  return response.data;
};

export const toggleLike = async (storyId: number) => {
  const response = await axios.post<{
    success: boolean;
    liked: boolean;
    luot_thich: number;
  }>(`/api/like/${storyId}`);
  return response.data;
};

export const getHotStories = async (limit: number = 5) => {
  const response = await axios.get<{ data: Story[] }>(
    "/api/truyen/hot-stories",
    { params: { limit } },
  );
  return response.data.data ?? response.data;
};
