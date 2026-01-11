import axios from "@/utils/axios";

export interface HistoryItem {
  id: number; // history id
  truyen_id: number;
  chapter_id: number;
  thoi_gian_doc: string;
  truyen?: {
      id: number;
      ten_truyen: string;
      slug: string;
      anh_bia: string;
  };
  chapter?: {
      id: number;
      ten_chuong: string;
      slug: string;
      so_chuong: number;
  };
}

export const getReadingHistory = async (): Promise<HistoryItem[]> => {
  const response = await axios.get<HistoryItem[]>("/api/history");
  return response.data;
};
