<template>
  <div class="author-profile-page portal-cosmic-bg">
    <div class="portal-nebula-glow"></div>
    <div class="portal-particles"></div>

    <main class="author-profile-main">
      
      <section class="author-hero cosmic-glass animate-slideUp" v-if="author">
        <div class="author-hero-content">
          
          <div class="spirit-array-center" :class="frameEffectClass">
            <div class="magic-circle-spin" v-if="author.equipped_frame"></div>
            <div class="magic-circle-reverse" v-if="author.equipped_frame"></div>
            <img 
              :src="getAvatarUrl(author.avatar || author.user_avatar)" 
              :alt="author.pen_name" 
              class="hero-avatar item-img"
              crossorigin="anonymous"
            />
            <img
              v-if="author.equipped_frame?.image_url"
              :src="author.equipped_frame.image_url"
              :alt="author.equipped_frame.name || 'frame'"
              class="hero-frame equipped-frame"
            />
          </div>

          <div class="author-info">
            <div class="name-spirit-plate">
              <div class="plate-magic-wrapper" :style="{ '--badge-color': author.badge?.color || '#38bdf8' }">
                <div class="plate-inner">
                  <h1 class="display-name">{{ author.pen_name }}</h1>
                  <UserBadge v-if="author.badge" :badge="author.badge" size="md" />
                </div>
              </div>
            </div>            <div v-if="isEditing" class="author-edit-form">
              <label class="edit-label">Bút danh</label>
              <input
                v-model="editPenName"
                type="text"
                class="edit-input"
                placeholder="Nhập bút danh"
              />
              <label class="edit-label">Giới thiệu</label>
              <textarea
                v-model="editBio"
                class="edit-textarea"
                rows="4"
                placeholder="Giới thiệu về bạn"
              ></textarea>
              <div class="edit-actions">
                <button class="edit-btn save" :disabled="editSaving" @click="handleSaveProfile">
                  <i v-if="editSaving" class="fas fa-yin-yang fa-spin"></i>
                  <template v-else>Lưu cập nhật</template>
                </button>
                <button class="edit-btn cancel" :disabled="editSaving" @click="handleCancelEdit">Hủy</button>
              </div>
            </div>
            <p v-else class="author-bio">
              <i class="fas fa-quote-left opacity-30 mr-2"></i>
              {{ author.bio || "Vị tôn giả này vẫn đang tĩnh tu, chưa lưu lại truyện thuyết." }}
            </p>
            
            <div class="author-stats-array">
              <div class="stat-crystal">
                <span class="stat-label">Bí Tịch</span>
                <span class="stat-value text-cyan-400">{{ formatNumber(author.total_stories) }}</span>
              </div>
              <div class="stat-crystal">
                <span class="stat-label">Đạo Hữu</span>
                <span class="stat-value text-amber-400">{{ formatNumber(author.follower_count) }}</span>
              </div>
              <div class="stat-crystal">
                <span class="stat-label">Lĩnh Hội</span>
                <span class="stat-value text-emerald-400">{{ formatNumber(author.total_views) }}</span>
              </div>
            </div>
          </div>

          <div class="author-action-area">
            <button
              v-if="author"
              type="button"
              class="group-btn-divine"
              :class="{ 'locked': !isFollowed }"
              @click="handleJoinChat"
            >
              <i class="fas fa-users-viewfinder"></i>
              <span>Tiên Động</span>
            </button>

            <button
              v-if="author && !isOwnProfile"
              type="button"
              class="follow-btn-divine"
              :class="{ 'followed': isFollowed }"
              :disabled="followLoading"
              @click="handleToggleFollow"
            >
              <i v-if="followLoading" class="fas fa-yin-yang fa-spin"></i>
              <template v-else>
                <i class="fas" :class="isFollowed ? 'fa-fingerprint' : 'fa-plus'"></i>
                {{ isFollowed ? "Đã Khắc Ấn" : "Khắc Ấn Thần Thức" }}
              </template>
            </button>
            <button
              v-if="author && isOwnProfile && !isEditing"
              type="button"
              class="edit-profile-btn"
              @click="handleStartEdit"
            >
              <i class="fas fa-pen"></i>
              Chỉnh sửa hồ sơ
            </button>
          </div>
        </div>
      </section>

      <section v-else-if="loadingAuthor" class="author-hero cosmic-glass animate-slideUp">
        <div class="author-loading">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-lines">
            <div class="skeleton-line title"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
        </div>
      </section>

      <section v-else class="author-error cosmic-glass">
        <i class="fas fa-ghost text-4xl text-rose-500 mb-3 opacity-50"></i>
        <p>Thiên cơ nhiễu loạn, không tìm thấy thông tin Tôn giả.</p>
      </section>

      <section class="author-stories">
        <div class="section-header-divine">
          <div class="header-text">
            <div class="kicker-wrap">
              <i class="fas fa-scroll-old opacity-40 text-xs"></i>
              <p class="kicker-gold">TÀNG KINH CÁC CỦA TÔN GIẢ</p>
            </div>
            <h2 class="majestic-title-cyan">BÍ TỊCH LƯU TRUYỀN</h2>
          </div>
          <span class="section-note">Tinh tuyển từ đạo lộ hành văn</span>
        </div>

        <div v-if="loadingStories && stories.length === 0" class="story-grid">
          <div v-for="n in 6" :key="n" class="story-skeleton-card"></div>
        </div>

        <div v-else-if="stories.length === 0" class="empty-state-cosmic">
          <i class="fas fa-wind text-4xl mb-3 opacity-30"></i>
          <p>Tôn giả chưa công bố bí tịch nào ra vạn giới.</p>
        </div>

        <div v-else class="story-grid">
          <NewStoryCard v-for="story in stories" :key="story.id" :story="story" />
        </div>

        <div v-if="hasMore" class="load-more-wrap">
          <button class="load-more-btn-rune" :disabled="loadingStories" @click="loadMore">
            <i v-if="loadingStories" class="fas fa-yin-yang fa-spin"></i>
            <template v-else>Khai Mở Thêm <i class="fas fa-chevron-down ml-1"></i></template>
          </button>
        </div>
      </section>
      
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { getAvatarUrl } from "@/config/constants";
import NewStoryCard from "@/modules/storyText/components/NewStoryCard.vue";
import UserBadge from "@/modules/gamification/components/UserBadge.vue";
import type { Story } from "@/modules/storyText/story.service";
import { getPublicStories } from "@/modules/storyText/story.service";
import { getAuthorById, toggleFollowAuthor, updateMyAuthorProfile, type AuthorPublic } from "@/modules/author/author.api";
import { useAuthStore } from "@/modules/auth/auth.store";
import { useChatStore } from "@/modules/chat/chat.store";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const chatStore = useChatStore();

const author = ref<AuthorPublic | null>(null);
const loadingAuthor = ref(false);
const followLoading = ref(false);
const isFollowed = ref(false);
const isEditing = ref(false);
const editSaving = ref(false);
const editPenName = ref("");
const editBio = ref("");

const DEFAULT_FRAME_EFFECT = '';
const SUPPORTED_FRAME_EFFECTS = [
  'frame-phoenix-fire', 'frame-bang-tinh', 'frame-thien-thanh', 'frame-nine-tails-purple',
  'frame-chan-long', 'frame-van-kiem', 'frame-ma-ton', 'frame-bang-long',
  'frame-thien-co', 'frame-that-sac', 'frame-thien-nhien', 'frame-thanh-loan',
];

const frameEffectClass = computed(() => {
  if (!author.value?.equipped_frame) return '';
  const rawClass = (author.value.equipped_frame.css_class || '').trim();
  if (!rawClass) return DEFAULT_FRAME_EFFECT;
  const matchedClass = rawClass.split(/\s+/).find((cssClass: string) => SUPPORTED_FRAME_EFFECTS.includes(cssClass));
  return matchedClass || DEFAULT_FRAME_EFFECT;
});

const isOwnProfile = computed(() => {
  const authorUserId = author.value?.user_id;
  const currentUserId = authStore.user?.id;
  return Number.isFinite(Number(authorUserId)) && Number(authorUserId) === Number(currentUserId);
});

const stories = ref<Story[]>([]);
const loadingStories = ref(false);
const page = ref(1);
const hasMore = ref(true);

const parseAuthorId = () => {
  const id = parseInt(route.params.authorId as string, 10);
  return Number.isFinite(id) ? id : null;
};

const fetchAuthor = async () => {
  const authorId = parseAuthorId();
  if (!authorId) {
    author.value = null;
    return;
  }
  loadingAuthor.value = true;
  try {
    const data = await getAuthorById(authorId);
    author.value = data;
    isFollowed.value = !!data.is_followed;
  } catch (err: any) {
    author.value = null;
  } finally {
    loadingAuthor.value = false;
  }
};

const fetchStories = async (reset = false) => {
  const authorId = parseAuthorId();
  if (!authorId) return;
  if (reset) {
    page.value = 1;
    stories.value = [];
    hasMore.value = true;
  }
  if (!hasMore.value) return;

  loadingStories.value = true;
  try {
    const res = await getPublicStories({
      page: page.value,
      limit: 12,
      author_id: authorId,
      sort_by: "thoi_gian_cap_nhat",
      order: "DESC",
    });
    const data = res?.data || [];
    stories.value = reset ? data : [...stories.value, ...data];
    const totalPages = res?.pagination?.total_pages || 1;
    hasMore.value = page.value < totalPages;
  } catch (err: any) {
    toast.error(err.message || "Không thể tải danh sách bí tịch");
  } finally {
    loadingStories.value = false;
  }
};

const loadMore = async () => {
  if (loadingStories.value || !hasMore.value) return;
  page.value += 1;
  await fetchStories(false);
};

const handleToggleFollow = async () => {
  if (!author.value) return;
  if (!authStore.isLoggedIn) {
    toast.info("Vui lòng Quy Vị Tiên Môn (Đăng nhập) để khắc ấn.");
    router.push("/dang-nhap");
    return;
  }
  followLoading.value = true;
  try {
    const res = await toggleFollowAuthor(author.value.id);
    isFollowed.value = res.followed;
    author.value.follower_count += res.followed ? 1 : -1;
    toast.success(res.message || (res.followed ? "Đã lưu lại lạc ấn" : "Đã giải trừ lạc ấn"));
  } catch (err: any) {
    toast.error(err.message || "Không thể khắc ấn tác giả");
  } finally {
    followLoading.value = false;
  }
};

const syncEditFields = () => {
  if (!author.value) return;
  editPenName.value = author.value.pen_name || "";
  editBio.value = author.value.bio || "";
};

const handleStartEdit = () => {
  if (!isOwnProfile.value) return;
  syncEditFields();
  isEditing.value = true;
};

const handleCancelEdit = () => {
  isEditing.value = false;
  syncEditFields();
};

const handleSaveProfile = async () => {
  if (!isOwnProfile.value || !author.value) return;
  const penName = (editPenName.value || "").trim();
  if (!penName) {
    toast.error("Bút danh không được để trống.");
    return;
  }
  editSaving.value = true;
  try {
    const updated = await updateMyAuthorProfile({
      pen_name: penName,
      bio: editBio.value ?? "",
    });
    author.value = { ...author.value, ...updated };
    isEditing.value = false;
    toast.success("Đã cập nhật hồ sơ tác giả.");
  } catch (err: any) {
    toast.error(err.message || "Không thể cập nhật hồ sơ.");
  } finally {
    editSaving.value = false;
  }
};

const handleJoinChat = () => {
  if (!author.value) return;
  if (!isFollowed.value) {
    toast.info("Đạo hữu cần Khắc Ấn (Theo dõi) Tôn giả trước khi vào Tiên Động.");
    return;
  }
  chatStore.joinAuthorRoom(author.value.user_id, author.value.pen_name || 'Động Phủ');
};

const formatNumber = (num: number) => {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
};

onMounted(() => {
  fetchAuthor();
  fetchStories(true);
});

watch(
  [author, () => authStore.user?.id],
  () => {
    if (!author.value) return;
    if (isOwnProfile.value) {
      isFollowed.value = true;
      return;
    }
    isFollowed.value = !!author.value.is_followed;
  }
);

watch(
  () => route.params.authorId,
  () => {
    fetchAuthor();
    fetchStories(true);
  }
);
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700;800;900&display=swap");

/* ===== BACKGROUND TINH TRẦN ===== */
.author-profile-page {
  min-height: 100vh;
  background-color: #020617; /* Midnight Blue sâu thẳm */
  color: #f8fafc;
  font-family: 'Be Vietnam Pro', sans-serif;
  position: relative;
  overflow: hidden;
}

.portal-nebula-glow {
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 100vw; height: 60vh;
  background: radial-gradient(ellipse at top, rgba(6, 182, 212, 0.15) 0%, transparent 70%);
  z-index: 0; pointer-events: none;
}

.portal-particles {
  position: absolute; inset: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(34, 211, 238, 0.1) 1px, transparent 1px),
    radial-gradient(circle at 80% 70%, rgba(251, 191, 36, 0.05) 1.5px, transparent 1.5px);
  background-size: 150px 150px, 200px 200px;
  animation: cosmicDrift 40s linear infinite; z-index: 0; pointer-events: none;
}

@keyframes cosmicDrift { 0% { transform: translateY(0); } 100% { transform: translateY(-50px); } }

.author-profile-main {
  max-width: 1140px;
  margin: 0 auto;
  padding: 40px 20px 80px;
  position: relative;
  z-index: 10;
}

/* Kính Mờ Chung */
.cosmic-glass {
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(34, 211, 238, 0.2);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(34, 211, 238, 0.05);
}

/* ===== HERO SECTION ===== */
.author-hero {
  border-radius: 24px;
  padding: 40px 50px;
  margin-bottom: 50px;
  position: relative;
  overflow: hidden;
}

.author-hero::before {
  content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px;
  background: linear-gradient(to right, #06b6d4, #3b82f6);
}

.author-hero-content {
  display: flex;
  gap: 20px;
  align-items: center;
  position: relative;
  z-index: 1;
}

/* ===== SPIRIT ARRAY AVATAR (From HeroPanel) ===== */
.spirit-array-center {
  position: relative; width: 150px; height: 150px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  --aura-gold: 56, 189, 248; /* Cyan for Author */
}

.magic-circle-spin, .magic-circle-reverse {
  position: absolute; inset: -12px; border-radius: 50%;
  border: 2px dashed rgba(var(--aura-gold), 0.4);
  animation: spinArray 20s linear infinite; pointer-events: none;
  filter: drop-shadow(0 0 10px rgba(var(--aura-gold), 0.5));
}
.magic-circle-reverse {
  inset: -20px; border: 1px dotted rgba(var(--aura-gold), 0.6);
  animation: spinArrayReverse 15s linear infinite;
}

.hero-avatar {
  position: relative; z-index: 2; width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
  border: 4px solid rgba(var(--aura-gold), 0.8); background: #000;
  box-shadow: 0 0 20px rgba(var(--aura-gold), 0.3);
  transform: scale(0.80);
}
 
.hero-frame {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain;
  transform: scale(1.45 ); z-index: 3; pointer-events: none;
}

/* ===== NAME SPIRIT PLATE (From ProfileView) ===== */
.name-spirit-plate {
  display: flex; flex-direction: column; align-items: flex-start; justify-content: center;
  margin-bottom: 20px;
}
.plate-magic-wrapper {
  position: relative; display: inline-flex; padding: 2px; border-radius: 50px;
  background: linear-gradient(135deg, var(--badge-color), transparent, var(--badge-color));
  background-size: 200% 200%; animation: spiritual-flow 6s ease infinite; z-index: 1;
}
.plate-magic-wrapper::after {
  content: ""; position: absolute; inset: -2px; background: inherit; filter: blur(3px); opacity: 0.3; z-index: -1; border-radius: 50px; animation: spiritual-flow 6s ease infinite;
}
.plate-inner {
  display: inline-flex; align-items: center; justify-content: center; gap: 15px; padding: 8px 30px;
  background: #0b0f19; border-radius: 50px; z-index: 2; box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.8);
}
.display-name {
  font-size: 1.8rem; font-weight: 900; color: #ffffff; margin: 0; line-height: 1;
  text-shadow: 0 0 10px rgba(56, 189, 248, 0.3); letter-spacing: 1px;
}
@keyframes spiritual-flow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
/* @keyframes badge-pulse removed */
@keyframes spinArray { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes spinArrayReverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }

.author-bio {
  margin: 0 0 25px; color: #cbd5e1; font-size: 1.05rem; line-height: 1.6;
  font-style: italic; max-width: 90%;
}

.author-edit-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0 0 25px;
  max-width: 520px;
}

.edit-label {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 700;
}

.edit-input,
.edit-textarea {
  width: 100%;
  background: rgba(2, 6, 23, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: #e2e8f0;
  padding: 10px 14px;
  font-size: 0.95rem;
  outline: none;
}

.edit-input:focus,
.edit-textarea:focus {
  border-color: rgba(34, 211, 238, 0.6);
  box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.15);
}

.edit-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.edit-btn {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(15, 23, 42, 0.8);
  color: #e2e8f0;
  padding: 10px 18px;
  border-radius: 999px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn.save {
  background: linear-gradient(135deg, #0ea5e9, #22d3ee);
  color: #020617;
  border-color: rgba(255, 255, 255, 0.4);
}

.edit-btn.cancel:hover:not(:disabled),
.edit-btn.save:hover:not(:disabled) {
  transform: translateY(-2px);
}

.edit-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

/* Các Cột Chỉ Số (Pills) */
.author-stats-array { display: flex; gap: 15px; flex-wrap: wrap; }

.stat-crystal {
  background: rgba(2, 6, 23, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px 20px; border-radius: 16px;
  display: flex; flex-direction: column; align-items: center; min-width: 100px;
  box-shadow: inset 0 0 15px rgba(0,0,0,0.5);
}

.stat-label { font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; font-weight: 700; }
.stat-value { font-size: 1.3rem; font-weight: 900; text-shadow: 0 0 10px currentColor; }

/* Nút Theo Dõi (Khắc Ấn) */
.author-action-area { display: flex; align-items: center; justify-content: center; gap: 15px; }

.follow-btn-divine {
  background: linear-gradient(135deg, #0ea5e9, #22d3ee); color: #020617;
  border: 1px solid rgba(255,255,255,0.3); padding: 14px 32px; border-radius: 50px;
  font-weight: 900; text-transform: uppercase; letter-spacing: 1px; cursor: pointer;
  transition: all 0.3s ease; box-shadow: 0 5px 20px rgba(34, 211, 238, 0.4);
  display: inline-flex; align-items: center; gap: 10px; font-size: 0.95rem; min-width: 220px; justify-content: center;
}

.follow-btn-divine:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(34, 211, 238, 0.6); }
.follow-btn-divine:active:not(:disabled) { transform: scale(0.95); }

/* Nút Tiên Động (Gia Nhập Chat) */
.group-btn-divine {
  background: linear-gradient(135deg, #f59e0b, #fbbf24); color: #020617;
  border: 1px solid rgba(255,255,255,0.3); padding: 14px 32px; border-radius: 50px;
  font-weight: 900; text-transform: uppercase; letter-spacing: 1px; cursor: pointer;
  transition: all 0.3s ease; box-shadow: 0 5px 20px rgba(251, 191, 36, 0.4);
  display: inline-flex; align-items: center; gap: 10px; font-size: 0.95rem; min-width: 180px; justify-content: center;
}
.group-btn-divine:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(251, 191, 36, 0.6); }
.group-btn-divine:active { transform: scale(0.95); }

.group-btn-divine.locked {
  filter: saturate(0.5);
  opacity: 0.9;
}

/* Khi đã Theo dõi (Khắc ấn thành công -> Xanh Lục) */
.follow-btn-divine.followed {
  background: rgba(16, 185, 129, 0.15); color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.4); box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
}
.follow-btn-divine.followed:hover:not(:disabled) { background: rgba(16, 185, 129, 0.25); }

.follow-btn-divine:disabled { opacity: 0.6; cursor: wait; }

.edit-profile-btn {
  background: rgba(15, 23, 42, 0.85);
  color: #e2e8f0;
  border: 1px solid rgba(56, 189, 248, 0.4);
  padding: 12px 26px;
  border-radius: 50px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.edit-profile-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(56, 189, 248, 0.2);
}

/* ===== SECTION: BÍ TỊCH LƯU TRUYỀN ===== */
.author-stories { margin-top: 20px; }

.section-header-divine { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 1px dashed rgba(255,255,255,0.1); }
.kicker-wrap { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.kicker-gold { margin: 0; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.2em; color: #fbbf24; text-transform: uppercase; }
.majestic-title-cyan { margin: 0; font-size: 1.8rem; font-weight: 900; letter-spacing: 1px; color: #fff; text-shadow: 0 0 10px rgba(34, 211, 238, 0.3); }
.section-note { color: #64748b; font-size: 0.9rem; font-style: italic; }

.story-grid, .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 24px; }

/* Skeleton & Error */
.story-skeleton-card { height: 320px; border-radius: 16px; background: rgba(255,255,255,0.05); animation: pulseGlow 2s infinite alternate; border: 1px solid rgba(255,255,255,0.1); }
.empty-state-cosmic, .author-error { padding: 50px 20px; text-align: center; color: #94a3b8; border: 1px dashed rgba(255,255,255,0.2); border-radius: 20px; background: rgba(255,255,255,0.02); }

.author-loading { display: flex; align-items: center; gap: 30px; width: 100%; }
.skeleton-avatar { width: 140px; height: 140px; border-radius: 50%; background: rgba(255,255,255,0.05); animation: pulseGlow 2s infinite alternate; }
.skeleton-lines { flex: 1; display: flex; flex-direction: column; gap: 15px; }
.skeleton-line { height: 20px; background: rgba(255,255,255,0.05); border-radius: 10px; animation: pulseGlow 2s infinite alternate; }
.skeleton-line.title { height: 40px; width: 40%; }
.skeleton-line.short { width: 60%; }

/* Load More */
.load-more-wrap { display: flex; justify-content: center; margin-top: 40px; }
.load-more-btn-rune {
  background: transparent; border: 1px solid rgba(34, 211, 238, 0.4); color: #22d3ee;
  padding: 12px 30px; border-radius: 50px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
  cursor: pointer; transition: all 0.3s; display: inline-flex; align-items: center;
}
.load-more-btn-rune:hover:not(:disabled) { background: rgba(34, 211, 238, 0.1); box-shadow: 0 0 15px rgba(34, 211, 238, 0.2); transform: translateY(-2px); }

/* Animations */
@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes spinReverse { 100% { transform: rotate(-360deg); } }
@keyframes pulseGlow { from { opacity: 0.5; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
.animate-slideUp { animation: slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

/* Responsive */
@media (max-width: 900px) {
  .author-hero-content { flex-direction: column; text-align: center; gap: 25px; }
  .name-spirit-plate { align-items: center; } /* Center in mobile */
  .author-bio { max-width: 100%; margin: 0 auto 20px; }
  .author-stats-array { justify-content: center; }
  .section-header-divine { flex-direction: column; align-items: center; text-align: center; gap: 10px; }
  .kicker-wrap { justify-content: center; }
}

@media (max-width: 640px) {
  .author-profile-main { padding: 20px 15px 60px; }
  .author-hero { padding: 30px 20px; border-radius: 20px; margin-bottom: 30px; }
  .spirit-array-center { width: 120px; height: 120px; }
  .display-name { font-size: 1.5rem; }
  .stat-crystal { min-width: 85px; padding: 8px 12px; }
  .author-action-area {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    align-items: stretch;
  }
  .follow-btn-divine,
  .group-btn-divine,
  .edit-profile-btn {
    width: 100%;
    min-width: 0;
    min-height: 72px;
    padding: 14px 16px;
    border-radius: 24px;
    justify-content: center;
    gap: 10px;
    font-size: 0.88rem;
    letter-spacing: 0.6px;
    text-align: center;
    white-space: normal;
    line-height: 1.25;
  }
  .story-grid, .loading-grid { grid-template-columns: repeat(2, 1fr); gap: 15px; }
}

@media (max-width: 420px) {
  .author-action-area {
    gap: 10px;
  }
  .follow-btn-divine,
  .group-btn-divine,
  .edit-profile-btn {
    min-height: 68px;
    padding: 12px 14px;
    font-size: 0.82rem;
    gap: 8px;
  }
  .story-grid, .loading-grid { grid-template-columns: repeat(2, 1fr); gap: 15px; }
}
</style>


