import axios from "@/utils/axios";

import { type Story } from "@/modules/storyText/story.service";
export type { Story };

export const getTopRatedStories = async (page = 1, limit = 50): Promise<any> => {
    const response = await axios.get("/api/ratings/top", {
        params: { page, limit }
    });
    return response.data;
};

export const getHotStories = async (limit = 50): Promise<Story[]> => {
    const response = await axios.get("/api/truyen/hot-stories", {
        params: { limit }
    });
    return response.data.data ?? response.data;
};
