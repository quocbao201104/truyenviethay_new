<template>
  <div class="profile-page-xianxia">
    <main class="profile-container-aura">
      
      <div v-if="userStore.isProfileLoading" class="loading-spirit-state">
        <i class="fas fa-yin-yang fa-spin text-4xl mb-4 text-emerald-400"></i>
        <p></p>
      </div>

      <div v-else-if="userStore.profileError" class="error-spirit-state">
        <div class="error-box-aura">
          <i class="fas fa-circle-exclamation text-red-500 text-3xl mb-3"></i>
          <p>Thiên cơ nhiễu loạn : {{ userStore.getProfileError }}</p>
          <router-link v-if="!userStore.profile && !authStore.token" to="/dang-nhap" class="btn-re-login">
            Khởi động lại tu luyện
          </router-link>
        </div>
      </div>

      <div v-else class="animate-fadeIn">
        
        <div class="page-header-xianxia">
          <h2 class="title-spirit">Tiên Đạo Danh Thiếp</h2>
          <div class="divider-spirit">
            <div class="dot"></div>
          </div>
        </div>

        <section class="spirit-card-main">
          
          <div class="spirit-header-aura">
            <div class="avatar-aura-wrapper" :class="['profile-frame-active', equippedFrameClass]">
              <span class="aura-ring outer"></span>
              <span class="aura-ring inner"></span>
              <img
                :src="avatarUrl"
                alt="User Avatar"
                class="avatar-main item-img"
                @error="handleAvatarError"
                crossorigin="anonymous"
              />
              <img
                v-if="equippedFrameImage"
                :src="equippedFrameImage"
                alt="Avatar Frame"
                class="avatar-frame-overlay equipped-frame"
                crossorigin="anonymous"
              />
              <div class="status-dot-aura"></div>
            </div>

            <div class="name-spirit-plate">
              <div class="plate-magic-wrapper" :style="{ '--badge-color': authStore.user?.badge?.color || '#34d399' }">
                <div class="plate-inner">
                  <h1 class="display-name">{{ user?.full_name || "Vô Danh Đạo Hữu" }}</h1>
                  <UserBadge :badge="authStore.user?.badge" size="md" />
                </div>
              </div>
              <p class="spirit-handle">@{{ user?.username || "unknown" }}</p>
            </div>
          </div>

          <div class="spirit-details-grid">
            <div class="detail-crystal">
              <i class="fas fa-envelope-open-text icon-aura"></i>
              <div class="text-group">
                <span class="label">Truyền Tin Khí (Email)</span>
                <span class="value">{{ user?.email || "Chưa định danh" }}</span>
              </div>
            </div>

            <div class="detail-crystal">
              <i class="fas fa-mobile-screen-button icon-aura"></i>
              <div class="text-group">
                <span class="label">Liên Lạc Phù (Số điện thoại)</span>
                <span class="value">{{ user?.phone || "Chưa kết nối" }}</span>
              </div>
            </div>

            <div class="detail-crystal">
              <i class="fas fa-yin-yang icon-aura"></i>
              <div class="text-group">
                <span class="label">Đạo Thể (Giới tính)</span>
                <span class="value">{{ formatGender(user?.gender) }}</span>
              </div>
            </div>

            <div class="detail-crystal">
              <i class="fas fa-hourglass-start icon-aura"></i>
              <div class="text-group">
                <span class="label">Tiên Duyên Khởi Thủy (Tham gia)</span>
                <span class="value">{{ formatDate(user?.created_at) }}</span>
              </div>
            </div>

            <div class="detail-crystal highlight-gold">
              <i class="fas fa-crown icon-aura gold"></i>
              <div class="text-group">
                <span class="label">Thiên Phú(Vai trò)</span>
                <span class="value uppercase tracking-wider font-black">{{ user?.role || 'User' }}</span>
              </div>
            </div>

            <div class="detail-crystal highlight-emerald" v-if="currentLevel">
              <i class="fas fa-wand-magic-sparkles icon-aura emerald"></i>
              <div class="text-group">
                <span class="label">Cảnh Giới Hiện Tại</span>
                <span class="value flex items-center gap-2">
                  {{ currentLevel.name }}
                </span>
              </div>
            </div>
          </div>
 
          <div class="tu-vi-section" v-if="currentLevel">
            <LevelCard
              :level="currentLevel"
              :points="userPoints?.total_exp || 0"
              :nextLevelPoints="currentLevel?.next_level_points"
              :nextLevelName="currentLevel?.next_level_name || ''"
            />
          </div>

          <div class="spirit-nav-footer">
            <router-link to="/user/cai-dat-thong-tin" class="spirit-nav-pill">
              <i class="fas fa-user-gear"></i>
              <span>Chỉnh sửa thông tin</span>
            </router-link>
            
            <router-link to="/user/truyen-theo-doi" class="spirit-nav-pill">
              <i class="fas fa-book-bookmark"></i>
              <span>Truyện Theo Dõi</span>
            </router-link>
            
            <router-link to="/user/lich-su-doc" class="spirit-nav-pill">
              <i class="fas fa-scroll"></i>
              <span>Lịch Sử Đọc</span>
            </router-link>

            <div v-if="user?.role === 'user' && userStore.applicationStatus?.status === 'pending'" class="spirit-nav-pill pending">
              <i class="fas fa-hourglass-half"></i>
              <span>Đang chờ Admin phê duyệt</span>
            </div>
            
            <router-link v-else-if="user?.role === 'user'" to="/user/dang-ky-tac-gia" class="spirit-nav-pill special">
              <i class="fas fa-feather-pointed"></i>
              <span>Đăng ký làm tác giả</span>
            </router-link>

            <router-link v-if="user?.role === 'author'" to="/user/dashboard" class="spirit-nav-pill special">
              <i class="fas fa-chart-line"></i>
              <span>Bảng Điều Khiển</span>
            </router-link>

            <router-link v-if="user?.role === 'admin'" to="/admin/dashboard" class="spirit-nav-pill admin">
              <i class="fas fa-shield-halved"></i>
              <span>Quản Trị Vạn Giới</span>
            </router-link>
          </div>

          <div class="logout-aura-area">
             <button @click="handleLogout" class="btn-logout-spirit">
               <i class="fas fa-power-off"></i> Thoát
             </button>
          </div>
        </section>
      </div>

    </main>
  </div>
</template>

<script>
import { computed, onMounted, watch } from "vue";
import { useAuthStore } from "@/modules/auth/auth.store";
import { useUserStore } from "@/modules/user/user.store";
import { getAvatarUrl } from "@/config/constants";
import LevelCard from "@/components/gamification/LevelCard.vue";
import UserBadge from "@/components/gamification/UserBadge.vue";
import { useGamification } from "@/composables/useGamification";
import { useRouter } from "vue-router";
import { useAppToast } from "@/composables/useAppToast";

export default {
  name: "ProfileView",
  setup() {
    const authStore = useAuthStore();
    const userStore = useUserStore();
    const router = useRouter();
    const { showSuccessToast } = useAppToast();
    const { currentLevel, userPoints, fetchCurrentLevel, fetchUserPoints } = useGamification();

    watch(
      () => userStore.profile,
      (newProfile) => {
        if (newProfile?.id) {
          fetchUserPoints(newProfile.id);
          fetchCurrentLevel(newProfile.id);
        }
      },
      { immediate: true },
    );

    onMounted(() => {
      userStore.fetchUserProfile();
      userStore.fetchApplicationStatus();
    });

    const user = computed(() => userStore.getUserProfile);
    const avatarUrl = computed(() => getAvatarUrl(user.value?.avatar));
    const equippedFrameImage = computed(() => user.value?.equipped_frame?.image_url || null);
    const DEFAULT_PROFILE_FRAME_CLASS = "frame-default-aura";
    const SUPPORTED_PROFILE_FRAME_CLASSES = [
      "frame-phoenix-fire",
      "frame-bang-tinh",
      "frame-thien-thanh",
      "frame-nine-tails-purple",
      "frame-chan-long",
      "frame-van-kiem",
      "frame-ma-ton",
      "frame-bang-long",
      "frame-thien-co",
      "frame-that-sac",
      "frame-thien-nhien",
      "frame-thanh-loan",
    ];
    const equippedFrameClass = computed(() => {
      const rawClass = (user.value?.equipped_frame?.css_class || "").trim();
      if (!rawClass) return DEFAULT_PROFILE_FRAME_CLASS;

      const matchedClass = rawClass
        .split(/\s+/)
        .find((cssClass) => SUPPORTED_PROFILE_FRAME_CLASSES.includes(cssClass));

      return matchedClass || DEFAULT_PROFILE_FRAME_CLASS;
    });

    const handleAvatarError = (event) => {
      event.target.src = getAvatarUrl(null);
    };

    const formatDate = (date) => {
      if (!date) return "VÃ´ háº¡n";
      const d = new Date(date);
      return d.toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" });
    };

    const formatGender = (gender) => {
      const genderMap = { male: "Nam Đạo", female: "Nữ Đạo", other: "Linh Thể" };
      return genderMap[gender] || "Chưa rõ";
    };

    const handleLogout = () => {
      authStore.logout();
      showSuccessToast("Äáº¡o há»¯u Ä‘Ã£ thoÃ¡t khá»i cÃµi tiÃªn.");
      router.push("/");
    };

    return {
      userStore,
      authStore,
      user,
      avatarUrl,
      equippedFrameImage,
      equippedFrameClass,
      handleAvatarError,
      formatDate,
      formatGender,
      currentLevel,
      userPoints,
      handleLogout
    };
  },
  components: {
    LevelCard,
    UserBadge,
  },
};
</script>

<style scoped>
/* ===== CORE THEME XIANXIA ===== */
.profile-page-xianxia {
  min-height: 100vh;
  background: #0b0f19; 
  color: #cbd5e1;
  font-family: 'Be Vietnam Pro', sans-serif;
  padding-bottom: 80px;
}

.profile-container-aura {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Loading/Error States */
.loading-spirit-state, .error-spirit-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.error-box-aura {
  background: rgba(244, 63, 94, 0.05);
  border: 1px solid rgba(244, 63, 94, 0.2);
  padding: 30px;
  border-radius: 20px;
}

/* Page Header */
.page-header-xianxia {
  text-align: center;
  margin-bottom: 50px;
}

.title-spirit {
  font-size: 2.5rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 4px;
  background: linear-gradient(to right, #34d399, #fff, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 10px rgba(52, 211, 153, 0.3));
}

.divider-spirit {
  height: 1px;
  width: 240px;
  background: linear-gradient(90deg, transparent, #34d399, transparent);
  margin: 15px auto;
  position: relative;
}

.divider-spirit .dot {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);
  width: 8px; height: 8px; background: #34d399; box-shadow: 0 0 10px #34d399;
}

/* Main Card */
.spirit-card-main {
  background: #131b2c;
  border: 1px solid #1e293b;
  border-radius: 30px;
  padding: 50px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  position: relative;
  overflow: hidden;
}

.spirit-card-main::before {
  content: '';
  position: absolute; top: 0; left: 0; width: 100%; height: 5px;
  background: linear-gradient(to right, #34d399, #fbbf24);
}

/* Header Profile Area */
.spirit-header-aura {
  display: flex;
  align-items: center;
  gap: 40px;
  margin-bottom: 50px;
}

.avatar-aura-wrapper {
  position: relative;
  width: 180px;
  height: 180px;
  flex-shrink: 0;
  --avatar-frame-scale: 1.4;
  --avatar-frame-offset-x: 0px;
  --avatar-frame-offset-y: 0px;
  --aura-primary: 45, 212, 191;
  --aura-speed: 10s;
}

.avatar-aura-wrapper::after {
  content: "";
  position: absolute;
  inset: -12px;
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(circle, rgba(var(--aura-primary), 0.24), transparent 70%);
  filter: blur(10px);
  animation: auraBreath 3s ease-in-out infinite;
  z-index: 0;
}

.aura-ring {
  position: absolute;
  border-radius: 50%;
}

.aura-ring.outer {
  inset: -10px;
  z-index: 4;
}

.aura-ring.inner {
  inset: -3px;
  border: 1px solid rgba(var(--aura-primary), 0.38);
  z-index: 4;
}

.avatar-main {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(var(--aura-primary), 0.95);
  box-shadow:
    0 0 0 6px rgba(var(--aura-primary), 0.2),
    0 0 26px rgba(var(--aura-primary), 0.16);
}

.avatar-frame-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  transform: translate(var(--avatar-frame-offset-x), var(--avatar-frame-offset-y)) scale(var(--avatar-frame-scale));
  transform-origin: center;
  filter: drop-shadow(0 0 18px rgba(251, 191, 36, 0.28));
  z-index: 3;
}

.avatar-aura-wrapper.frame-default-aura {
  --aura-primary: 45, 212, 191;
  --aura-speed: 10s;
  --avatar-frame-scale: 1.4;
}

.avatar-aura-wrapper.frame-phoenix-fire {
  --aura-primary: 249, 115, 22;
  --aura-speed: 3.4s;
  --avatar-frame-scale: 1.76;
}

.avatar-aura-wrapper.frame-phoenix-fire::after {
  background: radial-gradient(circle, rgba(249, 115, 22, 0.34), rgba(239, 68, 68, 0.15), transparent 70%);
  animation: auraBreath 2.2s ease-in-out infinite, flameFlicker 1.5s linear infinite;
}

.avatar-aura-wrapper.frame-phoenix-fire .aura-ring.outer {
  border: none;
  background: conic-gradient(
    from 0deg,
    rgba(245, 158, 11, 0.95),
    rgba(249, 115, 22, 0.95),
    rgba(239, 68, 68, 0.95),
    rgba(245, 158, 11, 0.95)
  );
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px));
}

.avatar-aura-wrapper.frame-phoenix-fire .aura-ring.inner {
  border-color: rgba(249, 115, 22, 0.55);
}

.avatar-aura-wrapper.frame-bang-tinh {
  --aura-primary: 125, 211, 252;
  --aura-speed: 8s;
  --avatar-frame-scale: 1.5;
}

.avatar-aura-wrapper.frame-bang-tinh::after {
  background: radial-gradient(circle, rgba(125, 211, 252, 0.22), rgba(59, 130, 246, 0.12), transparent 70%);
}

.avatar-aura-wrapper.frame-bang-tinh .aura-ring.outer {
  border-style: solid;
  border-color: rgba(125, 211, 252, 0.62);
  box-shadow:
    0 0 8px rgba(125, 211, 252, 0.46),
    0 0 20px rgba(59, 130, 246, 0.2);
}

.avatar-aura-wrapper.frame-thien-thanh {
  --aura-primary: 250, 204, 21;
  --aura-speed: 6.5s;
  --avatar-frame-scale: 1.56;
}

.avatar-aura-wrapper.frame-thien-thanh::after {
  background: radial-gradient(circle, rgba(250, 204, 21, 0.24), rgba(251, 191, 36, 0.1), transparent 70%);
}

.avatar-aura-wrapper.frame-thien-thanh .aura-ring.outer {
  border-style: solid;
  border-color: rgba(250, 204, 21, 0.62);
  box-shadow: 0 0 16px rgba(250, 204, 21, 0.34);
}

.avatar-aura-wrapper.frame-nine-tails-purple {
  --aura-primary: 192, 132, 252;
  --aura-speed: 5.8s;
  --avatar-frame-scale: 1.62;
}

.avatar-aura-wrapper.frame-nine-tails-purple::after {
  background: radial-gradient(circle, rgba(192, 132, 252, 0.3), rgba(168, 85, 247, 0.12), transparent 70%);
}

.avatar-aura-wrapper.frame-nine-tails-purple .aura-ring.outer {
  border: none;
  background: conic-gradient(
    from 0deg,
    rgba(216, 180, 254, 0.95),
    rgba(192, 132, 252, 0.95),
    rgba(168, 85, 247, 0.95),
    rgba(216, 180, 254, 0.95)
  );
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px));
}

.avatar-aura-wrapper.frame-nine-tails-purple .aura-ring.inner {
  border-color: rgba(192, 132, 252, 0.58);
}

.avatar-aura-wrapper.profile-frame-active {
  filter: drop-shadow(0 0 22px rgba(255, 255, 255, 0.12));
}

.status-dot-aura {
  position: absolute; bottom: 15px; right: 15px;
  width: 24px; height: 24px; background: #10b981;
  border: 4px solid #131b2c; border-radius: 50%;
  box-shadow: 0 0 10px #10b981;
  z-index: 5;
}

/* Tái cấu trúc và tinh chỉnh Name Plate - Thanh mảnh hơn */
.name-spirit-plate {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: center; /* Căn giữa theo chiều dọc so với avatar */
  height: fit-content;
}

/* Khung viền linh khí lưu chuyển tinh tế hơn */
.plate-magic-wrapper {
  position: relative;
  display: inline-flex;
  padding: 1.5px; /* Giảm độ dày của viền để tinh tế hơn */
  border-radius: 50px;
  /* Gradient mượt mà hơn, huyền ảo hơn */
  background: linear-gradient(135deg, var(--badge-color), rgba(255, 255, 255, 0.05), var(--badge-color));
  background-size: 200% 200%;
  animation: spiritual-flow 6s ease infinite; /* Chuyển động chậm hơn để huyền ảo */
  margin-bottom: 6px; /* Giảm khoảng cách với username */
  z-index: 1;
  height: fit-content;
}

/* Hào quang (Glow) huyền ảo hơn, ít blur hơn */
.plate-magic-wrapper::after {
  content: "";
  position: absolute;
  inset: -3px; /* Giảm diện tích blur */
  background: inherit;
  filter: blur(8px); /* Blur nhẹ hơn */
  opacity: 0.4; /* Opacity thấp hơn */
  z-index: -1;
  border-radius: 50px;
  animation: spiritual-flow 6s ease infinite;
}

.plate-inner {
  display: inline-flex;
  align-items: center; /* Căn giữa nội dung */
  justify-content: space-between; /* Đẩy tên và badge ra hai bên */
  gap: 12px; /* Giảm gap để chặt chẽ hơn */
  padding: 6px 20px; /* Giảm padding dọc đáng kể để thẻ thanh mảnh */
  background: #0b0f19; /* Đảm bảo nền tối phẳng, không 3D */
  border-radius: 50px;
  z-index: 2;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.4); /* Shadow mờ hơn */
  width: fit-content;
}

/* Đạo hiệu phát sáng tinh tế, kích thước nhỏ hơn */
.display-name {
  font-size: 1.8rem; /* Giảm kích thước chữ để khối nhỏ hơn */
  font-weight: 900;
  color: #ffffff;
  margin: 0;
  line-height: 1;
  /* text-shadow nhẹ hơn */
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
  letter-spacing: 0.5px;
}

/* Căn chỉnh badge chính xác hơn với baseline chữ */
.user-badge[size="md"] {
    display: flex;
    align-items: center;
    margin-top: -1px;
}

.spirit-handle {
  font-size: 0.95rem; /* username nhỏ hơn */
  color: #64748b;
  font-weight: 600;
  margin-left: 20px;
}

/* Info Grid */
.spirit-details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.detail-crystal {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 25px;
  background: #0b0f19;
  border: 1px solid #1e293b;
  border-radius: 20px;
  transition: all 0.3s;
}

@media (hover: hover) {
  .detail-crystal:hover {
    transform: translateY(-5px);
    border-color: #34d39960;
    background: #1a2436;
  }
}

.icon-aura {
  font-size: 1.5rem;
  color: #34d399;
  opacity: 0.7;
}

.detail-crystal.highlight-gold { border-color: #fbbf2440; background: rgba(251, 191, 36, 0.03); }
.detail-crystal.highlight-emerald { border-color: #34d39940; background: rgba(52, 211, 153, 0.03); }

.text-group { display: flex; flex-direction: column; }
.text-group .label { font-size: 0.75rem; color: #475569; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; }
.text-group .value { font-size: 1rem; color: #f8fafc; font-weight: 700; }

/* Gamification Area */
.tu-vi-section {
  margin-bottom: 50px;
  background: rgba(11, 15, 25, 0.5);
  border-radius: 24px;
  padding: 2px;
}

/* Nav Footer */
.spirit-nav-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  padding-top: 35px;
  border-top: 1px dashed #1e293b;
}

.spirit-nav-pill {
  padding: 12px 25px;
  background: #0b0f19;
  border: 1px solid #334155;
  border-radius: 16px;
  color: #94a3b8;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
}

@media (hover: hover) {
  .spirit-nav-pill:hover {
    background: #34d39910;
    border-color: #34d399;
    color: #34d399;
    transform: translateY(-3px);
  }
}

.spirit-nav-pill.special { background: #34d39915; border-color: #34d39940; color: #34d399; }
.spirit-nav-pill.pending { background: #fbbf2415; border-color: #fbbf2440; color: #fbbf24; cursor: default; }
.spirit-nav-pill.admin { background: #f43f5e10; border-color: #f43f5e40; color: #f43f5e; }

/* Logout Area */
.logout-aura-area {
  margin-top: 40px;
  text-align: center;
}

.btn-logout-spirit {
  background: transparent;
  border: 1px solid #f43f5e50;
  color: #f43f5e;
  padding: 10px 25px;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
}

@media (hover: hover) {
  .btn-logout-spirit:hover {
    background: #f43f5e;
    color: #fff;
    box-shadow: 0 0 15px rgba(244, 63, 94, 0.3);
  }
}

/* Animations */
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes spiritual-flow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes auraBreath { 0%,100% { opacity: 0.68; transform: scale(0.98); } 50% { opacity: 1; transform: scale(1.03); } }
@keyframes flameFlicker { 0%,100% { filter: blur(10px) saturate(1); } 50% { filter: blur(12px) saturate(1.22); } }

/* Responsive */
@media (max-width: 900px) {
  .spirit-header-aura { flex-direction: column; text-align: center; gap: 25px; }
  .name-spirit-plate { align-items: center; margin-left: 0; margin-top: 20px; }
  .plate-magic-wrapper { margin-bottom: 8px; }
  .plate-inner { width: 100%; justify-content: center; }
  .spirit-details-grid { grid-template-columns: 1fr; }
  .spirit-card-main { padding: 30px 20px; }
  .display-name { font-size: 1.6rem; }
  .spirit-nav-pill { width: 100%; justify-content: center; }
}
</style>


