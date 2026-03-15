<template>
  <div class="profile-page-xianxia">
    <main class="profile-container-aura">
      
      <div v-if="userStore.isProfileLoading" class="loading-spirit-state">
        <i class="fas fa-yin-yang fa-spin text-4xl mb-4 text-emerald-400"></i>
        <p class="text-emerald-500 animate-pulse font-bold">Đang hội tụ linh khí, xuất lệnh bài...</p>
      </div>

      <div v-else-if="userStore.profileError" class="error-spirit-state">
        <div class="error-box-aura">
          <i class="fas fa-circle-exclamation text-red-500 text-3xl mb-3"></i>
          <p>Thiên cơ nhiễu loạn: {{ userStore.getProfileError }}</p>
          <router-link v-if="!userStore.profile && !authStore.token" to="/dang-nhap" class="btn-re-login">
            Khởi động lại tu luyện
          </router-link>
        </div>
      </div>

      <div v-else class="animate-fadeIn">
        
        <div class="page-header-xianxia">
          <h2 class="title-spirit">Lệnh Bài Thân Phận</h2>
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
              <div class="plate-magic-wrapper" :style="{ '--badge-color': user?.badge?.color || '#10b981' }">
                <div class="plate-inner">
                  <h1 class="display-name">{{ user?.full_name || "Vô Danh Đạo Hữu" }}</h1>
                  <UserBadge :badge="user?.badge" size="md" class="magic-badge-glow" />
                </div>
              </div>
              <p class="spirit-handle">@{{ user?.username || "unknown" }}</p>
            </div>
          </div>

          <div class="spirit-details-grid">
            <div class="detail-crystal">
              <div class="icon-wrapper"><i class="fas fa-envelope-open-text icon-aura"></i></div>
              <div class="text-group">
                <span class="label">Truyền Tin Khí</span>
                <span class="value">{{ user?.email || "Chưa định danh" }}</span>
              </div>
            </div>

            <div class="detail-crystal">
              <div class="icon-wrapper"><i class="fas fa-mobile-screen-button icon-aura"></i></div>
              <div class="text-group">
                <span class="label">Liên Lạc Phù</span>
                <span class="value">{{ user?.phone || "Chưa kết nối" }}</span>
              </div>
            </div>

            <div class="detail-crystal">
              <div class="icon-wrapper"><i class="fas fa-yin-yang icon-aura"></i></div>
              <div class="text-group">
                <span class="label">Đạo Thể</span>
                <span class="value">{{ formatGender(user?.gender) }}</span>
              </div>
            </div>

            <div class="detail-crystal">
              <div class="icon-wrapper"><i class="fas fa-hourglass-start icon-aura"></i></div>
              <div class="text-group">
                <span class="label">Tiên Duyên Khởi Thủy</span>
                <span class="value">{{ formatDate(user?.created_at) }}</span>
              </div>
            </div>

            <div class="detail-crystal highlight-gold">
              <div class="icon-wrapper gold"><i class="fas fa-crown icon-aura"></i></div>
              <div class="text-group">
                <span class="label">Thiên Phú</span>
                <span class="value uppercase tracking-wider font-black text-amber-400">{{ user?.role || 'User' }}</span>
              </div>
            </div>

            <div class="detail-crystal highlight-emerald" v-if="currentLevel">
              <div class="icon-wrapper emerald"><i class="fas fa-wand-magic-sparkles icon-aura"></i></div>
              <div class="text-group">
                <span class="label">Cảnh Giới Hiện Tại</span>
                <span class="value flex items-center gap-2 text-emerald-400 font-bold">
                  {{ currentLevel.name }}
                </span>
              </div>
            </div>
          </div>

          <div class="spirit-nav-footer">
            <router-link to="/user/cai-dat-thong-tin" class="spirit-nav-pill">
              <i class="fas fa-user-gear"></i>
              <span>Khắc Lại Thông Tin</span>
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
              <span>Đang chờ thụ phong</span>
            </div>
            
            <router-link v-else-if="user?.role === 'user'" to="/user/dang-ky-tac-gia" class="spirit-nav-pill special">
              <i class="fas fa-feather-pointed"></i>
              <span>Xin Khai Tông Lập Phái</span>
            </router-link>

            <router-link to="/nhiem-vu" class="spirit-nav-pill special">
              <i class="fas fa-fire-flame-curved"></i>
              <span>Động Thiên Phúc Địa</span>
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
               <i class="fas fa-power-off"></i> Đăng Xuất
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
      "frame-phoenix-fire", "frame-bang-tinh", "frame-thien-thanh", 
      "frame-nine-tails-purple", "frame-chan-long", "frame-van-kiem", 
      "frame-ma-ton", "frame-bang-long", "frame-thien-co", 
      "frame-that-sac", "frame-thien-nhien", "frame-thanh-loan",
    ];
    
    const equippedFrameClass = computed(() => {
      const rawClass = (user.value?.equipped_frame?.css_class || "").trim();
      if (!rawClass) return DEFAULT_PROFILE_FRAME_CLASS;
      const matchedClass = rawClass.split(/\s+/).find((cssClass) => SUPPORTED_PROFILE_FRAME_CLASSES.includes(cssClass));
      return matchedClass || DEFAULT_PROFILE_FRAME_CLASS;
    });

    const handleAvatarError = (event) => {
      event.target.src = getAvatarUrl(null);
    };

    const formatDate = (date) => {
      if (!date) return "Vô hạn";
      const d = new Date(date);
      return d.toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" });
    };

    const formatGender = (gender) => {
      const genderMap = { male: "Nam Đạo", female: "Nữ Đạo", other: "Linh Thể" };
      return genderMap[gender] || "Chưa rõ";
    };

    const handleLogout = () => {
      authStore.logout();
      showSuccessToast("Đạo hữu đã thu hồi thần thức, thoát khỏi cõi tiên.");
      router.push("/");
    };

    return {
      userStore, authStore, user, avatarUrl, equippedFrameImage,
      equippedFrameClass, handleAvatarError, formatDate, formatGender,
      currentLevel, userPoints, handleLogout
    };
  },
  components: { UserBadge },
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
  max-width: 900px; /* Thu gọn lại để giống một tấm lệnh bài hơn */
  margin: 0 auto;
  padding: 40px 20px;
}

/* Loading/Error States */
.loading-spirit-state, .error-spirit-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 400px; text-align: center;
}
.error-box-aura { background: rgba(244, 63, 94, 0.05); border: 1px solid rgba(244, 63, 94, 0.2); padding: 30px; border-radius: 20px; }
.btn-re-login { display: inline-block; margin-top: 15px; padding: 10px 20px; background: #10b981; color: #000; border-radius: 8px; font-weight: bold; text-decoration: none; }

/* Page Header */
.page-header-xianxia { text-align: center; margin-bottom: 40px; }

.title-spirit {
  font-size: 2.8rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 6px;
  background: linear-gradient(to right, #10b981, #ffffff, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.4));
}

.divider-spirit { height: 1px; width: 240px; background: linear-gradient(90deg, transparent, #10b981, transparent); margin: 15px auto; position: relative; }
.divider-spirit .dot { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg); width: 8px; height: 8px; background: #10b981; box-shadow: 0 0 10px #10b981; }

/* ===== MAIN CARD (NGỌC BÀI) ===== */
.spirit-card-main {
  background: linear-gradient(145deg, #131b2c, #0b0f19);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 24px;
  padding: 50px 40px;
  /* Shadow tạo cảm giác khối ngọc dày dặn */
  box-shadow: 
    0 20px 50px rgba(0,0,0,0.6), 
    inset 0 0 30px rgba(16, 185, 129, 0.05);
  position: relative;
  overflow: hidden;
}

.spirit-card-main::before {
  content: '';
  position: absolute; top: 0; left: 0; width: 100%; height: 4px;
  background: linear-gradient(to right, transparent, #10b981, transparent);
}

/* Header Profile Area */
.spirit-header-aura {
  display: flex; flex-direction: column; align-items: center; gap: 25px; margin-bottom: 50px; text-align: center;
}

.avatar-aura-wrapper {
  position: relative; width: 160px; height: 160px; flex-shrink: 0;
  --avatar-frame-scale: 1.4; --avatar-frame-offset-x: 0px; --avatar-frame-offset-y: 0px;
  --aura-primary: 16, 185, 129; --aura-speed: 10s;
}

.avatar-aura-wrapper::after {
  content: ""; position: absolute; inset: -12px; border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle, rgba(var(--aura-primary), 0.24), transparent 70%);
  filter: blur(10px); animation: auraBreath 3s ease-in-out infinite; z-index: 0;
}

.aura-ring { position: absolute; border-radius: 50%; }
.aura-ring.outer { inset: -10px; z-index: 4; }
.aura-ring.inner { inset: -3px; border: 1px solid rgba(var(--aura-primary), 0.38); z-index: 4; }

.avatar-main {
  position: relative; z-index: 2; width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
  border: 3px solid rgba(var(--aura-primary), 0.8);
  box-shadow: 0 0 0 6px rgba(var(--aura-primary), 0.15), 0 0 26px rgba(var(--aura-primary), 0.2);
  transform: scale(0.85);
}

.avatar-frame-overlay {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; pointer-events: none;
  transform: translate(var(--avatar-frame-offset-x), var(--avatar-frame-offset-y)) scale(var(--avatar-frame-scale));
  transform-origin: center; filter: drop-shadow(0 0 18px rgba(251, 191, 36, 0.28)); z-index: 3;
}

/* Giữ nguyên các class Frame Avatar của bạn */
.avatar-aura-wrapper.frame-default-aura { --aura-primary: 16, 185, 129; }
.avatar-aura-wrapper.frame-phoenix-fire { --aura-primary: 249, 115, 22; --aura-speed: 3.4s; --avatar-frame-scale: 1.76; }
.avatar-aura-wrapper.frame-phoenix-fire::after { background: radial-gradient(circle, rgba(249, 115, 22, 0.34), rgba(239, 68, 68, 0.15), transparent 70%); animation: auraBreath 2.2s ease-in-out infinite, flameFlicker 1.5s linear infinite; }
.avatar-aura-wrapper.frame-phoenix-fire .aura-ring.outer { border: none; background: conic-gradient(from 0deg, rgba(245, 158, 11, 0.95), rgba(249, 115, 22, 0.95), rgba(239, 68, 68, 0.95), rgba(245, 158, 11, 0.95)); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px)); mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px)); }
.avatar-aura-wrapper.frame-phoenix-fire .aura-ring.inner { border-color: rgba(249, 115, 22, 0.55); }
.avatar-aura-wrapper.frame-bang-tinh { --aura-primary: 125, 211, 252; --aura-speed: 8s; --avatar-frame-scale: 1.5; }
.avatar-aura-wrapper.frame-bang-tinh::after { background: radial-gradient(circle, rgba(125, 211, 252, 0.22), rgba(59, 130, 246, 0.12), transparent 70%); }
.avatar-aura-wrapper.frame-bang-tinh .aura-ring.outer { border-style: solid; border-color: rgba(125, 211, 252, 0.62); box-shadow: 0 0 8px rgba(125, 211, 252, 0.46), 0 0 20px rgba(59, 130, 246, 0.2); }
.avatar-aura-wrapper.frame-thien-thanh { --aura-primary: 250, 204, 21; --aura-speed: 6.5s; --avatar-frame-scale: 1.56; }
.avatar-aura-wrapper.frame-thien-thanh::after { background: radial-gradient(circle, rgba(250, 204, 21, 0.24), rgba(251, 191, 36, 0.1), transparent 70%); }
.avatar-aura-wrapper.frame-thien-thanh .aura-ring.outer { border-style: solid; border-color: rgba(250, 204, 21, 0.62); box-shadow: 0 0 16px rgba(250, 204, 21, 0.34); }
.avatar-aura-wrapper.frame-nine-tails-purple { --aura-primary: 192, 132, 252; --aura-speed: 5.8s; --avatar-frame-scale: 1.62; }
.avatar-aura-wrapper.frame-nine-tails-purple::after { background: radial-gradient(circle, rgba(192, 132, 252, 0.3), rgba(168, 85, 247, 0.12), transparent 70%); }
.avatar-aura-wrapper.frame-nine-tails-purple .aura-ring.outer { border: none; background: conic-gradient(from 0deg, rgba(216, 180, 254, 0.95), rgba(192, 132, 252, 0.95), rgba(168, 85, 247, 0.95), rgba(216, 180, 254, 0.95)); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px)); mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px)); }
.avatar-aura-wrapper.frame-nine-tails-purple .aura-ring.inner { border-color: rgba(192, 132, 252, 0.58); }

.avatar-aura-wrapper.profile-frame-active { filter: drop-shadow(0 0 22px rgba(255, 255, 255, 0.05)); }
.status-dot-aura { position: absolute; bottom: 20px; right: 20px; width: 18px; height: 18px; background: #10b981; border: 3px solid #131b2c; border-radius: 50%; box-shadow: 0 0 10px #10b981; z-index: 5; }

/* Name Plate */
.name-spirit-plate {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.plate-magic-wrapper {
  position: relative; display: inline-flex; padding: 2px; border-radius: 50px;
  background: linear-gradient(135deg, var(--badge-color), transparent, var(--badge-color));
  background-size: 200% 200%; animation: spiritual-flow 6s ease infinite; margin-bottom: 5px; z-index: 1;
}
.plate-magic-wrapper::after {
  content: ""; position: absolute; inset: -2px; background: inherit; filter: blur(6px); opacity: 0.5; z-index: -1; border-radius: 50px; animation: spiritual-flow 6s ease infinite;
}
.plate-inner {
  display: inline-flex; align-items: center; justify-content: center; gap: 15px; padding: 8px 30px;
  background: #0b0f19; border-radius: 50px; z-index: 2; box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.8);
}
.display-name {
  font-size: 1.8rem; font-weight: 900; color: #ffffff; margin: 0; line-height: 1;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.3); letter-spacing: 1px;
}
.user-badge[size="md"] { display: flex; align-items: center; }
.magic-badge-glow { animation: badge-pulse 2s infinite ease-in-out alternate; }
.spirit-handle { font-size: 0.95rem; color: #64748b; font-weight: 600; letter-spacing: 1px;}

/* KHU VỰC KHẮC CHỮ (Info Grid) - Dạng rãnh khắc trên Lệnh Bài */
.spirit-details-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 40px;
}
.detail-crystal {
  display: flex; align-items: center; gap: 15px; padding: 18px 20px;
  /* Hiệu ứng rãnh khắc (engraved) */
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(16, 185, 129, 0.1);
  border-radius: 16px;
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);
  transition: all 0.3s;
}
@media (hover: hover) { .detail-crystal:hover { background: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.3); } }

.icon-wrapper {
  width: 40px; height: 40px; border-radius: 10px; background: rgba(16, 185, 129, 0.1);
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(16, 185, 129, 0.2);
}
.icon-aura { font-size: 1.2rem; color: #10b981; }

.icon-wrapper.gold { background: rgba(251, 191, 36, 0.1); border-color: rgba(251, 191, 36, 0.2); }
.icon-wrapper.gold .icon-aura { color: #fbbf24; }
.icon-wrapper.emerald { background: rgba(52, 211, 153, 0.1); border-color: rgba(52, 211, 153, 0.2); }
.icon-wrapper.emerald .icon-aura { color: #34d399; }

.text-group { display: flex; flex-direction: column; }
.text-group .label { font-size: 0.7rem; color: #64748b; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;}
.text-group .value { font-size: 0.95rem; color: #e2e8f0; font-weight: 700; }

/* KHU VỰC ĐIỀU HƯỚNG BÊN TRONG (Nav Footer) */
.spirit-nav-footer {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  padding-top: 35px;
  border-top: 1px dashed rgba(16, 185, 129, 0.2);
}

.spirit-nav-pill {
  padding: 15px 10px;
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 12px;
  color: #94a3b8;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
  text-align: center;
}

.spirit-nav-pill i { font-size: 1.4rem; color: #10b981; opacity: 0.8; transition: 0.3s;}

@media (hover: hover) {
  .spirit-nav-pill:hover { background: #10b981; color: #000; border-color: #10b981; transform: translateY(-3px); box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3); }
  .spirit-nav-pill:hover i { color: #000; opacity: 1; transform: scale(1.1); }
}

/* Các trạng thái Nav Pill đặc biệt */
.spirit-nav-pill.special { grid-column: span 3; flex-direction: row; background: rgba(251, 191, 36, 0.05); border-color: rgba(251, 191, 36, 0.2); }
.spirit-nav-pill.special i { color: #fbbf24; }
.spirit-nav-pill.special:hover { background: #fbbf24; color: #000; border-color: #fbbf24; }

.spirit-nav-pill.pending { grid-column: span 3; flex-direction: row; background: rgba(100, 116, 139, 0.1); border-color: rgba(100, 116, 139, 0.3); color: #64748b; cursor: not-allowed; }
.spirit-nav-pill.pending i { color: #64748b; }

.spirit-nav-pill.admin { grid-column: span 3; flex-direction: row; background: rgba(244, 63, 94, 0.05); border-color: rgba(244, 63, 94, 0.2); }
.spirit-nav-pill.admin i { color: #f43f5e; }
.spirit-nav-pill.admin:hover { background: #f43f5e; color: #fff; border-color: #f43f5e; }
.spirit-nav-pill.admin:hover i { color: #fff; }

/* Logout Area */
.logout-aura-area { margin-top: 40px; text-align: center; }
.btn-logout-spirit { background: transparent; border: 1px solid #f43f5e50; color: #f43f5e; padding: 12px 30px; border-radius: 50px; font-size: 0.9rem; font-weight: 800; cursor: pointer; transition: all 0.3s; display: inline-flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 1px;}
@media (hover: hover) { .btn-logout-spirit:hover { background: #f43f5e; color: #fff; box-shadow: 0 0 20px rgba(244, 63, 94, 0.4); transform: translateY(-2px); } }

/* Animations */
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes spiritual-flow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes auraBreath { 0%,100% { opacity: 0.68; transform: scale(0.98); } 50% { opacity: 1; transform: scale(1.03); } }
@keyframes flameFlicker { 0%,100% { filter: blur(10px) saturate(1); } 50% { filter: blur(12px) saturate(1.22); } }
@keyframes badge-pulse { from { filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.5)) drop-shadow(0 0 8px var(--badge-color, rgba(16, 185, 129, 0.3))); } to { filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 15px var(--badge-color, rgba(16, 185, 129, 0.8))); transform: scale(1.05); } }

/* Responsive */
@media (max-width: 768px) {
  .spirit-card-main { padding: 30px 20px; border-radius: 20px; }
  .title-spirit { font-size: 2rem; }
  .spirit-details-grid { grid-template-columns: 1fr; }
  .display-name { font-size: 1.5rem; }
  .spirit-nav-footer { grid-template-columns: 1fr; } /* Chuyển menu thành 1 cột trên mobile */
  .spirit-nav-pill, .spirit-nav-pill.special, .spirit-nav-pill.pending, .spirit-nav-pill.admin { grid-column: span 1; flex-direction: row; justify-content: flex-start; padding: 15px 20px; text-align: left; }
  .spirit-nav-pill i { font-size: 1.2rem; width: 24px; text-align: center; }
}
</style>