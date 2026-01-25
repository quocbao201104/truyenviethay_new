import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getRatings, submitRating, type RatingStats, type Rating } from './rating.service';
import { useAppToast } from '@/composables/useAppToast';

export const useRatingStore = defineStore('rating', () => {
  const stats = ref<RatingStats>({ avg_rating: 0, total_ratings: 0 });
  const ratings = ref<Rating[]>([]);
  const userRating = ref<number>(0);
  const loading = ref(false);
  const error = ref<string | null>(null);

  let toast = { showSuccessToast: (msg: string) => {}, showErrorToast: (msg: string) => console.error(msg) };
  try {
    toast = useAppToast();
  } catch (e) {
    console.warn('useAppToast not found');
  }

  const { showSuccessToast, showErrorToast } = toast;

  const fetchRatings = async (truyenId: number) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await getRatings(truyenId);
      // Handle null avg_rating from database
      stats.value = {
        avg_rating: response.stats.avg_rating || 0,
        total_ratings: response.stats.total_ratings || 0
      };
      ratings.value = response.ratings;
      
      // Don't reset userRating here - it should persist after submission
    } catch (err: any) {
      error.value = err.message || 'Failed to load ratings';
      console.error('Failed to fetch ratings', err);
    } finally {
      loading.value = false;
    }
  };

  const submitUserRating = async (truyenId: number, rating: number) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await submitRating(truyenId, rating);
      showSuccessToast(response.message || 'Đánh giá thành công!');
      userRating.value = rating;
      
      // Refresh ratings to get updated stats
      await fetchRatings(truyenId);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi đánh giá';
      error.value = msg;
      showErrorToast(msg);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearRatings = () => {
    stats.value = { avg_rating: 0, total_ratings: 0 };
    ratings.value = [];
    userRating.value = 0;
    error.value = null;
  };

  return {
    stats,
    ratings,
    userRating,
    loading,
    error,
    fetchRatings,
    submitUserRating,
    clearRatings
  };
});
