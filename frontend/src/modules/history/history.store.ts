import { defineStore } from "pinia";
import { ref } from "vue";
import { getReadingHistory, type HistoryItem } from "./history.service";

export const useHistoryStore = defineStore("history", () => {
    const history = ref<HistoryItem[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchHistory = async () => {
        loading.value = true;
        error.value = null;
        try {
            history.value = await getReadingHistory();
        } catch (err: any) {
            error.value = err.message || "Failed to load history";
        } finally {
            loading.value = false;
        }
    };

    return {
        history,
        loading,
        error,
        fetchHistory,
    };
});
