// src/modules/storyText/storyText.api.ts
import axios from "@/utils/axios";

export const getAllStories = async ({ page = 1 }) => {
  const res = await axios.get(`/api/truyen?page=${page}`);
  return res.data; // Trả về: { data, pagination }
};
