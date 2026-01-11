import axios from "@/utils/axios";

// TypeScript Interfaces
export interface Chapter {
  id: number;
  truyen_id: number;
  ten_chuong: string;
  slug: string;
  noi_dung: string;
  so_chuong: number;
  truyen?: {
      id: number;
      ten_truyen: string;
      slug: string;
  };
}

export interface ChapterListResponse {
    data: Chapter[];
    pagination: any;
}

// Reuse or import Story interface if available globally
export interface Story {
    id: number;
    ten_truyen: string;
    slug: string;
    anh_bia: string;
    tac_gia: string;
    // Add other fields as necessary
}

// --- Chapter APIs ---

export const getChapterBySlug = async (slug: string): Promise<Chapter> => {
  const response = await axios.get<Chapter>(`/api/chuong/slug/${slug}`);
  return response.data;
};

export const getChaptersByStoryId = async (storyId: number, page = 1, limit = 1000): Promise<ChapterListResponse> => {
  const response = await axios.get<ChapterListResponse>(`/api/chuong/truyen/${storyId}`, {
      params: { page, limit }
  });
  return response.data;
};

// --- Story APIs (Merged from legacy) ---

export const getPublicStories = async ({ page = 1, limit = 20, sort_by = "thoi_gian_cap_nhat", order = "DESC", keyword = "" }) => {
  const res = await axios.get(`/api/truyen/public`, {
    params: { page, limit, sort_by, order, keyword },
  });
  return res.data;
};

export const getAdminStories = async ({
  page = 1,
  limit = 10,
  trang_thai_kiem_duyet = "",
  keyword = "",
  author_id = null,
  category_id = null,
}) => {
  const res = await axios.get(`/api/truyen`, {
    params: { page, limit, trang_thai_kiem_duyet, keyword, author_id, category_id },
  });
  return res.data;
};

export const getStoryById = async (storyId: number) => {
  const res = await axios.get(`/api/truyen/${storyId}`);
  return res.data;
};

export const getStoryBySlug = async (slug: string) => {
    const res = await axios.get(`/api/truyen/slug/${slug}`);
    return res.data;
};

export const approveOrRejectStoryApi = async (storyId: number, action: 'duyet' | 'tu_choi') => {
  const res = await axios.put(`/api/truyen/${storyId}/duyet-truyen`, { action });
  return res.data;
};

export const updateStoryAdmin = async (storyId: number, storyData: FormData) => {
  const res = await axios.put(`/api/truyen/${storyId}`, storyData, {
    headers: {
      'Content-Type': 'multipart/form-data',
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
