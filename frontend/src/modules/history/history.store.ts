import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { getReadingHistory, type HistoryItem } from "./history.service";

export const useHistoryStore = defineStore("history", () => {
    const router = useRouter();
    const toast = useToast();

    // State
    const history = ref<HistoryItem[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const pagination = ref({
        page: 1,
        total_pages: 1
    });

    // Getters
    const hasNextPage = computed(() => pagination.value.page < pagination.value.total_pages);
    const hasPrevPage = computed(() => pagination.value.page > 1);

    // Actions
    const fetchHistory = async (page = 1) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await getReadingHistory(page);
            
            history.value = response.history || [];
            pagination.value.page = response.current_page;
            pagination.value.total_pages = response.total_pages;
        } catch (err: any) {
            // Handle 401 - redirect to login
            if (err.response?.status === 401) {
                error.value = "Vui lòng đăng nhập để xem lịch sử đọc";
                toast.error("Vui lòng đăng nhập để xem lịch sử đọc");
                router.push("/dang-nhap");
                return;
            }

            // Handle other errors
            error.value = err.message || "Không thể tải lịch sử đọc";
            toast.error("Không thể tải lịch sử đọc. Vui lòng thử lại.");
            console.error("Fetch history error:", err);
        } finally {
            loading.value = false;
        }
    };

    const nextPage = async () => {
        if (hasNextPage.value) {
            await fetchHistory(pagination.value.page + 1);
        }
    };

    const prevPage = async () => {
        if (hasPrevPage.value) {
            await fetchHistory(pagination.value.page - 1);
        }
    };

    return {
        history,
        loading,
        error,
        pagination,
        hasNextPage,
        hasPrevPage,
        fetchHistory,
        nextPage,
        prevPage
    };
});
