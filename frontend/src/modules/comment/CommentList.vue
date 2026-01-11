<template>
  <div class="comment-section mt-8">
    <h3 class="text-2xl font-bold mb-4">Bình Luận ({{ comments.length }})</h3>

    <!-- Comment Form -->
    <div class="mb-6" v-if="isLoggedIn">
      <textarea
        v-model="newCommentContent"
        rows="3"
        class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        placeholder="Viết bình luận của bạn..."
      ></textarea>
      <div class="mt-2 flex justify-end">
        <button
          @click="handleSubmit"
          :disabled="submitting || !newCommentContent.trim()"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {{ submitting ? "Đang gửi..." : "Gửi Bình Luận" }}
        </button>
      </div>
    </div>
    <div v-else class="mb-6 p-4 bg-gray-100 rounded text-center">
      <router-link to="/auth/login" class="text-blue-600 hover:underline">Đăng nhập</router-link> để tham gia bình luận.
    </div>

    <!-- Error/Loading -->
    <div v-if="loading" class="text-center text-gray-500">Đang tải bình luận...</div>
    <div v-if="error" class="text-center text-red-500">{{ error }}</div>

    <!-- Comment List -->
    <div v-else class="space-y-4">
      <div v-if="comments.length === 0" class="text-gray-500 text-center italic">
        Chưa có bình luận nào. Hãy là người đầu tiên!
      </div>
      
      <div v-for="comment in comments" :key="comment.id" class="flex gap-4 p-4 border rounded-lg bg-gray-50">
        <div class="w-10 h-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
          <img 
            v-if="comment.user?.avatar" 
            :src="comment.user.avatar.startsWith('http') ? comment.user.avatar : `http://localhost:3000${comment.user.avatar}`" 
            alt="Avatar" 
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-xs text-gray-600 font-bold">
            {{ comment.user?.username.charAt(0).toUpperCase() }}
          </div>
        </div>
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="font-bold text-gray-800">{{ comment.user?.full_name || comment.user?.username }}</span>
            <span class="text-xs text-gray-500">{{ formatDate(comment.thoi_gian_tao) }}</span>
          </div>
          <p class="text-gray-700 whitespace-pre-line">{{ comment.noi_dung }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useCommentStore } from "./comment.store";
import { useAuthStore } from "@/modules/auth/auth.store"; // Check correct path
import type { Comment } from "./comment.service"; 

const props = defineProps<{
  storyId: number;
}>();

const store = useCommentStore();
const authStore = useAuthStore();

const newCommentContent = ref("");
const submitting = ref(false);

const comments = computed(() => store.comments);
const loading = computed(() => store.loading);
const error = computed(() => store.error);
const isLoggedIn = computed(() => !!authStore.token); // Assuming token exists on authStore

onMounted(() => {
  if (props.storyId) {
    store.fetchComments(props.storyId);
  }
});

// Refetch if storyId changes
watch(() => props.storyId, (newId) => {
  if (newId) store.fetchComments(newId);
});

const handleSubmit = async () => {
  if (!newCommentContent.value.trim()) return;
  submitting.value = true;
  try {
    await store.addComment(props.storyId, newCommentContent.value);
    newCommentContent.value = "";
  } catch (err: any) {
    alert(err.message || "Lỗi gửi bình luận");
  } finally {
    submitting.value = false;
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("vi-VN");
};
</script>