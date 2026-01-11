import axios from "@/utils/axios";

// Reuse Story interface. 
export interface Story {
  id: number;
  ten_truyen: string;
  slug: string;
  anh_bia: string;
  tac_gia: string;
  luot_xem: number;
  thoi_gian_cap_nhat: string;
}

export interface StoryResponse {
    data: Story[];
    pagination: any;
}

export const getTopViewStories = async (limit = 10): Promise<Story[]> => {
    const response = await axios.get<StoryResponse>("/api/truyen/public", {
        params: {
            sort_by: "luot_xem", // Views
            order: "DESC",
            limit
        }
    });
    return response.data.data;
};
