import { defineStore } from "pinia";
import { ref } from "vue";
import { 
    getChapterBySlug, 
    getChaptersByStoryId, 
    createChapter as createChapterApi,
    updateChapter as updateChapterApi,
    deleteChapter as deleteChapterApi,
    approveOrRejectChapter as approveOrRejectChapterApi,
    type Chapter 
} from "./chapter.service";
import { useAppToast } from "@/composables/useAppToast";

export const useChapterStore = defineStore("chapter", () => {
    const currentChapter = ref<Chapter | null>(null);
    const chapterList = ref<Chapter[]>([]); 
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Toast
    let toast = { showSuccessToast: (msg:string) => console.log(msg), showErrorToast: (msg:string) => console.error(msg) };
    try {
        toast = useAppToast();
    } catch(e) { console.warn("useAppToast not found"); }

    const { showSuccessToast, showErrorToast } = toast;

    const fetchChapter = async (slug: string) => {
        loading.value = true;
        error.value = null;
        try {
            currentChapter.value = await getChapterBySlug(slug);
            
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

    const fetchChapterList = async (storyId: number) => {
        try {
            // Fetch all chapters to build navigation
            const res = await getChaptersByStoryId(storyId, 1, 1000);
            chapterList.value = res.data.sort((a, b) => a.so_chuong - b.so_chuong);
        } catch (error) {
            console.error("Failed to load chapter list for navigation");
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

    return {
        currentChapter,
        chapterList,
        loading,
        error,
        fetchChapter,
        fetchChapterList,
        createChapter,
        updateChapter,
        deleteChapter,
        approveChapter
    };


});
