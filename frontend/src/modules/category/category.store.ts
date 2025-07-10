// frontend/src/modules/category/category.store.ts
import { defineStore } from "pinia";
import * as categoryApi from "./category.api";
import type { Category } from "@/types/category";
import { useToast } from "vue-toastification";

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

export const useCategoryStore = defineStore("category", {
  state: (): CategoryState => ({
    categories: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    // Getter để lấy danh sách thể loại đã tải
    getCategoryList: (state) => state.categories,
    // Getter kiểm tra trạng thái tải
    isCategoriesLoading: (state) => state.isLoading,
  },

  actions: {
    /**
     * Tải danh sách tất cả thể loại từ API.
     */
    async fetchAllCategories() {
      const toast = useToast();
      this.isLoading = true;
      this.error = null;
      try {
        const data = await categoryApi.getAllCategories();
        this.categories = data;
      } catch (err: any) {
        this.error = err.message || "Không thể tải danh sách thể loại.";
        toast.error("Lỗi khi tải thể loại: " + this.error); // Hiển thị toast lỗi
        console.error("Lỗi khi tải thể loại:", err);
      } finally {
        this.isLoading = false;
      }
    },
  },
});