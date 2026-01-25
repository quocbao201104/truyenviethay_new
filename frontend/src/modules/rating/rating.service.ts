import axios from '@/utils/axios';

export interface RatingStats {
  avg_rating: number;
  total_ratings: number;
}

export interface Rating {
  id: number;
  user_id: number;
  truyen_id: number;
  rating: number;
  created_at: string;
  updated_at: string;
  full_name: string;
}

export interface RatingsResponse {
  stats: RatingStats;
  ratings: Rating[];
}

export const getRatings = async (truyenId: number): Promise<RatingsResponse> => {
  const response = await axios.get(`/api/ratings/${truyenId}`);
  return response.data;
};

export const submitRating = async (truyenId: number, rating: number): Promise<{ message: string }> => {
  const response = await axios.post('/api/ratings', {
    truyenId,
    rating
  });
  return response.data;
};
