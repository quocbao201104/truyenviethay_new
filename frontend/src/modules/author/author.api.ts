import axios from "@/utils/axios";

export interface AuthorDashboardResponse {
  success: boolean;
  data: {
    totals: { total_views: number; total_comments: number };
    chart: {
      labels: string[];
      series: { name: string; data: number[] }[];
    };
  };
}

export const getAuthorDashboard = async (): Promise<AuthorDashboardResponse> => {
  const res = await axios.get<AuthorDashboardResponse>("/api/author/dashboard");
  return res.data;
};

export interface AuthorPublic {
  id: number;
  user_id: number;
  pen_name: string;
  avatar?: string | null;
  bio?: string | null;
  total_stories: number;
  follower_count: number;
  total_views: number;
  weekly_score: number;
  monthly_score: number;
  potential_score: number;
  author_score: number;
  created_at: string;
  username?: string | null;
  full_name?: string | null;
  user_avatar?: string | null;
  is_followed?: boolean;
  level_id?: number | null;
  badge?: any | null;
  equipped_frame?: any | null;
}

export type AuthorRankType = "weekly" | "monthly" | "potential" | "all";

export const getTopAuthors = async (
  type: AuthorRankType = "monthly",
  limit = 20,
): Promise<AuthorPublic[]> => {
  const res = await axios.get<{ data: AuthorPublic[] }>("/api/authors/top", {
    params: { type, limit },
  });
  return res.data.data ?? [];
};

export const getAuthorById = async (authorId: number): Promise<AuthorPublic> => {
  const res = await axios.get<{ data: AuthorPublic }>(`/api/authors/${authorId}`);
  return res.data.data;
};

export const toggleFollowAuthor = async (authorId: number) => {
  const res = await axios.post<{ followed: boolean; message: string }>(
    `/api/authors/${authorId}/follow`,
  );
  return res.data;
};

export const updateMyAuthorProfile = async (payload: {
  pen_name?: string;
  bio?: string | null;
}): Promise<AuthorPublic> => {
  const res = await axios.patch<{ data: AuthorPublic }>(
    "/api/authors/me",
    payload,
  );
  return res.data.data;
};
