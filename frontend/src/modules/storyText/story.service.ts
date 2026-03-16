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
  so_luong_chuong?: number;
  avg_rating?: number | string;
  total_ratings?: number;
  /** Khi đăng nhập: backend trả thêm */
  is_followed?: boolean;
  last_read_chuong_id?: number | null;
  badge?: any;
  equipped_frame?: any;
}

export interface PublicStoriesParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  order?: "ASC" | "DESC" | string;
  keyword?: string;
  author_id?: number | null;
  trang_thai?: string;
}

export interface AdminStoriesParams {
  page?: number;
  limit?: number;
  trang_thai_kiem_duyet?: string;
  keyword?: string;
  author_id?: number | null;
  category_id?: number | null;
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
  author_id = null,
  trang_thai = "",
}: PublicStoriesParams = {}) => {
  const abortKey = `publicStories:${page}:${limit}:${sort_by}:${order}:${keyword}:${author_id ?? ""}:${trang_thai ?? ""}`;
  return await cachedGet<any>(
    `/api/truyen/public`,
    { params: { page, limit, sort_by, order, keyword, author_id, trang_thai } },
    { ttlMs: 30000, dedupe: true, abortKey },
  );
};

export const getAdminStories = async ({
  page = 1,
  limit = 10,
  trang_thai_kiem_duyet = "",
  keyword = "",
  author_id = null,
  category_id = null,
}: AdminStoriesParams = {}) => {
  const res = await axios.get(`/api/truyen`, {
    params: {
      page,
      limit,
      trang_thai_kiem_duyet,
      keyword,
      author_id,
      category_id,
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

// --- Prefetch helpers ---
export const prefetchPublicStories = async (params: PublicStoriesParams = {}) => {
  await prefetchGet(`/api/truyen/public`, { params }, { ttlMs: 30000, dedupe: true });
};

export const prefetchStoryBySlug = async (slug: string) => {
  if (!slug) return;
  await prefetchGet(`/api/truyen/slug/${slug}`, {}, { ttlMs: 60000, dedupe: true });
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
