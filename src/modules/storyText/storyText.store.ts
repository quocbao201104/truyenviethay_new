import { defineStore } from "pinia";
import axios from "@/utils/axios";

// Định nghĩa kiểu state
interface StoryTextState {
  stories: any[];
  story: any | null;
  chapters: any[];
  chapter: any | null;
  loading: boolean;
  error: string | null;
}

export const useStoryTextStore = defineStore("storyText", {
  state: (): StoryTextState => ({
    stories: [],
    story: null,
    chapters: [],
    chapter: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchStories() {
      try {
        this.loading = true;
        const res = await axios.get("/api/truyen");
        this.stories = res.data.data || [];
        this.error = null;
      } catch (err: any) {
        this.error = err.message || "Lỗi không xác định";
      } finally {
        this.loading = false;
      }
    },

    async fetchStoryById(id: number) {
      try {
        this.loading = true;
        const res = await axios.get(`/api/truyen/${id}`);
        this.story = res.data.data;
        this.error = null;
      } catch (err: any) {
        this.error = err.message || "Không lấy được chi tiết truyện";
      } finally {
        this.loading = false;
      }
    },

    async fetchChapters(storyId: number, page = 1) {
      try {
        this.loading = true;
        const res = await axios.get(
          `/api/chuong?storyId=${storyId}&page=${page}`
        );
        this.chapters = res.data.data || [];
        this.error = null;
      } catch (err: any) {
        this.error = err.message || "Không lấy được danh sách chương";
      } finally {
        this.loading = false;
      }
    },

    async fetchChapterDetail(chapterId: number) {
      try {
        this.loading = true;
        const res = await axios.get(`/api/chuong/${chapterId}`);
        this.chapter = res.data.data;
        this.error = null;
      } catch (err: any) {
        this.error = err.message || "Không lấy được nội dung chương";
      } finally {
        this.loading = false;
      }
    },

    clearData() {
      this.story = null;
      this.chapter = null;
      this.chapters = [];
      this.error = null;
    },
  },
});
