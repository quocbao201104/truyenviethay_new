import { defineStore } from "pinia";
import { ref } from "vue";
import { getTopRatedStories, type Story } from "./ranking.service";

export const useRankingStore = defineStore("ranking", () => {
    const topRatedStories = ref<Story[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchTopRated = async () => {
        loading.value = true;
        error.value = null;
        try {
            topRatedStories.value = await getTopRatedStories();
        } catch (err: any) {
            error.value = err.message || "Failed to load top rated stories";
        } finally {
            loading.value = false;
        }
    };

    return {
        topRatedStories,
        loading,
        error,
        fetchTopRated,
    };
});
