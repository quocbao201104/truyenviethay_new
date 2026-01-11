import axios from "@/utils/axios";

// Reuse Story interface. Assuming defined in types or we define a subset.
export interface Story {
  id: number;
  ten_truyen: string;
  slug: string;
  anh_bia: string;
  tac_gia: string;
  thoi_gian_cap_nhat: string;
  luot_xem: number;
}

export interface StoryResponse {
    data: Story[];
    pagination: any;
}

// Recommend = Newest/Updated
export const getRecommendedStories = async (limit = 10): Promise<Story[]> => {
    const response = await axios.get<StoryResponse>("/api/truyen/public", {
        params: {
            sort_by: "thoi_gian_cap_nhat",
            order: "DESC",
            limit
        }
    });
    return response.data.data;
};
