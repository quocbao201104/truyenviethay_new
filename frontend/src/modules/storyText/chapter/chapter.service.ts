import axios from "@/utils/axios";

export interface Chapter {
  id: number;
  truyen_id: number;
  ten_chuong: string;
  slug: string;
  noi_dung: string;
  so_chuong: number;
  created_at?: string; // Add this
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

export const createChapter = async (data: any): Promise<Chapter> => {
  const response = await axios.post<Chapter>(`/api/chuong`, data);
  return response.data;
};

export const updateChapter = async (id: number, data: any): Promise<Chapter> => {
  const response = await axios.put<Chapter>(`/api/chuong/${id}`, data);
  return response.data;
};

export const deleteChapter = async (id: number): Promise<void> => {
  await axios.delete(`/api/chuong/${id}`);
};

export const approveOrRejectChapter = async (id: number, action: 'duyet' | 'tu_choi'): Promise<any> => {
  const response = await axios.put(`/api/chuong/${id}/duyet-chuong`, { action });
  return response.data;
};

