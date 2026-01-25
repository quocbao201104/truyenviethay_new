import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { getFollowedStories, toggleFollowStory, type Story } from "./favorite.service";

export const useFavoriteStore = defineStore("favorite", () => {
    const router = useRouter();
    const toast = useToast();

    // State
    const favorites = ref<Story[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const pagination = ref({
        page: 1,
        limit: 12,
        total: 0
    });

    // Getters
    const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.limit));
    const hasNextPage = computed(() => pagination.value.page < totalPages.value);
    const hasPrevPage = computed(() => pagination.value.page > 1);

    // Actions
    const fetchFavorites = async (page = 1) => {
        loading.value = true;
        error.value = null;
        try {
            const res = await getFollowedStories(page, pagination.value.limit);
            
            // Handle response structure
            if (res.data) {
                favorites.value = res.data;
                pagination.value.page = page;
                pagination.value.total = res.totalFollowed || res.data.length;
            } else {
                favorites.value = [];
                pagination.value.total = 0;
            }
        } catch (err: any) {
            // Handle 401 - redirect to login
            if (err.response?.status === 401) {
                error.value = "Vui lòng đăng nhập để xem truyện theo dõi";
                toast.error("Vui lòng đăng nhập để xem truyện theo dõi");
                router.push("/dang-nhap");
                return;
            }

            // Handle other errors
            error.value = err.message || "Không thể tải danh sách truyện theo dõi";
            toast.error("Không thể tải danh sách truyện theo dõi. Vui lòng thử lại.");
            console.error("Fetch favorites error:", err);
        } finally {
            loading.value = false;
        }
    };

    const toggleFollow = async (storyId: number) => {
        try {
            const response = await toggleFollowStory(storyId);
            
            // Backend returns { success: true, message: "Đã theo dõi" } or "Đã bỏ theo dõi"
            const isNowFollowed = response.message.includes("Đã theo dõi");
            
            if (isNowFollowed) {
                // Story was just followed - need to refresh favorites to get updated list
                toast.success("Đã theo dõi truyện thành công");
                // Optionally refresh favorites to get the new story in the list
                await fetchFavorites(pagination.value.page);
            } else {
                // Story was unfollowed - remove from local state
                favorites.value = favorites.value.filter(story => story.id !== storyId);
                pagination.value.total = Math.max(0, pagination.value.total - 1);
                toast.success("Đã bỏ theo dõi truyện");
                
                // Refresh if page is now empty and not first page
                if (favorites.value.length === 0 && pagination.value.page > 1) {
                    await fetchFavorites(pagination.value.page - 1);
                }
            }
        } catch (err: any) {
            toast.error("Không thể thực hiện thao tác. Vui lòng thử lại.");
            console.error("Toggle follow error:", err);
            throw err;
        }
    };

    const nextPage = async () => {
        if (hasNextPage.value) {
            await fetchFavorites(pagination.value.page + 1);
        }
    };

    const prevPage = async () => {
        if (hasPrevPage.value) {
            await fetchFavorites(pagination.value.page - 1);
        }
    };

    return {
        favorites,
        loading,
        error,
        pagination,
        totalPages,
        hasNextPage,
        hasPrevPage,
        fetchFavorites,
        toggleFollow,
        nextPage,
        prevPage
    };
});
