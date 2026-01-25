import axios from "@/utils/axios";

import type { Category } from "@/types/category";

export const getAllCategories = async (): Promise<Category[]> => {
  const response = await axios.get<{data: Category[]}>("/api/theloai");
  return response.data.data || []; // Backend returns { data: [...] }
};
