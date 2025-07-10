// frontend/src/modules/category/category.api.ts (Giữ nguyên)
import axios from "@/utils/axios";
import type { Category } from "@/types/category";

/**
 * Lấy tất cả danh sách thể loại từ backend.
 * @returns Promise<Category[]> Danh sách các đối tượng thể loại.
 */
export async function getAllCategories(): Promise<Category[]> {
  // Lời gọi này sẽ là /api/theloai/
  const response = await axios.get<{ data: Category[] }>("/api/theloai/");
  return response.data.data;
}