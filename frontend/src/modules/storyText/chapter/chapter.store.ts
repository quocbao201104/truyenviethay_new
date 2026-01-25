import { defineStore } from "pinia";
import { ref } from "vue";
import { 
    getChapterBySlug, 
    getChapterById,
    getChaptersByStoryId, 
    createChapter as createChapterApi,
    updateChapter as updateChapterApi,
    deleteChapter as deleteChapterApi,
    approveOrRejectChapter as approveOrRejectChapterApi,
    getAdminChaptersByStoryId,
    approveAllChaptersByStoryId,
    type Chapter 
} from "./chapter.service";
import { useAppToast } from "@/composables/useAppToast";

export const useChapterStore = defineStore("chapter", () => {
    const currentChapter = ref<Chapter | null>(null);
    const chapterList = ref<Chapter[]>([]); 
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Toast
    let toast = { showSuccessToast: (msg:string) => {}, showErrorToast: (msg:string) => console.error(msg) };
    try {
        toast = useAppToast();
    } catch(e) { console.warn("useAppToast not found"); }

    const { showSuccessToast, showErrorToast } = toast;

    const fetchChapter = async (slug: string, storySlug: string) => {
        loading.value = true;
        error.value = null;
        try {
            currentChapter.value = await getChapterBySlug(slug, storySlug);
            
            // If we have story ID, let's fetch chapter list for navigation if not already loaded
            if (currentChapter.value?.truyen_id && chapterList.value.length === 0) {
                 await fetchChapterList(currentChapter.value.truyen_id);
            }
        } catch (err: any) {
            error.value = err.message || "Failed to load chapter";
        } finally {
            loading.value = false;
        }
    };

    const fetchChapterById = async (id: number) => {
        loading.value = true;
        error.value = null;
        try {
            const chap = await getChapterById(id);
            // Don't overwrite currentChapter if it's being used for reading view, 
            // but for editor we might want to return it or set it.
            // Let's just return it to keep it simple for the editor.
            return chap;
        } catch (err: any) {
            error.value = err.message || "Failed to load chapter by ID";
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchChapterList = async (storyId: number) => {
        try {
            // Fetch all chapters to build navigation
            const res = await getChaptersByStoryId(storyId, 1, 100000);
            // Backend returns { chapters: [...] }
            chapterList.value = res.chapters.sort((a: Chapter, b: Chapter) => a.so_chuong - b.so_chuong);
        } catch (error) {
            console.error("Failed to load chapter list for navigation:", error);
        }
    };

    const createChapter = async (data: any) => {
        loading.value = true;
        try {
            const res = await createChapterApi(data);
            showSuccessToast("Thêm chương thành công!");
            return res;
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Failed to create chapter";
            showErrorToast(msg);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const updateChapter = async (id: number, data: any) => {
        loading.value = true;
        try {
            const res = await updateChapterApi(id, data);
            showSuccessToast("Cập nhật chương thành công!");
            return res;
        } catch (err: any) {
             const msg = err.response?.data?.message || err.message || "Failed to update chapter";
            showErrorToast(msg);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const deleteChapter = async (id: number) => {
        loading.value = true;
        try {
            await deleteChapterApi(id);
            showSuccessToast("Xóa chương thành công!");
            // Remove from local list if present
            chapterList.value = chapterList.value.filter(c => c.id !== id);
        } catch (err: any) {
             const msg = err.response?.data?.message || err.message || "Failed to delete chapter";
            showErrorToast(msg);
            throw err;
        } finally {
             loading.value = false;
        }
    };

    const approveChapter = async (id: number, action: 'duyet' | 'tu_choi') => {
        loading.value = true;
        try {
            const res = await approveOrRejectChapterApi(id, action);
            showSuccessToast(res.message || "Duyệt/Từ chối thành công");
            return res;
        } catch (err: any) {
             const msg = err.response?.data?.message || err.message || "Failed to approve/reject chapter";
            showErrorToast(msg);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchAdminChapterList = async (storyId: number) => {
        loading.value = true;
        try {
            const res = await getAdminChaptersByStoryId(storyId);
            chapterList.value = res.chapters.sort((a: any, b: any) => a.so_chuong - b.so_chuong);
        } catch (err: any) {
             const msg = err.response?.data?.message || err.message || "Failed to load admin chapter list";
             showErrorToast(msg);
             console.error(msg);
        } finally {
            loading.value = false;
        }
    };

    const approveAllChapters = async (storyId: number) => {
        loading.value = true;
        try {
            const res = await approveAllChaptersByStoryId(storyId);
            showSuccessToast("Duyệt tất cả chương thành công!");
             // Refresh list
            await fetchAdminChapterList(storyId);
            return res;
        } catch (err: any) {
             const msg = err.response?.data?.message || err.message || "Failed to approve all chapters";
            showErrorToast(msg);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const clearChapterList = () => {
        chapterList.value = [];
        currentChapter.value = null;
    };

    return {
        currentChapter,
        chapterList,
        loading,
        error,
        fetchChapter,
        fetchChapterById,
        fetchChapterList,
        fetchAdminChapterList,
        createChapter,
        updateChapter,
        deleteChapter,
        approveChapter,
        approveAllChapters,
        clearChapterList
    };


});
