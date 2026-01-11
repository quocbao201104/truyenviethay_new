import { defineStore } from "pinia";
import { ref } from "vue";
import { getFollowedStories, toggleFollowStory, type Story } from "./favorite.service";

export const useFavoriteStore = defineStore("favorite", () => {
    const favorites = ref<Story[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchFavorites = async () => {
        loading.value = true;
        error.value = null;
        try {
            const res = await getFollowedStories();
            // Handle if response is array or object with data
            if (Array.isArray(res)) {
                 favorites.value = res;
            } else if (res.data) {
                 favorites.value = res.data;
            } else {
                 favorites.value = [];
            }
        } catch (err: any) {
            error.value = err.message || "Failed to load favorites";
        } finally {
            loading.value = false;
        }
    };

    const toggleFollow = async (storyId: number) => {
        try {
            await toggleFollowStory(storyId);
            // Optionally update local list if we are viewing the list
            // Or just return success for UI to toggle button state
        } catch (err: any) {
            throw err;
        }
    };

    return {
        favorites,
        loading,
        error,
        fetchFavorites,
        toggleFollow
    };
});
