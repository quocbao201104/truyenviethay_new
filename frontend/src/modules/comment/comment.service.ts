import axios from "@/utils/axios";

export interface Comment {
    id: number;
    content: string;
    created_at: string;
    user_id: number;
    truyen_id: number;
    parent_id?: number | null;
    is_deleted?: number;
    author_name: string; // Updated to match aliased column
    username?: string; // Keep for compatibility if needed
    replies?: Comment[];
}

export interface CreateCommentPayload {
    truyen_id: number;
    content: string;
    parent_id?: number | null;
}

export const getCommentsByStory = async (storyId: number): Promise<{ success: boolean; comments: Comment[] }> => {
    const response = await axios.get("/api/comments", {
        params: { truyen_id: storyId }
    });
    return response.data;
};

export const createComment = async (payload: CreateCommentPayload): Promise<{ success: boolean }> => {
    const response = await axios.post("/api/comments", payload);
    return response.data;
};

export const deleteComment = async (commentId: number): Promise<{ success: boolean }> => {
    const response = await axios.delete(`/api/comments/${commentId}`);
    return response.data;
};
