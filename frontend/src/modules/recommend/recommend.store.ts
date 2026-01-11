import { defineStore } from "pinia";
import { ref } from "vue";
import { getRecommendedStories, type Story } from "./recommend.service";

export const useRecommendStore = defineStore("recommend", () => {
    const recommendedStories = ref<Story[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchRecommended = async () => {
        loading.value = true;
        error.value = null;
        try {
            recommendedStories.value = await getRecommendedStories();
        } catch (err: any) {
            error.value = err.message || "Failed to load recommendations";
        } finally {
            loading.value = false;
        }
    };

    return {
        recommendedStories,
        loading,
        error,
        fetchRecommended,
    };
});
