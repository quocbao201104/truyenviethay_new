import axios from "@/utils/axios";

export interface HistoryItem {
  truyen_id: number;
  truyen_slug: string;
  ten_truyen: string;
  anh_bia: string;
  chuong_moi_nhat: string;
  chuong_moi_nhat_so_chuong: number | null;
  chuong_slug: string | null;
  thoi_gian_doc: string;
}

export interface HistoryResponse {
  success: boolean;
  history: HistoryItem[];
  total_pages: number;
  current_page: number;
}

export const getReadingHistory = async (page = 1): Promise<HistoryResponse> => {
  const response = await axios.get<HistoryResponse>("/api/history", {
    params: { page }
  });
  return response.data;
};

export const saveReadingHistory = async (truyenId: number, chuongId: number): Promise<{success: boolean, message: string}> => {
  const response = await axios.post("/api/history", {
    truyenId,
    chuongId
  });
  return response.data;
};
