import axios from "@/utils/axios";

import { Story } from "@/modules/storyText/story.service";

export const getTopRatedStories = async (limit = 50): Promise<Story[]> => {
    const response = await axios.get("/api/ratings/top", {
        params: { limit }
    });
    return response.data.data;
};
