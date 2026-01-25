import { defineStore } from "pinia";
import { ref } from "vue";
import { 
    getPublicStories,
    getAdminStories,
    getStoryById,
    approveOrRejectStoryApi,
    updateStoryAdmin,
    deleteStoryAdmin,
} from "./story.service";
import { useAppToast } from "@/composables/useAppToast";

export const useStoryStore = defineStore("story", () => {
    // --- State ---
    // --- State ---
    const stories = ref<any[]>([]); // Public stories
    const currentStory = ref<any | null>(null); // Detail

    // Admin State
    const adminStories = ref<any[]>([]);
    const adminStoriesPagination = ref({
        total: 0,
        current_page: 1,
        total_pages: 1,
    });
    
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Toast
    // Ensure composable exists or handle gracefully
    let toast = { showSuccessToast: (msg:string) => {}, showErrorToast: (msg:string) => console.error(msg) };
    try {
        toast = useAppToast();
    } catch(e) { console.warn("useAppToast not found"); }

    const { showSuccessToast, showErrorToast } = toast;
    
    // Like State
    const isLiked = ref(false);
    const likeCount = ref(0);

    // --- Actions ---

    // 1. Story Public Logic
    const fetchStories = async (params: any = {}) => {
        loading.value = true;
        try {
            // Default params merged with passed params
            const res = await getPublicStories(params);
            stories.value = res.data || [];
        } catch (err: any) {
             error.value = err.message;
        } finally {
            loading.value = false;
        }
    };

    const fetchStoryById = async (id: number) => {
        loading.value = true;
        try {
            const res = await getStoryById(id);
            if (res) {
                currentStory.value = res;
                return res;
            }
        } catch (err: any) {
             const msg = err.response?.data?.message || err.message;
             error.value = msg;
             showErrorToast(msg);
        } finally {
            loading.value = false;
        }
    };

    const fetchStoryBySlug = async (slug: string) => {
        loading.value = true;
        currentStory.value = null; // Clear previous story
        try {
            // Need to import getStoryBySlug from service
            const { getStoryBySlug } = await import("./story.service");
            const res = await getStoryBySlug(slug);
             if (res) {
                currentStory.value = res;
                return res;
            }
        } catch (err: any) {
             const msg = err.response?.data?.message || "Failed to load story";
             error.value = msg;
             showErrorToast(msg);
        } finally {
            loading.value = false;
        }
    };

    // 3. Admin Logic
    const fetchAdminStories = async (params: any) => {
        loading.value = true;
        try {
            const result = await getAdminStories(params);
            adminStories.value = result.data || [];
            adminStoriesPagination.value = result.pagination;
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to load admin stories";
            showErrorToast(msg);
        } finally {
            loading.value = false;
        }
    };
    
    // 4. Author Logic
    const authorStories = ref<any[]>([]);
    const authorStoriesPagination = ref({
        total: 0,
        current_page: 1,
        total_pages: 1,
    });
    const authorStoriesLoading = ref(false);

    const fetchAuthorStories = async (params: any) => {
        authorStoriesLoading.value = true;
        try {
            const { getMyStories } = await import("./story.service");
            const result = await getMyStories(params);
            authorStories.value = result.data || [];
            authorStoriesPagination.value = result.pagination;
        } catch (err: any) {
             const msg = err.response?.data?.message || "Failed to load author stories";
             showErrorToast(msg);
        } finally {
             authorStoriesLoading.value = false;
        }
    };

    const approveOrRejectStory = async (storyId: number, action: 'duyet' | 'tu_choi') => {
        loading.value = true;
        try {
            const result = await approveOrRejectStoryApi(storyId, action);
            showSuccessToast(result.message);
            // Refresh logic could be here
            return result;
        } catch (err: any) {
            showErrorToast(err.message || "Failed to approve/reject");
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const updateStory = async (storyId: number, data: FormData) => {
        loading.value = true;
        try {
            const result = await updateStoryAdmin(storyId, data);
            showSuccessToast(result.message);
            return result;
        } catch (err: any) {
            showErrorToast(err.message || "Update failed");
            throw err;
        } finally {
             loading.value = false;
        }
    };

    const deleteStory = async (storyId: number) => {
        loading.value = true;
        try {
            const result = await deleteStoryAdmin(storyId);
            showSuccessToast(result.message);
            // Remove from local state
            adminStories.value = adminStories.value.filter(s => s.id !== storyId);
            return result;
        } catch (err: any) {
            showErrorToast(err.message || "Delete failed");
            throw err;
        } finally {
             loading.value = false;
        }
    };

    const clearData = () => {
        currentStory.value = null;
        currentStory.value = null;
        error.value = null;
    };


    // Like Logic
    const fetchLikeStatus = async (storyId: number) => {
        try {
            const { getLikeStatus } = await import("./story.service");
            const res = await getLikeStatus(storyId);
            isLiked.value = res.liked;
            likeCount.value = res.luot_thich;
        } catch (e) {
            console.error("Failed to fetch like status", e);
        }
    };

    const toggleLike = async (storyId: number) => {
        try {
            const { toggleLike } = await import("./story.service");
            const res = await toggleLike(storyId);
            isLiked.value = res.liked;
            likeCount.value = res.luot_thich;
            
            // Update currentStory if it exists to reflect immediate change in UI if used there
            if (currentStory.value && currentStory.value.id === storyId) {
                currentStory.value.luot_thich = res.luot_thich;
            }
            return res;
        } catch (err: any) {
            if (err.response?.status === 401) {
                showErrorToast("Vui lòng đăng nhập để thích truyện");
            } else {
                showErrorToast("Có lỗi xảy ra khi thích truyện");
            }
            throw err;
        }
    };

    return {
        // State
        stories,
        currentStory,
        adminStories,
        adminStoriesPagination,
        authorStories,
        authorStoriesPagination,
        authorStoriesLoading,
        loading,
        error,
        isLiked,
        likeCount,
        // Actions
        fetchStories,
        fetchStoryById,
        fetchStoryBySlug,
        fetchAdminStories,
        fetchAuthorStories,
        approveOrRejectStory,
        updateStory,
        deleteStory,
        clearData,
        fetchLikeStatus,
        toggleLike
    };
});
