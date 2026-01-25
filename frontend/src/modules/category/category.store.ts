import { defineStore } from "pinia";
import { ref } from "vue";
import { getAllCategories } from "./category.service";
import type { Category } from "@/types/category";

export const useCategoryStore = defineStore("category", () => {
    const categories = ref<Category[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchCategories = async () => {
        // Guard: Skip if already loaded
        if (categories.value.length > 0) {
            return;
        }
        
        loading.value = true;
        error.value = null;
        try {
            categories.value = await getAllCategories();
        } catch (err: any) {
            error.value = err.message || "Failed to fetch categories";
        } finally {
            loading.value = false;
        }
    };

    return {
        categories,
        loading,
        error,
        fetchCategories,
    };
});