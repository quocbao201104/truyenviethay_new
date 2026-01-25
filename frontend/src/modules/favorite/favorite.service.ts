import axios from "@/utils/axios";

// Reuse Story interface or define a subset
export interface Story {
  id: number;
  ten_truyen: string;
  slug: string;
  anh_bia: string;
  tac_gia: string;
  trang_thai: string;
  // Add other fields as needed
}

export interface FollowResponse {
  success: boolean;
  data: Story[];
  totalFollowed: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export const getFollowedStories = async (page = 1, limit = 12): Promise<FollowResponse> => {
  const response = await axios.get<FollowResponse>("/api/follow", {
    params: { page, limit }
  });
  return response.data;
};

export const toggleFollowStory = async (storyId: number): Promise<{ message: string; status: boolean }> => {
  const response = await axios.post("/api/follow/" + storyId);
  return response.data;
};
