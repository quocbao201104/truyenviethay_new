import { defineStore } from "pinia";
import { ref } from "vue";
import { getHotStories, type Story } from "./ranking.service";

export const useRankingStore = defineStore("ranking", () => {
    const hotStories = ref<Story[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchHotStories = async () => {
        loading.value = true;
        error.value = null;
        try {
            hotStories.value = await getHotStories();
        } catch (err: any) {
            error.value = err.message || "Failed to load hot stories";
        } finally {
            loading.value = false;
        }
    };

    return {
        hotStories,
        loading,
        error,
        fetchHotStories,
    };
});
