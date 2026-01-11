import { defineStore } from "pinia";
import { ref } from "vue";
import { getCommentsByStory, createComment, type Comment } from "./comment.service";
import { useAuthStore } from "@/modules/auth/auth.store"; // Assuming auth store exists

export const useCommentStore = defineStore("comment", () => {
    const comments = ref<Comment[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchComments = async (storyId: number) => {
        loading.value = true;
        error.value = null;
        try {
            comments.value = await getCommentsByStory(storyId);
        } catch (err: any) {
            error.value = err.message || "Không thể tải bình luận";
        } finally {
            loading.value = false;
        }
    };

    const addComment = async (storyId: number, content: string) => {
        const authStore = useAuthStore();
        if (!authStore.token) {
            throw new Error("Bạn cần đăng nhập để bình luận");
        }
        
        try {
            const newComment = await createComment({ truyen_id: storyId, noi_dung: content });
            // Optimistic update or refresh
            // Usually backend returns the created comment.
            // We might need to fetch user details or just push it if backend returns full structure.
            // For safety, let's re-fetch or append if the structure matches.
            // Assuming backend returns the comment with user info or we construct it manually for UI.
            await fetchComments(storyId); 
        } catch (err: any) {
            throw err;
        }
    };

    return {
        comments,
        loading,
        error,
        fetchComments,
        addComment
    };
});
