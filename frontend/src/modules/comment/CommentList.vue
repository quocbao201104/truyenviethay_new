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
        <div class="spirit-array-center comment-main" :class="comment.author_frame?.css_class">
          <div class="magic-circle-spin" v-if="comment.author_frame"></div>
          <div class="magic-circle-reverse" v-if="comment.author_frame"></div>
          <div class="avatar-wrapper">
            <img
              :src="getAvatarUrl(comment.author_avatar)"
              :alt="comment.author_name"
              class="avatar-img item-img"
              @error="onAvatarError"
            />
            <img
              v-if="comment.author_frame?.image_url"
              :src="getImageUrl(comment.author_frame.image_url)"
              :alt="comment.author_frame.name"
              class="hero-frame"
            />
          </div>
        </div>

        <!-- Body -->
        <div class="fb-body">
          <!-- Bubble -->
          <div :class="['fb-bubble', comment.author_frame?.css_class || '', { 'has-frame': !!comment.author_frame }]">
            <div class="bubble-head">
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
              </div>
              <div v-if="canDelete(comment) || canReport(comment)" class="comment-actions">
                <button
                  class="btn-more"
                  title="Tùy chọn bình luận"
                  @click.stop="toggleActionMenu(getActionMenuKey(comment.id))"
                >
                  <i class="fas fa-ellipsis-vertical"></i>
                </button>
                <div
                  v-if="isActionMenuOpen(getActionMenuKey(comment.id))"
                  class="comment-action-menu"
                  @click.stop
                >
                  <button
                    v-if="canReport(comment)"
                    class="menu-delete-item menu-report-item"
                    @click="openReportModal(comment)"
                  >
                    <i class="fas fa-flag"></i>
                    <span>Báo cáo</span>
                  </button>
                  <button
                    v-if="canDelete(comment)"
                    class="menu-delete-item"
                    @click="handleDeleteFromMenu(comment.id)"
                  >
                    <i class="fas fa-trash-can"></i>
                    <span>Xóa bình luận</span>
                  </button>
                </div>
              </div>
            </div>
            <p class="comment-text">{{ comment.content }}</p>
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
                <div class="spirit-array-center comment-reply" :class="reply.author_frame?.css_class">
                  <div class="magic-circle-spin" v-if="reply.author_frame"></div>
                  <div class="magic-circle-reverse" v-if="reply.author_frame"></div>
                  <div class="avatar-wrapper">
                    <img
                      :src="getAvatarUrl(reply.author_avatar)"
                      :alt="reply.author_name"
                      class="avatar-img item-img"
                      @error="onAvatarError"
                    />
                    <img
                      v-if="reply.author_frame?.image_url"
                      :src="getImageUrl(reply.author_frame.image_url)"
                      :alt="reply.author_frame.name"
                      class="hero-frame"
                    />
                  </div>
                </div>
                <div class="fb-body">
                  <div :class="['fb-bubble', reply.author_frame?.css_class || '', { 'has-frame': !!reply.author_frame }]">
                    <div class="bubble-head">
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
                      </div>
                      <div v-if="canDelete(reply) || canReport(reply)" class="comment-actions">
                        <button
                          class="btn-more"
                          title="Tùy chọn bình luận"
                          @click.stop="toggleActionMenu(getActionMenuKey(reply.id, comment.id))"
                        >
                          <i class="fas fa-ellipsis-vertical"></i>
                        </button>
                        <div
                          v-if="isActionMenuOpen(getActionMenuKey(reply.id, comment.id))"
                          class="comment-action-menu"
                          @click.stop
                        >
                          <button
                            v-if="canReport(reply)"
                            class="menu-delete-item menu-report-item"
                            @click="openReportModal(reply)"
                          >
                            <i class="fas fa-flag"></i>
                            <span>Báo cáo</span>
                          </button>
                          <button
                            v-if="canDelete(reply)"
                            class="menu-delete-item"
                            @click="handleDeleteFromMenu(reply.id)"
                          >
                            <i class="fas fa-trash-can"></i>
                            <span>Xóa bình luận</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <p class="comment-text">{{ reply.content }}</p>
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

    <ReportTargetModal
      :open="isReportModalOpen"
      :target-id="reportTargetId"
      target-type="comment"
      :target-label="reportTargetLabel"
      @close="closeReportModal"
      @submitted="closeReportModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import { useCommentStore } from "./comment.store";
import { useAuthStore } from "@/modules/auth/auth.store";
import type { Comment } from "./comment.service";
import UserBadge from "@/components/gamification/UserBadge.vue";
import { getAvatarUrl, getImageUrl } from "@/config/constants";
import ReportTargetModal from "@/modules/report/components/ReportTargetModal.vue";

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
const openActionMenuId = ref<string | null>(null);
const isReportModalOpen = ref(false);
const reportTargetId = ref<number | null>(null);
const reportTargetLabel = ref("bình luận này");

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
const canReport = (comment: Comment) =>
  !!userId.value && comment.user_id !== userId.value;

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
const getActionMenuKey = (id: number, parentId?: number) =>
  parentId ? `reply-${parentId}-${id}` : `comment-${id}`;
const isActionMenuOpen = (key: string) => openActionMenuId.value === key;
const toggleActionMenu = (key: string) => {
  openActionMenuId.value = openActionMenuId.value === key ? null : key;
};

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
    openActionMenuId.value = null;
  } catch (err: any) {
    alert(err.message || "Lỗi xóa bình luận");
  }
};

const handleDeleteFromMenu = async (commentId: number) => {
  await handleDelete(commentId);
};

const openReportModal = (comment: Comment) => {
  reportTargetId.value = comment.id;
  reportTargetLabel.value = comment.content
    ? `bình luận: "${comment.content.slice(0, 60)}${comment.content.length > 60 ? "..." : ""}"`
    : "bình luận này";
  isReportModalOpen.value = true;
  openActionMenuId.value = null;
};

const closeReportModal = () => {
  isReportModalOpen.value = false;
  reportTargetId.value = null;
  reportTargetLabel.value = "bình luận này";
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

const handleOutsideClick = () => {
  openActionMenuId.value = null;
};

onMounted(() => {
  document.addEventListener("click", handleOutsideClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutsideClick);
});
</script>

<style scoped>
.comment-section {
  --aura-primary: #72e2cd;
  --aura-bg: #0b111b;
  --bubble-bg: rgba(14, 24, 38, 0.74);
  --border-light: rgba(114, 226, 205, 0.22);
  
  margin-top: 2rem;
  padding: 1.25rem 0;
  font-family: 'Be Vietnam Pro', sans-serif;
}

.section-title {
  font-size: 1.18rem;
  font-weight: 800;
  color: var(--aura-primary);
  margin-bottom: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  text-shadow: 0 0 10px rgba(114, 226, 205, 0.24);
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
  padding: 0.72rem 0.9rem;
  background: rgba(8, 14, 22, 0.5);
  border: 1px solid rgba(120, 144, 168, 0.26);
  border-radius: 14px;
  color: #e2e8f0;
  font-size: 0.9rem;
  resize: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1.5;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}

.comment-input:focus {
  outline: none;
  border-color: rgba(114, 226, 205, 0.52);
  background: rgba(17, 28, 42, 0.72);
  box-shadow: 0 0 12px rgba(114, 226, 205, 0.16), inset 0 2px 4px rgba(0,0,0,0.2);
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
  padding: 0.36rem 1.05rem;
  background: linear-gradient(135deg, #61dcc4, #8de7f5);
  color: #08131d;
  border: none;
  border-radius: 10px;
  font-weight: 800;
  font-size: 0.84rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 6px 14px rgba(6, 16, 26, 0.28);
  border: 1px solid rgba(143, 232, 247, 0.28);
}
.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(6, 16, 26, 0.34);
}
.btn-submit:disabled { background: #334155; color: #94a3b8; cursor: not-allowed; box-shadow: none; }
.btn-submit.sm { padding: 0.3rem 1rem; font-size: 0.85rem; }

.btn-cancel {
  padding: 0.28rem 0.86rem;
  background: transparent;
  border: 1px solid rgba(120, 144, 168, 0.34);
  color: #cbd5e1;
  border-radius: 10px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cancel:hover { background: rgba(244, 63, 94, 0.1); border-color: #f43f5e; color: #f43f5e; }

.loading-state, .error-state, .empty-state {
  text-align: center; padding: 3rem 1rem; color: #64748b; font-style: italic;
  background: var(--bubble-bg); border-radius: 14px; border: 1px dashed rgba(120, 144, 168, 0.28);
}
.error-state { color: #f43f5e; border-color: rgba(244, 63, 94, 0.3); }

.comments-list { display: flex; flex-direction: column; gap: 1.2rem; }

.fb-comment {
  display: flex;
  gap: 0.86rem;
  align-items: flex-start;
  animation: fadeIn 0.4s ease-out forwards;
}

.fb-body { flex: 1; min-width: 0; }

/* Avatar Tụ Linh Trận (Scaled for Comments) */
.spirit-array-center {
  position: relative; 
  flex-shrink: 0;
  display: flex; 
  align-items: center; 
  justify-content: center;
  overflow: visible;
  --aura-primary: 1, 216, 245; /* Default cyan for comments */
}

.spirit-array-center.comment-main { width: 46px; height: 46px; }
.spirit-array-center.comment-reply { width: 36px; height: 36px; }

.spirit-array-center.frame-phoenix-fire { --aura-primary: 239, 68, 68; }
.spirit-array-center.frame-bang-tinh { --aura-primary: 56, 189, 248; }
.spirit-array-center.frame-thien-thanh { --aura-primary: 234, 179, 8; }
.spirit-array-center.frame-nine-tails-purple { --aura-primary: 168, 85, 247; }
.spirit-array-center.frame-chan-long { --aura-primary: 251, 191, 36; }

.magic-circle-spin, .magic-circle-reverse {
  position: absolute; 
  inset: -3px; 
  border-radius: 50%;
  border: 1.5px dashed rgba(var(--aura-primary), 0.4);
  animation: spinArray 20s linear infinite; 
  pointer-events: none;
  z-index: 0;
  filter: drop-shadow(0 0 6px rgba(var(--aura-primary), 0.4));
}
.spirit-array-center.comment-reply .magic-circle-spin { border-width: 0.8px; inset: -2.5px; }

.magic-circle-reverse {
  inset: -6px; 
  border: 1px dotted rgba(var(--aura-primary), 0.6);
  animation: spinArrayReverse 15s linear infinite;
}
.spirit-array-center.comment-reply .magic-circle-reverse { border-width: 0.5px; inset: -4.5px; }

.avatar-wrapper {
  position: relative;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  z-index: 1;
}
.spirit-array-center.comment-reply .avatar-wrapper { width: 36px; height: 36px; }

.avatar-img {
  border-radius: 50%; 
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  background: #000;
  z-index: 2;
  object-fit: cover;
  transition: all 0.3s;
}

.spirit-array-center .avatar-img {
  width: 100% !important; 
  height: 100% !important;
  border: 2px solid rgba(var(--aura-primary), 0.8) !important;
  box-shadow: 0 0 10px rgba(var(--aura-primary), 0.2);
  transform: scale(0.8); /* Exact HeroPanel scale */
}

.hero-frame {
  position: absolute; 
  inset: 0; 
  width: 100%; 
  height: 100%; 
  object-fit: contain;
  transform: scale(1.45); 
  z-index: 3; 
  pointer-events: none; 
}
.avatar-img.form-av-img { width: 42px; height: 42px; border-color: var(--aura-primary); }
.avatar-img.sm { width: 32px; height: 32px; }

.fb-bubble {
  display: inline-block;
  position: relative;
  background: var(--bubble-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 4px 14px 14px 14px;
  padding: 0.62rem 0.88rem;
  max-width: 100%;
  border: 1px solid rgba(120, 144, 168, 0.2);
  box-shadow: 0 8px 18px rgba(3, 9, 20, 0.22);
  transition: border-color 0.3s, transform 0.2s;
}
.fb-bubble:hover { border-color: var(--border-light); }
.fb-bubble.has-frame {
  box-shadow: 0 0 0 1px rgba(251, 191, 36, 0.12), 0 10px 24px rgba(0,0,0,0.18);
}

.comment-text {
  color: #e2e8f0;
  font-size: 0.9rem;
  line-height: 1.55;
  white-space: pre-line;
  margin: 0.32rem 0 0;
  word-break: break-word;
}

.bubble-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

/* NÃºt xÃ³a tháº§n tá»‘c */
.comment-actions {
  position: relative;
  flex-shrink: 0;
  margin-left: 6px;
  z-index: 4;
}

.btn-more {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  border: 1px solid rgba(120, 144, 168, 0.3);
  background: rgba(8, 14, 22, 0.72);
  color: #9fb6cb;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-more i {
  font-size: 0.72rem;
  line-height: 1;
}

.btn-more:hover {
  color: #d7e5f3;
  border-color: rgba(114, 226, 205, 0.48);
  background: rgba(17, 28, 42, 0.84);
}

.comment-action-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 132px;
  padding: 4px;
  border-radius: 10px;
  border: 1px solid rgba(120, 144, 168, 0.32);
  background: rgba(10, 17, 27, 0.95);
  box-shadow: 0 12px 24px rgba(3, 9, 20, 0.35);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.menu-delete-item {
  width: 100%;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #fda4af;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 8px;
  font-size: 0.76rem;
  font-weight: 700;
  text-align: left;
  transition: all 0.2s;
}

.menu-delete-item:hover {
  background: rgba(244, 63, 94, 0.15);
  color: #fecdd3;
}

.menu-report-item {
  color: #fcd34d;
}

.menu-report-item:hover {
  background: rgba(245, 158, 11, 0.14);
  color: #fde68a;
}

.fb-meta {
  display: flex;
  align-items: center;
  gap: 0.48rem;
  margin: 0.34rem 0 0 0.66rem;
}

.meta-time { font-size: 0.76rem; color: #7b8fa6; }
.meta-sep { color: #334155; font-size: 0.8rem; }

.meta-btn {
  background: none; border: none;
  color: #9ab2c8;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}
.meta-btn:hover { color: var(--aura-primary); text-shadow: 0 0 5px rgba(114, 226, 205, 0.4); }

.fb-replies-wrap { margin-top: 1rem; position: relative; }

.btn-expand-replies, .btn-collapse-replies {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px dashed rgba(120, 144, 168, 0.36);
  color: #cbd5e1;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.32rem 0.74rem;
  border-radius: 16px;
  transition: all 0.3s;
}
.btn-expand-replies:hover, .btn-collapse-replies:hover {
  color: var(--aura-primary);
  border-color: var(--aura-primary);
  background: rgba(114, 226, 205, 0.07);
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
  padding: 0.16rem 0.68rem;
  border-radius: 50px;
  position: relative;
  overflow: hidden;
  background: color-mix(in srgb, var(--plate-color) 10%, #0b111b);
  border: 1px solid color-mix(in srgb, var(--plate-color) 40%, transparent);
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  margin-bottom: 0;
}

.comment-author {
  font-weight: 800;
  font-size: 0.8rem;
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


/* Phoenix specific removal - handled by frame classes */

@keyframes spinArray { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes spinArrayReverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
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

@media (max-width: 768px) {
  .comment-section {
    margin-top: 1.25rem;
    padding: 0.9rem 0;
  }
  .section-title {
    font-size: 1rem;
    margin-bottom: 0.86rem;
    letter-spacing: 0.55px;
  }
  .comment-form,
  .reply-form {
    margin-bottom: 1rem;
  }
  .form-row,
  .reply-form {
    gap: 0.62rem;
  }
  .avatar-img.form-av-img {
    width: 36px;
    height: 36px;
  }
  .avatar-img.sm {
    width: 28px;
    height: 28px;
  }
  .comment-input {
    padding: 0.62rem 0.74rem;
    font-size: 0.84rem;
    border-radius: 12px;
  }
  .comment-input.sm {
    font-size: 0.8rem;
    padding: 0.5rem 0.64rem;
    border-radius: 10px;
  }
  .form-actions {
    margin-top: 0.42rem;
    gap: 0.4rem;
  }
  .btn-submit {
    padding: 0.3rem 0.84rem;
    font-size: 0.78rem;
  }
  .btn-submit.sm {
    padding: 0.28rem 0.76rem;
    font-size: 0.76rem;
  }
  .btn-cancel {
    padding: 0.24rem 0.72rem;
    font-size: 0.75rem;
  }
  .comments-list {
    gap: 0.9rem;
  }
  .fb-comment {
    gap: 0.62rem;
  }
  .spirit-array-center.comment-main {
    width: 40px;
    height: 40px;
  }
  .spirit-array-center.comment-reply {
    width: 30px;
    height: 30px;
  }
  .avatar-wrapper {
    width: 40px;
    height: 40px;
  }
  .spirit-array-center.comment-reply .avatar-wrapper {
    width: 30px;
    height: 30px;
  }
  .fb-bubble {
    border-radius: 4px 12px 12px 12px;
    padding: 0.52rem 0.72rem;
  }
  .bubble-head {
    gap: 6px;
  }
  .comment-actions {
    margin-left: 4px;
  }
  .btn-more {
    width: 22px;
    height: 22px;
    border-radius: 7px;
  }
  .btn-more i {
    font-size: 0.68rem;
  }
  .comment-action-menu {
    min-width: 120px;
    border-radius: 9px;
    padding: 3px;
  }
  .menu-delete-item {
    font-size: 0.72rem;
    padding: 6px 7px;
    gap: 5px;
  }
  .author-nameplate {
    padding: 0.14rem 0.52rem;
    gap: 0.34rem;
  }
  .comment-author {
    font-size: 0.74rem;
  }
  .comment-text {
    font-size: 0.84rem;
    line-height: 1.46;
    margin-top: 0.24rem;
  }
  .fb-meta {
    margin: 0.28rem 0 0 0.46rem;
    gap: 0.42rem;
  }
  .meta-time,
  .meta-btn {
    font-size: 0.72rem;
  }
  .btn-expand-replies,
  .btn-collapse-replies {
    font-size: 0.74rem;
    padding: 0.24rem 0.58rem;
    border-radius: 14px;
    gap: 0.34rem;
  }
  .fb-replies {
    gap: 0.74rem;
    padding-left: 1.44rem;
  }
  .fb-replies::before {
    top: -14px;
    bottom: 14px;
    left: 0.36rem;
    width: 1rem;
  }
}
</style>
