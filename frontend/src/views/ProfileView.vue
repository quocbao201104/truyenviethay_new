<template>
  <div class="profile-page-xianxia">
    <main class="profile-container-aura">
      
      <div v-if="userStore.isProfileLoading" class="loading-spirit-state">
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
            <div class="spirit-array-center" :class="equippedFrameClass">
              <div class="magic-circle-spin" v-if="equippedFrameImage"></div>
              <div class="magic-circle-reverse" v-if="equippedFrameImage"></div>
              <img
                :src="avatarUrl"
                alt="User Avatar"
                class="hero-avatar item-img"
                @error="handleAvatarError"
                crossorigin="anonymous"
              />
              <img
                v-if="equippedFrameImage"
                :src="equippedFrameImage"
                alt="Avatar Frame"
                class="hero-frame"
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

          <div class="action-sections-wrapper">
            
            <div class="action-group">
              <h3 class="group-title"><i class="fas fa-meteor text-amber-400"></i> Hành Trang Tu Luyện</h3>
              <div class="group-grid">
                <router-link to="/nhiem-vu" class="spirit-nav-card gold">
                  <div class="card-icon"><i class="fas fa-fire-flame-curved"></i></div>
                  <div class="card-text">
                    <span class="card-name">Động Thiên Phúc Địa</span>
                    <span class="card-desc">Nhiệm vụ, Túi đồ, Đột phá</span>
                  </div>
                </router-link>

                <router-link to="/user/truyen-theo-doi" class="spirit-nav-card emerald">
                  <div class="card-icon"><i class="fas fa-book-bookmark"></i></div>
                  <div class="card-text">
                    <span class="card-name">Truyện Theo Dõi</span>
                    <span class="card-desc">Bí tịch đang lĩnh hội</span>
                  </div>
                </router-link>

                <router-link to="/user/tac-gia-theo-doi" class="spirit-nav-card emerald">
                  <div class="card-icon"><i class="fas fa-user-group"></i></div>
                  <div class="card-text">
                    <span class="card-name">Tác Giả Theo Dõi</span>
                    <span class="card-desc">Các bậc Tôn giả đã khắc ấn</span>
                  </div>
                </router-link>
                
                <router-link to="/user/lich-su-doc" class="spirit-nav-card cyan">
                  <div class="card-icon"><i class="fas fa-scroll"></i></div>
                  <div class="card-text">
                    <span class="card-name">Lịch Sử Đọc</span>
                    <span class="card-desc">Tuế nguyệt lục truy hồi</span>
                  </div>
                </router-link>
              </div>
            </div>

            <div class="action-group">
              <h3 class="group-title"><i class="fas fa-id-card-clip text-blue-400"></i> Quản Lý Thân Phận</h3>
              <div class="group-grid">
                <router-link to="/user/cai-dat-thong-tin" class="spirit-nav-card blue">
                  <div class="card-icon"><i class="fas fa-user-gear"></i></div>
                  <div class="card-text">
                    <span class="card-name">Khắc Lại Thông Tin</span>
                    <span class="card-desc">Thay đổi tên, mật khẩu...</span>
                  </div>
                </router-link>

                <div v-if="user?.role === 'user' && userStore.applicationStatus?.status === 'pending'" class="spirit-nav-card gray cursor-not-allowed">
                  <div class="card-icon"><i class="fas fa-hourglass-half"></i></div>
                  <div class="card-text">
                    <span class="card-name">Đang chờ thụ phong</span>
                    <span class="card-desc">Thiên đạo đang xem xét</span>
                  </div>
                </div>
                
                <router-link v-else-if="user?.role === 'user'" to="/user/dang-ky-tac-gia" class="spirit-nav-card purple">
                  <div class="card-icon"><i class="fas fa-feather-pointed"></i></div>
                  <div class="card-text">
                    <span class="card-name">Xin Khai Tông Lập Phái</span>
                    <span class="card-desc">Đăng ký trở thành Tác giả</span>
                  </div>
                </router-link>

                <router-link v-if="user?.role === 'author'" to="/user/dashboard" class="spirit-nav-card purple">
                  <div class="card-icon"><i class="fas fa-chart-line"></i></div>
                  <div class="card-text">
                    <span class="card-name">Bảng Điều Khiển</span>
                    <span class="card-desc">Quản lý truyện sáng tác</span>
                  </div>
                </router-link>

                <router-link v-if="user?.role === 'admin'" to="/admin/dashboard" class="spirit-nav-card rose">
                  <div class="card-icon"><i class="fas fa-shield-halved"></i></div>
                  <div class="card-text">
                    <span class="card-name">Quản Trị Vạn Giới</span>
                    <span class="card-desc">Quyền hạn của Thiên Đạo</span>
                  </div>
                </router-link>
              </div>
            </div>

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
import { getAvatarUrl, getImageUrl } from "@/config/constants";

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
    const equippedFrameImage = computed(() => {
      const raw = user.value?.equipped_frame?.image_url;
      return raw ? getImageUrl(raw) : null;
    });
    
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
  background: #101724; 
  color: #cbd5e1;
  font-family: 'Be Vietnam Pro', sans-serif;
  padding-bottom: 92px;
}

.profile-container-aura {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 20px 24px;
}

/* Loading/Error States */
.loading-spirit-state, .error-spirit-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 400px; text-align: center;
}
.error-box-aura { background: rgba(244, 63, 94, 0.05); border: 1px solid rgba(244, 63, 94, 0.2); padding: 30px; border-radius: 20px; }
.btn-re-login { display: inline-block; margin-top: 15px; padding: 10px 20px; background: #10b981; color: #000; border-radius: 8px; font-weight: bold; text-decoration: none; }

/* Page Header */
.page-header-xianxia { text-align: center; margin-bottom: 46px; }

.title-spirit {
  font-size: 2.5rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 6px;
  background: linear-gradient(to right, #10b981, #ffffff, #10b981);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: none;
}

.divider-spirit { height: 1px; width: 240px; background: linear-gradient(90deg, transparent, #10b981, transparent); margin: 15px auto; position: relative; }
.divider-spirit .dot { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg); width: 8px; height: 8px; background: #10b981; box-shadow: none; }

/* ===== MAIN CARD (NGỌC BÀI) ===== */
.spirit-card-main {
  background: linear-gradient(180deg, rgba(21, 31, 47, 0.96), rgba(15, 23, 35, 0.98));
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-lg);
  padding: 44px 38px;
  box-shadow: var(--app-shadow-2);
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
  display: flex; flex-direction: column; align-items: center; gap: 24px; margin-bottom: 48px; text-align: center;
  padding: 28px 24px 30px;
  background: rgba(17, 25, 38, 0.46);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 22px;
}

/* ===== SPIRIT ARRAY AVATAR ===== */
.spirit-array-center {
  position: relative; width: 160px; height: 160px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  --aura-primary: 16, 185, 129; 
}

.magic-circle-spin, .magic-circle-reverse {
  position: absolute; inset: -12px; border-radius: 50%;
  border: 2px dashed rgba(var(--aura-primary), 0.4);
  animation: spinArray 20s linear infinite; pointer-events: none;
  filter: none;
}
.magic-circle-reverse {
  inset: -20px; border: 1px dotted rgba(var(--aura-primary), 0.6);
  animation: spinArrayReverse 15s linear infinite;
}

.hero-avatar {
  position: relative; z-index: 2; width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
  border: 4px solid rgba(var(--aura-primary), 0.8); background: #000;
  box-shadow: none;
  transform: scale(0.80);
}
 
.hero-frame {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain;
  transform: scale(1.45); z-index: 3; pointer-events: none;
}

/* Frame specific aura colors */
.spirit-array-center.frame-phoenix-fire { --aura-primary: 239, 68, 68; }
.spirit-array-center.frame-bang-tinh { --aura-primary: 56, 189, 248; }
.spirit-array-center.frame-thien-thanh { --aura-primary: 234, 179, 8; }
.spirit-array-center.frame-nine-tails-purple { --aura-primary: 168, 85, 247; }
.spirit-array-center.frame-chan-long { --aura-primary: 251, 191, 36; }
.spirit-array-center.frame-van-kiem { --aura-primary: 148, 163, 184; }
.spirit-array-center.frame-ma-ton { --aura-primary: 225, 29, 72; }
.spirit-array-center.frame-bang-long { --aura-primary: 30, 209, 219; }
.spirit-array-center.frame-thien-co { --aura-primary: 217, 70, 239; }
.spirit-array-center.frame-that-sac { --aura-primary: 255, 107, 107; }

@keyframes spinArray { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes spinArrayReverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }

.status-dot-aura { position: absolute; bottom: 20px; right: 20px; width: 16px; height: 16px; background: #10b981; border: 3px solid #131b2c; border-radius: 50%; box-shadow: none; z-index: 5; }

/* Name Plate */
.name-spirit-plate {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.plate-magic-wrapper {
  position: relative; display: inline-flex; padding: 2px; border-radius: 50px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--badge-color) 70%, transparent), transparent, color-mix(in srgb, var(--badge-color) 70%, transparent));
  background-size: 200% 200%; animation: spiritual-flow 6s ease infinite; margin-bottom: 5px; z-index: 1;
}
.plate-magic-wrapper::after {
  content: ""; position: absolute; inset: -2px; background: inherit; filter: blur(3px); opacity: 0.28; z-index: -1; border-radius: 50px; animation: spiritual-flow 6s ease infinite;
}
.plate-inner {
  display: inline-flex; align-items: center; justify-content: center; gap: 15px; padding: 8px 30px;
  background: #101724; border-radius: 50px; z-index: 2; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03);
}
.display-name {
  font-size: 1.8rem; font-weight: 900; color: #ffffff; margin: 0; line-height: 1;
  text-shadow: none; letter-spacing: 0.5px;
}
.user-badge[size="md"] { display: flex; align-items: center; }
.magic-badge-glow { animation: badge-pulse 3s infinite ease-in-out alternate; }
.spirit-handle { font-size: 0.95rem; color: #64748b; font-weight: 600; letter-spacing: 1px;}

/* KHU VỰC KHẮC CHỮ (Info Grid) */
.spirit-details-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; margin-bottom: 50px;
}
.detail-crystal {
  display: flex; align-items: center; gap: 15px; padding: 20px 20px;
  background: rgba(12, 18, 29, 0.34); border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 16px; box-shadow: none; transition: background-color 0.2s ease, border-color 0.2s ease;
}
@media (hover: hover) { .detail-crystal:hover { background: rgba(72, 207, 165, 0.05); border-color: rgba(72, 207, 165, 0.22); } }

.icon-wrapper {
  width: 40px; height: 40px; border-radius: 10px; background: rgba(16, 185, 129, 0.1);
  display: flex; align-items: center; justify-content: center; border: 1px solid rgba(16, 185, 129, 0.2);
}
.icon-aura { font-size: 1.2rem; color: #10b981; }
.icon-wrapper.gold { background: rgba(251, 191, 36, 0.1); border-color: rgba(251, 191, 36, 0.2); }
.icon-wrapper.gold .icon-aura { color: #fbbf24; }
.icon-wrapper.emerald { background: rgba(52, 211, 153, 0.1); border-color: rgba(52, 211, 153, 0.2); }
.icon-wrapper.emerald .icon-aura { color: #34d399; }

.text-group { display: flex; flex-direction: column; }
.text-group .label { font-size: 0.7rem; color: #7d8da5; font-weight: 800; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 0.6px;}
.text-group .value { font-size: 0.98rem; color: #e8eff8; font-weight: 700; line-height: 1.45; }


/* =======================================================
   KHU VỰC BẢNG ĐIỀU KHIỂN (Nhóm Nút Mới)
   ======================================================= */
.action-sections-wrapper {
  display: flex;
  flex-direction: column;
  gap: 34px;
  padding-top: 34px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.group-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #f8fafc;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.group-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

/* Giao diện Thẻ Nút Bấm */
.spirit-nav-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 18px 20px;
  background: rgba(15, 23, 42, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  text-decoration: none;
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
  cursor: pointer;
  box-shadow: none;
}

.spirit-nav-card:hover {
  transform: translateY(-2px);
  background: rgba(30, 41, 59, 0.58);
}

/* Icon Box */
.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.card-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-name {
  font-size: 1rem;
  font-weight: 700;
  color: #f1f5f9;
  line-height: 1.4;
}

.card-desc {
  font-size: 0.76rem;
  color: #8fa1b7;
  line-height: 1.45;
}

/* Biến thể Màu Sắc cho Thẻ */
/* Vàng Kim (Nhiệm Vụ) */
.spirit-nav-card.gold:hover { border-color: #fbbf24; }
.spirit-nav-card.gold .card-icon { color: #fbbf24; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.2); }
.spirit-nav-card.gold:hover .card-icon { background: rgba(251, 191, 36, 0.16); color: #fbd580; box-shadow: none; }

/* Lục Bảo (Theo dõi) */
.spirit-nav-card.emerald:hover { border-color: #34d399; }
.spirit-nav-card.emerald .card-icon { color: #34d399; background: rgba(52, 211, 153, 0.1); border: 1px solid rgba(52, 211, 153, 0.2); }
.spirit-nav-card.emerald:hover .card-icon { background: rgba(52, 211, 153, 0.16); color: #7be7c2; box-shadow: none; }

/* Băng Lam (Lịch sử) */
.spirit-nav-card.cyan:hover { border-color: #22d3ee; }
.spirit-nav-card.cyan .card-icon { color: #22d3ee; background: rgba(34, 211, 238, 0.1); border: 1px solid rgba(34, 211, 238, 0.2); }
.spirit-nav-card.cyan:hover .card-icon { background: rgba(34, 211, 238, 0.16); color: #7edff1; box-shadow: none; }

/* Xanh Dương (Cài đặt) */
.spirit-nav-card.blue:hover { border-color: #3b82f6; }
.spirit-nav-card.blue .card-icon { color: #60a5fa; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); }
.spirit-nav-card.blue:hover .card-icon { background: rgba(59, 130, 246, 0.16); color: #92c0ff; box-shadow: none; }

/* Tím (Tác giả) */
.spirit-nav-card.purple:hover { border-color: #a855f7; }
.spirit-nav-card.purple .card-icon { color: #c084fc; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.2); }
.spirit-nav-card.purple:hover .card-icon { background: rgba(168, 85, 247, 0.16); color: #ddb7ff; box-shadow: none; }

/* Đỏ (Admin) */
.spirit-nav-card.rose:hover { border-color: #f43f5e; }
.spirit-nav-card.rose .card-icon { color: #fb7185; background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.2); }
.spirit-nav-card.rose:hover .card-icon { background: rgba(244, 63, 94, 0.16); color: #ff9aac; box-shadow: none; }

/* Xám (Pending) */
.spirit-nav-card.gray { border-color: rgba(100, 116, 139, 0.3); opacity: 0.6; cursor: not-allowed; }
.spirit-nav-card.gray .card-icon { color: #94a3b8; background: rgba(100, 116, 139, 0.1); }
.spirit-nav-card.gray:hover { transform: none; box-shadow: none; }


/* Logout Area */
.logout-aura-area { margin-top: 48px; text-align: center; }
.btn-logout-spirit { background: transparent; border: 1px solid #f43f5e50; color: #f43f5e; padding: 12px 30px; border-radius: 50px; font-size: 0.9rem; font-weight: 800; cursor: pointer; transition: all 0.3s; display: inline-flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 1px;}
@media (hover: hover) { .btn-logout-spirit:hover { background: rgba(244, 63, 94, 0.14); color: #ffb7c2; box-shadow: none; transform: translateY(-1px); } }

/* Animations */
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes spiritual-flow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes badge-pulse { from { filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.3)) drop-shadow(0 0 5px var(--badge-color, rgba(16, 185, 129, 0.18))); } to { filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5)) drop-shadow(0 0 8px var(--badge-color, rgba(16, 185, 129, 0.28))); transform: scale(1.02); } }

/* Responsive */
@media (max-width: 768px) {
  .spirit-card-main { padding: 30px 20px; border-radius: 20px; }
  .title-spirit { font-size: 2rem; }
  .spirit-details-grid { grid-template-columns: 1fr; }
  .display-name { font-size: 1.5rem; }
  
  /* Đưa các Thẻ Nút về 1 cột trên Mobile để dễ bấm nhất */
  .group-grid { grid-template-columns: 1fr; }
  
  .spirit-nav-card { padding: 14px 16px; }
  .card-icon { width: 40px; height: 40px; font-size: 1.1rem; }
}
</style>
