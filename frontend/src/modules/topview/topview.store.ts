import { defineStore } from "pinia";
import { ref } from "vue";
import { getTopViewStories, type Story } from "./topview.service";

export const useTopViewStore = defineStore("topview", () => {
    const topStories = ref<Story[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchTopView = async () => {
        loading.value = true;
        error.value = null;
        try {
            topStories.value = await getTopViewStories();
        } catch (err: any) {
            error.value = err.message || "Failed to load top stories";
        } finally {
            loading.value = false;
        }
    };

    return {
        topStories,
        loading,
        error,
        fetchTopView,
    };
});
