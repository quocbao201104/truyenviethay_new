import axios from "@/utils/axios";

export interface Level {
  id: number;
  ten_cap_bac: string;
  phan_tram_chiet_khau: number;
  diem_yeu_cau: number; // Assuming this field exists based on logic
  mau_sac: string; 
}

export const getAllLevels = async (): Promise<Level[]> => {
  const response = await axios.get<Level[]>("/api/levels");
  return response.data;
};
