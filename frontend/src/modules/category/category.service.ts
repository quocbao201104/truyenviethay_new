import axios from "@/utils/axios";

import type { Category } from "@/types/category";

export const getAllCategories = async (): Promise<Category[]> => {
  const response = await axios.get<Category[]>("/api/theloai");
  return response.data;
};
