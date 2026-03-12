import axios from "@/utils/axios";

export interface HistoryItem {
  truyen_id: number;
  truyen_slug: string;
  ten_truyen: string;
  anh_bia: string;
  chuong_moi_nhat: string;
  chuong_moi_nhat_so_chuong: number | null;
  chuong_slug: string | null;
  last_read_chuong_id?: number;
  thoi_gian_doc: string;
}

export interface HistoryResponse {
  success: boolean;
  data: HistoryItem[];
  pagination: {
    current_page: number;
    total_pages: number;
    total: number;
    limit: number;
  };
}

export const getReadingHistory = async (page = 1, limit?: number): Promise<HistoryResponse> => {
  const params: { page: number; limit?: number } = { page };
  if (limit != null) params.limit = limit;
  const response = await axios.get<HistoryResponse>("/api/history", { params });
  return response.data;
};

export const saveReadingHistory = async (truyenId: number, chuongId: number): Promise<{success: boolean, message: string}> => {
  const response = await axios.post("/api/history", {
    truyenId,
    chuongId
  });
  return response.data;
};
