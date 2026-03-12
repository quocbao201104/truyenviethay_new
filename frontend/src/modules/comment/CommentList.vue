<template>
  <div class="comment-section">
    <h3 class="section-title">Bình Luận ({{ comments.length }})</h3>

    <!-- Comment Form -->
    <div class="comment-form" v-if="isLoggedIn">
      <div class="form-row">
        <div class="form-avatar">
          <img
            :src="getAvatarUrl(authStore.user?.avatar)"
            :alt="authStore.user?.username"
            class="avatar-img form-av-img"
          />
        </div>
        <div class="form-input-wrap">
          <textarea
            v-model="newCommentContent"
            rows="2"
            class="comment-input"
            placeholder="Viết bình luận..."
          ></textarea>
          <div class="form-actions">
            <button
              @click="handleSubmit"
              :disabled="submitting || !newCommentContent.trim()"
              class="btn-submit"
            >
              {{ submitting ? "Đang gửi..." : "Đăng" }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="login-prompt">
      <router-link to="/auth/login" class="login-link">Đăng nhập</router-link> để tham gia bình luận.
    </div>

    <!-- Error/Loading -->
    <div v-if="loading" class="loading-state">Đang tải bình luận...</div>
    <div v-if="error" class="error-state">{{ error }}</div>

    <!-- Comment List -->
    <div v-else class="comments-list">
      <div v-if="comments.length === 0" class="empty-state">
        Chưa có bình luận nào. Hãy là người đầu tiên!
      </div>

      <div v-for="comment in comments" :key="comment.id" class="fb-comment">

        <!-- Avatar -->
        <div class="fb-avatar-shell" :class="comment.author_frame?.css_class || ''">
          <div class="fb-avatar">
            <img
              :src="getAvatarUrl(comment.author_avatar)"
              :alt="comment.author_name"
              class="avatar-img"
              @error="onAvatarError"
            />
            <img
              v-if="comment.author_frame?.image_url"
              :src="comment.author_frame.image_url"
              :alt="comment.author_frame.name"
              class="avatar-frame-overlay"
            />
          </div>
        </div>

        <!-- Body -->
        <div class="fb-body">
          <!-- Bubble -->
          <div :class="['fb-bubble', comment.author_frame?.css_class || '', { 'has-frame': !!comment.author_frame }]">
            <div
              class="author-nameplate"
              :data-rarity="comment.author_badge?.rarity || 'none'"
              :style="{ '--plate-color': comment.author_badge?.color || '#555e6b' }"
            >
              <span class="plate-shine"></span>
              <span class="comment-author" :class="{ 'is-story-author': comment.user_id === props.storyAuthorId }">
                <i v-if="comment.user_id === props.storyAuthorId" class="fas fa-crown author-crown"></i>
                {{ comment.author_name || 'Ẩn danh' }}
              </span>
              <UserBadge :badge="comment.author_badge" size="sm" />
              <span v-if="comment.user_id === props.storyAuthorId" class="author-badge-tag">Tác giả</span>
            </div>
            <p class="comment-text">{{ comment.content }}</p>

            <!-- Delete: admin | author | owner (backend checks 15p, no replies) -->
            <button
              v-if="canDelete(comment)"
              @click="handleDelete(comment.id)"
              class="btn-delete"
              title="Xóa bình luận"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="fb-meta">
            <span class="meta-time">{{ formatDate(comment.created_at) }}</span>
            <span class="meta-sep"></span>
            <button @click="toggleReply(comment.id)" class="meta-btn">Trả lời</button>
          </div>

          <!-- Replies -->
          <div v-if="comment.replies && comment.replies.length > 0" class="fb-replies-wrap">
            <!-- Collapse toggle -->
            <button
              v-if="!isRepliesExpanded(comment.id)"
              class="btn-expand-replies"
              @click="expandReplies(comment.id)"
            >
              <i class="fas fa-chevron-down"></i>
              Xem tất cả {{ comment.replies.length }} phản hồi
            </button>

            <!-- Replies list (expanded) -->
            <div v-else class="fb-replies">
              <div v-for="reply in comment.replies" :key="reply.id" class="fb-reply">
                <div class="fb-avatar-shell sm" :class="reply.author_frame?.css_class || ''">
                  <div class="fb-avatar sm">
                    <img
                      :src="getAvatarUrl(reply.author_avatar)"
                      :alt="reply.author_name"
                      class="avatar-img sm"
                      @error="onAvatarError"
                    />
                    <img
                      v-if="reply.author_frame?.image_url"
                      :src="reply.author_frame.image_url"
                      :alt="reply.author_frame.name"
                      class="avatar-frame-overlay sm"
                    />
                  </div>
                </div>
                <div class="fb-body">
                  <div :class="['fb-bubble', reply.author_frame?.css_class || '', { 'has-frame': !!reply.author_frame }]">
                    <div
                      class="author-nameplate"
                      :data-rarity="reply.author_badge?.rarity || 'none'"
                      :style="{ '--plate-color': reply.author_badge?.color || '#555e6b' }"
                    >
                      <span class="plate-shine"></span>
                      <span class="comment-author" :class="{ 'is-story-author': reply.user_id === props.storyAuthorId }">
                        <i v-if="reply.user_id === props.storyAuthorId" class="fas fa-crown author-crown"></i>
                        {{ reply.author_name || 'ẩn danh' }}
                      </span>
                      <UserBadge :badge="reply.author_badge" size="sm" />
                      <span v-if="reply.user_id === props.storyAuthorId" class="author-badge-tag">Tác giả</span>
                    </div>
                    <p class="comment-text">{{ reply.content }}</p>
                    <button
                      v-if="canDelete(reply)"
                      @click="handleDelete(reply.id)"
                      class="btn-delete"
                      title="Xóa"
                    ><i class="fas fa-times"></i></button>
                  </div>
                  <div class="fb-meta">
                    <span class="meta-time">{{ formatDate(reply.created_at) }}</span>
                    <span class="meta-sep"></span>
                    <button @click="toggleReply(comment.id)" class="meta-btn">Trả lời</button>
                  </div>
                </div>
              </div>

              <!-- Collapse back -->
              <button class="btn-collapse-replies" @click="collapseReplies(comment.id)">
                <i class="fas fa-chevron-up"></i> Thu gọn
              </button>
            </div>
          </div>

          <!-- Reply Form -->
          <div v-if="replyingTo === comment.id" class="reply-form">
            <div class="form-avatar">
              <img
                :src="getAvatarUrl(authStore.user?.avatar)"
                :alt="authStore.user?.username"
                class="avatar-img sm"
              />
            </div>
            <div class="form-input-wrap">
              <textarea
                v-model="replyContent"
                rows="1"
                class="comment-input sm"
                placeholder="Viết câu trả lời..."
                ref="replyInput"
              ></textarea>
              <div class="form-actions">
                <button @click="cancelReply" class="btn-cancel">Hủy</button>
                <button
                  @click="handleReplySubmit(comment.id)"
                  :disabled="submittingReply || !replyContent.trim()"
                  class="btn-submit sm"
                >
                  {{ submittingReply ? "Đang gửi..." : "Trả lời" }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useCommentStore } from "./comment.store";
import { useAuthStore } from "@/modules/auth/auth.store";
import type { Comment } from "./comment.service";
import UserBadge from "@/components/gamification/UserBadge.vue";
import { getAvatarUrl } from "@/config/constants";

const props = withDefaults(
  defineProps<{
    storyId: number;
    storyAuthorId?: number | null;
  }>(),
  { storyAuthorId: null }
);

const store = useCommentStore();
const authStore = useAuthStore();

const newCommentContent = ref("");
const submitting = ref(false);

const replyingTo = ref<number | null>(null);
const replyContent = ref("");
const submittingReply = ref(false);

// Track which comment's replies are expanded
const expandedReplies = ref(new Set<number>());

const comments = computed(() => store.comments);
const loading = computed(() => store.loading);
const error = computed(() => store.error);
const isLoggedIn = computed(() => !!authStore.token);
const isAdmin = computed(() => authStore.user?.role === "admin");
const userId = computed(() => authStore.user?.id ?? null);
const isStoryAuthor = computed(
  () => !!userId.value && !!props.storyAuthorId && props.storyAuthorId === userId.value
);
/** Hiện nút xóa: admin | author truyện | chủ comment (backend kiểm tra 15p, chưa reply) */
const canDelete = (comment: Comment) =>
  isAdmin.value ||
  isStoryAuthor.value ||
  (!!userId.value && comment.user_id === userId.value);

onMounted(() => {
  if (props.storyId) store.fetchComments(props.storyId);
});

watch(() => props.storyId, (newId) => {
  if (newId) store.fetchComments(newId);
});

// Reply expand/collapse
const isRepliesExpanded = (id: number) => expandedReplies.value.has(id);
const expandReplies    = (id: number) => { expandedReplies.value = new Set([...expandedReplies.value, id]); };
const collapseReplies  = (id: number) => { const s = new Set(expandedReplies.value); s.delete(id); expandedReplies.value = s; };

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

const toggleReply = (commentId: number) => {
  if (replyingTo.value === commentId) {
    replyingTo.value = null;
  } else {
    replyingTo.value = commentId;
    replyContent.value = "";
    // Auto-expand replies when opening reply box
    expandReplies(commentId);
  }
};

const cancelReply = () => {
  replyingTo.value = null;
  replyContent.value = "";
};

const handleReplySubmit = async (parentId: number) => {
  if (!replyContent.value.trim()) return;
  submittingReply.value = true;
  try {
    await store.addComment(props.storyId, replyContent.value, parentId);
    replyingTo.value = null;
    replyContent.value = "";
  } catch (err: any) {
    alert(err.message || "Lỗi gửi câu trả lời");
  } finally {
    submittingReply.value = false;
  }
};

const handleDelete = async (commentId: number) => {
  if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;
  try {
    await store.removeComment(commentId, props.storyId);
  } catch (err: any) {
    alert(err.message || "Lỗi xóa bình luận");
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000); // seconds
  if (diff < 60)  return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  return d.toLocaleDateString("vi-VN");
};

const onAvatarError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.style.display = "none";
};
</script>

<style scoped>
.comment-section {
  --aura-primary: #34d399;
  --aura-bg: #0b0f19;
  --bubble-bg: rgba(19, 27, 44, 0.6);
  --border-light: rgba(52, 211, 153, 0.15);
  
  margin-top: 2rem;
  padding: 1.5rem 0;
  font-family: 'Be Vietnam Pro', sans-serif;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--aura-primary);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(52, 211, 153, 0.3);
}

.comment-form, .reply-form { margin-bottom: 1.5rem; }

.form-row, .reply-form {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.form-input-wrap { flex: 1; }

.comment-input {
  width: 100%;
  padding: 0.8rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: #e2e8f0;
  font-size: 0.95rem;
  resize: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1.5;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}

.comment-input:focus {
  outline: none;
  border-color: var(--aura-primary);
  background: rgba(52, 211, 153, 0.05);
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.15), inset 0 2px 4px rgba(0,0,0,0.2);
}

.comment-input::placeholder { color: #64748b; font-style: italic; }
.comment-input.sm { border-radius: 12px; font-size: 0.85rem; padding: 0.6rem 0.8rem; }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

/* NÃºt báº¥m tá»¥ linh */
.btn-submit {
  padding: 0.4rem 1.2rem;
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #0b0f19;
  border: none;
  border-radius: 8px;
  font-weight: 800;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(52, 211, 153, 0.2);
}
.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(52, 211, 153, 0.4);
}
.btn-submit:disabled { background: #334155; color: #94a3b8; cursor: not-allowed; box-shadow: none; }
.btn-submit.sm { padding: 0.3rem 1rem; font-size: 0.85rem; }

.btn-cancel {
  padding: 0.3rem 1rem;
  background: transparent;
  border: 1px solid #475569;
  color: #cbd5e1;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cancel:hover { background: rgba(244, 63, 94, 0.1); border-color: #f43f5e; color: #f43f5e; }

.loading-state, .error-state, .empty-state {
  text-align: center; padding: 3rem 1rem; color: #64748b; font-style: italic;
  background: var(--bubble-bg); border-radius: 16px; border: 1px dashed #334155;
}
.error-state { color: #f43f5e; border-color: rgba(244, 63, 94, 0.3); }

.comments-list { display: flex; flex-direction: column; gap: 1.5rem; }

.fb-comment {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  animation: fadeIn 0.4s ease-out forwards;
}

.fb-body { flex: 1; min-width: 0; }

.fb-avatar-shell {
  position: relative;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  --avatar-frame-scale: 1.32;
}

.fb-avatar-shell.sm {
  width: 32px;
  height: 32px;
}

.fb-avatar {
  position: relative;
  width: 100%;
  height: 100%;
}

.avatar-frame-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
  transform: scale(var(--avatar-frame-scale));
  transform-origin: center;
  filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.24));
}

.avatar-frame-overlay.sm {
  width: 100%;
  height: 100%;
}

.avatar-img {
  width: 42px; height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-light);
  flex-shrink: 0;
  background: #1e293b;
  box-shadow: 0 0 10px rgba(0,0,0,0.3);
}
.avatar-img.form-av-img { border-color: var(--aura-primary); }
.avatar-img.sm { width: 32px; height: 32px; }

.fb-bubble {
  display: inline-block;
  position: relative;
  background: var(--bubble-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 4px 16px 16px 16px;
  padding: 0.7rem 1rem;
  max-width: 100%;
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: border-color 0.3s, transform 0.2s;
}
.fb-bubble:hover { border-color: var(--border-light); }
.fb-bubble.has-frame {
  box-shadow: 0 0 0 1px rgba(251, 191, 36, 0.12), 0 10px 24px rgba(0,0,0,0.18);
}

.comment-text {
  color: #e2e8f0;
  font-size: 0.95rem;
  line-height: 1.6;
  white-space: pre-line;
  margin: 0.4rem 0 0;
  word-break: break-word;
}

/* NÃºt xÃ³a tháº§n tá»‘c */
.btn-delete {
  position: absolute;
  top: 8px; right: 8px;
  background: rgba(244, 63, 94, 0.1);
  border: none;
  color: #f43f5e;
  cursor: pointer;
  font-size: 0.8rem;
  width: 24px; height: 24px;
  border-radius: 50%;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s;
  display: flex; justify-content: center; align-items: center;
}
.fb-bubble:hover .btn-delete { opacity: 1; transform: scale(1); }
.btn-delete:hover { background: #f43f5e; color: #fff; }

.fb-meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0.4rem 0 0 0.8rem;
}

.meta-time { font-size: 0.8rem; color: #64748b; }
.meta-sep { color: #334155; font-size: 0.8rem; }

.meta-btn {
  background: none; border: none;
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}
.meta-btn:hover { color: var(--aura-primary); text-shadow: 0 0 5px rgba(52, 211, 153, 0.4); }

.fb-replies-wrap { margin-top: 1rem; position: relative; }

.btn-expand-replies, .btn-collapse-replies {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px dashed #334155;
  color: #cbd5e1;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  transition: all 0.3s;
}
.btn-expand-replies:hover, .btn-collapse-replies:hover {
  color: var(--aura-primary);
  border-color: var(--aura-primary);
  background: rgba(52, 211, 153, 0.05);
}

.fb-replies {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  padding-left: 2rem; /* Táº¡o khÃ´ng gian cho Ä‘Æ°á»ng káº» cong */
}

/* ÄÆ°á»ng káº» cong (Curved Thread Line) ná»‘i tá»« avatar cha xuá»‘ng cÃ¡c con */
.fb-replies::before {
  content: "";
  position: absolute;
  top: -20px;
  bottom: 20px;
  left: 0.5rem;
  width: 1.5rem;
  border-left: 2px solid rgba(255, 255, 255, 0.08);
  border-bottom: 2px solid rgba(255, 255, 255, 0.08);
  border-bottom-left-radius: 12px;
  pointer-events: none;
}

.fb-reply {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
  position: relative;
  animation: fadeIn 0.3s ease-out forwards;
}

.author-nameplate {
  --plate-color: #64748b; 
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.8rem;
  border-radius: 50px;
  position: relative;
  overflow: hidden;
  background: color-mix(in srgb, var(--plate-color) 10%, #0b0f19);
  border: 1px solid color-mix(in srgb, var(--plate-color) 40%, transparent);
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  margin-bottom: 2px;
}

.comment-author {
  font-weight: 800;
  font-size: 0.85rem;
  white-space: nowrap;
  color: #fff;
  text-shadow: 0 0 8px color-mix(in srgb, var(--plate-color) 80%, transparent);
}

/* Hiá»‡u á»©ng Shine cho Badge xá»‹n */
.plate-shine {
  position: absolute; inset: 0;
  background: linear-gradient(105deg, transparent 35%, rgba(255, 255, 255, 0.2) 50%, transparent 65%);
  transform: translateX(-160%); pointer-events: none;
}
.author-nameplate[data-rarity="epic"] .plate-shine,
.author-nameplate[data-rarity="legendary"] .plate-shine {
  animation: plate-shine 3s ease-in-out infinite;
}


.fb-avatar-shell.frame-phoenix-fire {
  --avatar-frame-scale: 1.72;
}

.fb-avatar-shell.frame-bang-tinh {
  --avatar-frame-scale: 1.22;
}

.fb-avatar-shell.frame-thien-thanh {
  --avatar-frame-scale: 1.24;
}

.fb-avatar-shell.frame-phoenix-fire .avatar-frame-overlay,
.fb-bubble.frame-phoenix-fire {
  filter: drop-shadow(0 0 10px rgba(251, 146, 60, 0.5));
}

.fb-bubble.frame-phoenix-fire {
  background:
    radial-gradient(circle at top left, rgba(251, 191, 36, 0.22), transparent 38%),
    linear-gradient(135deg, rgba(74, 29, 18, 0.92), rgba(124, 45, 18, 0.88), rgba(67, 20, 7, 0.94));
  border-color: rgba(251, 146, 60, 0.42);
  box-shadow: 0 0 24px rgba(249, 115, 22, 0.18), inset 0 0 20px rgba(255, 237, 213, 0.04);
  animation: phoenixCommentPulse 3s ease-in-out infinite;
}

.fb-avatar-shell.frame-phoenix-fire::after {
  content: '';
  position: absolute;
  inset: -7px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251, 113, 133, 0.18), transparent 70%);
  filter: blur(7px);
  pointer-events: none;
  animation: phoenixHalo 3s ease-in-out infinite;
}

.fb-bubble.frame-bang-tinh {
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.22), transparent 36%),
    linear-gradient(135deg, rgba(8, 47, 73, 0.92), rgba(15, 61, 94, 0.88), rgba(23, 37, 84, 0.94));
  border-color: rgba(125, 211, 252, 0.32);
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.15);
}

.fb-bubble.frame-thien-thanh {
  background:
    radial-gradient(circle at top left, rgba(216, 180, 254, 0.24), transparent 40%),
    linear-gradient(135deg, rgba(49, 46, 129, 0.92), rgba(76, 29, 149, 0.88), rgba(30, 27, 75, 0.94));
  border-color: rgba(196, 181, 253, 0.34);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.16);
}

@keyframes phoenixCommentPulse {
  0%, 100% {
    box-shadow: 0 0 18px rgba(249, 115, 22, 0.14), inset 0 0 18px rgba(255, 237, 213, 0.03);
    transform: translateY(0);
  }
  50% {
    box-shadow: 0 0 26px rgba(249, 115, 22, 0.28), inset 0 0 24px rgba(254, 215, 170, 0.07);
    transform: translateY(-1px);
  }
}

@keyframes phoenixHalo {
  0%, 100% { opacity: 0.35; transform: scale(0.96); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

@keyframes plate-shine { 0% { transform: translateX(-160%); } 30%, 100% { transform: translateX(160%); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.comment-author.is-story-author {
  color: #fbbf24 !important;
  font-weight: 800;
  text-shadow: 0 0 8px rgba(251, 191, 36, 0.3);
}

.author-crown {
  margin-right: 4px;
  color: #fbbf24;
  font-size: 0.8em;
  filter: drop-shadow(0 0 3px rgba(251, 191, 36, 0.5));
}

.author-badge-tag {
  font-size: 0.65rem;
  background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
  color: #000;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 900;
  text-transform: uppercase;
  margin-left: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  letter-spacing: 0.5px;
}
</style>

