import { defineStore } from "pinia";
import { ref } from "vue";
import { getAllLevels, type Level } from "./level.service";

export const useLevelStore = defineStore("level", () => {
    const levels = ref<Level[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchLevels = async () => {
        // If already loaded, return (optional caching)
        if (levels.value.length > 0) return;

        loading.value = true;
        error.value = null;
        try {
            levels.value = await getAllLevels();
        } catch (err: any) {
            error.value = err.message || "Failed to load levels";
        } finally {
            loading.value = false;
        }
    };

    return {
        levels,
        loading,
        error,
        fetchLevels,
    };
});
