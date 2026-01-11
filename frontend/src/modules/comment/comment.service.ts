import axios from "@/utils/axios";

export interface Comment {
    id: number;
    noi_dung: string;
    thoi_gian_tao: string;
    user_id: number;
    truyen_id: number;
    user?: {
        id: number;
        username: string;
        avatar: string; // The user model has 'avatar'
        full_name: string;
    };
}

export interface CreateCommentPayload {
    truyen_id: number;
    noi_dung: string;
}

export const getCommentsByStory = async (storyId: number): Promise<Comment[]> => {
    // Backend: router.get("/", commentController.getComments);
    // It likely uses req.query.truyen_id or similar.
    // Based on standard practice and valid code inference:
    const response = await axios.get<Comment[]>("/api/comments", {
        params: { truyen_id: storyId }
    });
    return response.data;
};

export const createComment = async (payload: CreateCommentPayload): Promise<Comment> => {
    const response = await axios.post<Comment>("/api/comments", payload);
    return response.data;
};
