// src/modules/storyText/storyText.api.ts
import axios from "@/utils/axios";

export const getPublicStories = async ({ page = 1 }) => {
  const res = await axios.get(`/truyen/public?page=${page}`);
  return res.data; // cần là: { data, pagination }
};
