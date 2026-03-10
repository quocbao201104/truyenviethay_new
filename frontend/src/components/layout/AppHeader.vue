<template>
  <header class="header-xianxia">
    <div class="header-content-aura">
      
      <!-- TRẢI ĐẠO: LOGO & TẦM KIẾM -->
      <div class="header-left-spirit">
        <router-link to="/truyen-chu" class="logo-aura-link">
          <img
            src="@/assets/images/logo.png"
            alt="TruyenVietHay Logo"
            class="logo-spirit"
          />
        </router-link>

        <div class="spirit-search-container" @click="handleSearchBarClick">
          <div class="search-aura-input-group">
            <i class="fas fa-magnifying-glass search-spirit-icon"></i>
            <input
              ref="searchInputRef"
              type="text"
              placeholder="Cảm ứng linh vật..."
              class="aura-search-input"
              v-model="searchQuery"
              @input="handleSearchInput"
              @focus="handleSearchFocus"
              @keydown.enter="handleSearchSubmit"
            />
            <i 
              v-if="searchQuery" 
              class="fas fa-circle-xmark clear-spirit-icon" 
              @click="clearSearch"
            ></i>
          </div>
          
          <!-- THIÊN CƠ BẢNG (Search Suggestions) -->
          <div 
            v-if="showSuggestions && searchQuery" 
            class="spirit-suggestions-dropdown"
            @mousedown.prevent
          >
            <div v-if="searchLoading" class="spirit-loading">
              <i class="fas fa-yin-yang fa-spin"></i>
              <span>Đang thỉnh thiên cơ...</span>
            </div>

            <div v-else-if="searchResults.length === 0" class="spirit-empty">
              <i class="fas fa-eye-slash opacity-30"></i>
              <span>Vô tung vô ảnh cho "{{ searchQuery }}"</span>
            </div>

            <div v-else class="spirit-results-list">
              <router-link
                v-for="story in searchResults"
                :key="story.id"
                :to="`/truyen-chu/${story.slug}`"
                class="spirit-suggestion-item"
                @click="closeSuggestions"
              >
                <div class="suggestion-cover-wrapper">
                   <img :src="getStoryImageUrl(story.anh_bia)" :alt="story.ten_truyen" @error="handleImageError" />
                </div>
                <div class="suggestion-spirit-info">
                  <div class="suggestion-spirit-title">{{ story.ten_truyen }}</div>
                  <div class="suggestion-spirit-author">
                    <i class="fas fa-feather-pointed"></i> {{ story.tac_gia || 'Ẩn Danh' }}
                  </div>
                </div>
              </router-link>

              <router-link
                :to="`/tim-kiem?keyword=${encodeURIComponent(searchQuery)}`"
                class="spirit-see-all"
                @click="closeSuggestions"
              >
                Tầm Tiên Lộ <i class="fas fa-arrow-right-long ml-2"></i>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- HỮU ĐẠO: MENU & TU VI -->
      <div class="header-right-spirit">
        <nav class="spirit-nav">
          <router-link to="/the-loai" class="nav-spirit-link">Thể Loại</router-link>
          <router-link to="/xep-hang" class="nav-spirit-link">Xếp Hạng</router-link>
          <router-link to="/truyen-hot" class="nav-spirit-link">Truyện Hot</router-link>
        </nav>

        <div class="aura-separator"></div>

        <!-- TRUYỀN ÂM PHÙ (Notifications) -->
        <div v-if="isLoggedIn" class="notif-spirit-wrapper">
          <div class="notif-aura-trigger" @click="toggleNotification">
            <i class="fas fa-bell spirit-bell" :class="{ 'ringing': unreadCount > 0 }"></i>
            <span v-if="unreadCount > 0" class="spirit-badge">{{ unreadCount > 99 ? "99+" : unreadCount }}</span>
          </div>

          <div v-if="showNotifications" class="spirit-notif-dropdown-wrapper" @click.stop>
            <NotificationCenter 
              :unread-count="unreadCount" 
              @navigation="handleNotificationNavigation"
              @close="showNotifications = false"
            />
          </div>
        </div>

        <!-- ĐAN ĐIỀN (User Menu) -->
        <div v-if="isLoggedIn" class="user-spirit-menu">
          <div class="user-aura-trigger" @click="toggleDropdown">
            <img
              :src="avatarUrl"
              class="avatar-spirit"
              @error="handleAvatarError"
              crossorigin="anonymous"
            />
            <i class="fas fa-chevron-down caret-spirit" :class="{ 'rotate-aura': showDropdown }"></i>
          </div>

          <div v-if="showDropdown" class="user-spirit-dropdown">
            <div class="user-spirit-greeting">
              <span class="greeting-aura">Chào, {{ userFullName }}!</span>
            </div>
            
            <!-- Mobile-only nav items -->


            <router-link to="/user/thong-tin-ca-nhan" class="spirit-dropdown-item">
              <i class="fas fa-id-card-clip"></i> Thông Tin Cá Nhân
            </router-link>
            <router-link to="/nhiem-vu" class="spirit-dropdown-item">
              <i class="fas fa-fire-flame-curved"></i> Đạo Lộ Tu Luyện
            </router-link>
            <router-link to="/user/truyen-theo-doi" class="spirit-dropdown-item">
              <i class="fas fa-heart"></i> Truyện Theo Dõi
            </router-link>
            <router-link to="/user/lich-su-doc" class="spirit-dropdown-item">
              <i class="fas fa-clock-rotate-left"></i> Lịch Sử Đọc
            </router-link>
            <div class="mobile-nav-items">
          
              <router-link to="/xep-hang" class="spirit-dropdown-item">
                <i class="fas fa-trophy"></i> Xếp Hạng
              </router-link>
              <router-link to="/truyen-hot" class="spirit-dropdown-item">
                <i class="fas fa-fire"></i> Truyện Hot
              </router-link>
              <router-link to="/the-loai" class="spirit-dropdown-item">
                <i class="fas fa-list-ul"></i> Thể Loại
              </router-link>
              <div class="aura-divider"></div>
            </div>
            <div class="aura-divider"></div>
            <div class="spirit-dropdown-item logout-spirit" @click="handleLogout">
              <i class="fas fa-power-off"></i> Đăng xuất
            </div>
          </div>
        </div>

        <router-link v-else to="/dang-nhap" class="btn-spirit-login">
          <i class="fas fa-user-astronaut"></i>
          <span>Nhập Môn</span>
        </router-link>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAppToast } from "@/composables/useAppToast";
import { useAuthStore } from "@/modules/auth/auth.store";
import axios from "@/utils/axios";
import { useNotificationStore } from "@/modules/notification/notification.store";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getAvatarUrl, getImageUrl } from "@/config/constants";
import NotificationCenter from "@/modules/notification/components/NotificationCenter.vue";

export default {
  name: "AppHeader",
  components: {
    NotificationCenter
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const showDropdown = ref(false);
    const searchQuery = ref("");
    const showSuggestions = ref(false);
    const searchResults = ref([]);
    const searchLoading = ref(false);
    const searchInputRef = ref(null);
    let searchTimeout = null;

    const notificationStore = useNotificationStore();
    const showNotifications = ref(false);

    watch(() => authStore.token, (newToken) => {
        if (newToken) notificationStore.fetchNotifications(true);
        else notificationStore.$reset();
    });

    onMounted(() => {
      authStore.initialize();
      if (authStore.token) notificationStore.fetchNotifications(true);
      document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
      if (searchTimeout) clearTimeout(searchTimeout);
    });

    const isLoggedIn = computed(() => !!authStore.token && !!authStore.user);
    const userFullName = computed(() => authStore.user?.full_name || "Đạo hữu");
    const avatarUrl = computed(() => getAvatarUrl(authStore.user?.avatar));

    const handleAvatarError = (event) => { event.target.src = getAvatarUrl(null); };

    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value;
      if (showDropdown.value) showNotifications.value = false;
    };

    const { showSuccessToast } = useAppToast();
    const handleLogout = () => {
      authStore.logout();
      showDropdown.value = false;
      showSuccessToast("Hẹn gặp lại đạo hữu!");
      router.push("/truyen-chu");
    };

    const performSearch = async (keyword) => {
      if (!keyword || keyword.trim().length < 2) {
        searchResults.value = [];
        return;
      }
      searchLoading.value = true;
      try {
        const response = await axios.get('/api/truyen/public', {
          params: { keyword: keyword.trim(), limit: 5, sort_by: 'luot_xem', order: 'DESC' }
        });
        searchResults.value = response.data.data || [];
      } catch (error) {
        searchResults.value = [];
      } finally {
        searchLoading.value = false;
      }
    };

    const handleSearchInput = () => {
      if (searchTimeout) clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => performSearch(searchQuery.value), 300);
    };

    const handleSearchFocus = () => {
      showSuggestions.value = true;
      if (searchQuery.value?.trim().length >= 2) performSearch(searchQuery.value);
    };

    const handleSearchBarClick = (e) => e.stopPropagation();

    const handleClickOutside = (event) => {
      if (!event.target.closest('.spirit-search-container')) showSuggestions.value = false;
      if (!event.target.closest('.notif-spirit-wrapper')) showNotifications.value = false;
      if (!event.target.closest('.user-spirit-menu')) showDropdown.value = false;
    };

    const clearSearch = () => { searchQuery.value = ''; searchResults.value = []; };
    const closeSuggestions = () => showSuggestions.value = false;
    const handleSearchSubmit = () => {
      if (searchQuery.value.trim()) {
        router.push(`/tim-kiem?keyword=${encodeURIComponent(searchQuery.value.trim())}`);
        showSuggestions.value = false;
      }
    };

    const getStoryImageUrl = (path) => getImageUrl(path);
    const handleImageError = (e) => { e.target.src = '/placeholder.jpg'; };

    const notifications = computed(() => notificationStore.notifications);
    const unreadCount = computed(() => notificationStore.unreadCount);
    const toggleNotification = () => {
        showNotifications.value = !showNotifications.value;
        if (showNotifications.value) showDropdown.value = false;
    };
    
    const getNotifIcon = (type) => {
      if ([1, 2, 3].includes(type)) return 'fas fa-comments';
      if ([11, 12].includes(type)) return 'fas fa-scroll';
      if ([21, 22].includes(type)) return 'fas fa-bullhorn';
      return 'fas fa-envelope';
    };

    const handleNotificationNavigation = async (notif) => {
        showNotifications.value = false;
        if (notif.target_id) {
          try {
             const res = await axios.get(`/api/truyen/${notif.target_id}`);
             if (res.data?.data?.slug) router.push(`/truyen-chu/${res.data.data.slug}`);
          } catch (err) {
            console.error("Failed to navigate to story:", err);
          }
        }
    };

    return {
      isLoggedIn, userFullName, avatarUrl, showDropdown, toggleDropdown, handleLogout,
      searchQuery, showSuggestions, searchResults, searchLoading, searchInputRef,
      handleSearchInput, handleSearchFocus, handleSearchBarClick, clearSearch,
      closeSuggestions, handleSearchSubmit, getStoryImageUrl, handleImageError, handleAvatarError,
      toggleNotification, showNotifications, notifications, unreadCount,
      handleNotificationNavigation, getNotifIcon
    };
  },
};
</script>

<style scoped>
/* ===== CORE THEME SPIRIT ===== */
.header-xianxia {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1000;
  background: rgba(11, 15, 25, 0.8); /* Nền tối đồng bộ */
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  height: 70px;
}

.header-content-aura {
  max-width: 1440px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 25px;
}

/* ===== LEFT: LOGO & SEARCH ===== */
.header-left-spirit {
  display: flex;
  align-items: center;
  gap: 30px;
}

.logo-spirit {
  height: 40px;
  transition: all 0.3s;
  filter: drop-shadow(0 0 5px rgba(52, 211, 153, 0.2));
}

.logo-spirit:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 0 10px rgba(52, 211, 153, 0.5));
}

.spirit-search-container {
  position: relative;
  width: 320px;
}

.search-aura-input-group {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 50px;
  padding: 8px 18px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.search-aura-input-group:hover, .search-aura-input-group:focus-within {
  border-color: #34d399;
  background: rgba(52, 211, 153, 0.05);
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.2);
  width: 360px;
}

.search-spirit-icon { color: #64748b; margin-right: 10px; font-size: 0.9rem; }

.aura-search-input {
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 0.85rem;
  width: 100%;
  font-weight: 500;
}

.clear-spirit-icon { color: #475569; cursor: pointer; margin-left: 8px; font-size: 1rem; transition: color 0.3s; }
.clear-spirit-icon:hover { color: #f43f5e; }

/* Suggestions Xianxia */
.spirit-suggestions-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  width: 450px;
  background: #131b2c;
  border: 1px solid #1e293b;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.8);
  overflow: hidden;
  animation: slideInAura 0.3s ease-out;
}

.spirit-suggestion-item {
  display: flex;
  gap: 15px;
  padding: 12px 20px;
  text-decoration: none;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  transition: all 0.3s;
}

.spirit-suggestion-item:hover {
  background: rgba(52, 211, 153, 0.05);
  padding-left: 25px;
}

.suggestion-cover-wrapper img {
  width: 45px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.4);
}

.suggestion-spirit-title { color: #f8fafc; font-weight: 700; font-size: 0.9rem; margin-bottom: 4px; }
.suggestion-spirit-author { font-size: 0.75rem; color: #64748b; }
.suggestion-spirit-author i { font-size: 0.7rem; color: #34d39980; }

.spirit-see-all {
  display: flex;
  justify-content: center;
  padding: 12px;
  background: #34d399;
  color: #0b0f19;
  font-weight: 900;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* ===== RIGHT: NAV & USER ===== */
.header-right-spirit {
  display: flex;
  align-items: center;
  gap: 25px;
}

.spirit-nav {
  display: flex;
  gap: 20px;
}

.nav-spirit-link {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s;
  position: relative;
}

.nav-spirit-link:hover { color: #34d399; }
.nav-spirit-link::after {
  content: '';
  position: absolute; bottom: -5px; left: 50%; width: 0; height: 2px;
  background: #34d399; transition: all 0.3s; transform: translateX(-50%);
  box-shadow: 0 0 8px #34d399;
}
.nav-spirit-link:hover::after { width: 100%; }

.aura-separator { width: 1px; height: 20px; background: rgba(255,255,255,0.1); }

/* Notif Spirit */
/* Notif Spirit */
.notif-aura-trigger { 
  position: relative; 
  cursor: pointer; 
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s;
}
.notif-aura-trigger:hover {
  background: rgba(255, 255, 255, 0.05);
}

.spirit-bell { 
  font-size: 1.2rem; 
  color: #94a3b8; /* Chỉnh màu sáng hơn một chút */
  transition: all 0.3s; 
}
.spirit-bell.ringing { 
  color: #34d399; 
  animation: bellSwing 2s infinite ease-in-out; 
}

.spirit-badge {
  position: absolute; 
  top: 0px; 
  right: 0px;
  background: #ef4444; 
  color: #fff; 
  font-size: 0.65rem; 
  font-weight: 800;
  min-width: 18px; 
  height: 18px; 
  border-radius: 50%;
  display: flex; 
  align-items: center; 
  justify-content: center;
  border: 2px solid #0b0f19;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
}

/* Dropdown Wrapper for Notification Center */
.spirit-notif-dropdown-wrapper {
  position: relative; /* Let NotificationCenter handle its own absolute positioning */
}

/* User Menu */
.user-aura-trigger {
  display: flex; align-items: center; gap: 10px; cursor: pointer;
  padding: 5px 12px; background: rgba(255,255,255,0.05);
  border-radius: 50px; border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.3s;
}

.user-aura-trigger:hover { border-color: #34d39960; background: rgba(52, 211, 153, 0.05); }

.avatar-spirit {
  width: 30px; height: 30px; border-radius: 50%;
  border: 2px solid #34d399; object-fit: cover;
}

.user-spirit-dropdown {
  position: absolute; top: calc(100% + 12px); right: 25px;
  width: 260px; background: #131b2c; border: 1px solid #1e293b;
  border-radius: 20px; padding: 15px; box-shadow: 0 10px 40px rgba(0,0,0,0.6);
}

.spirit-dropdown-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 15px; color: #94a3b8; text-decoration: none;
  font-size: 0.85rem; font-weight: 600; border-radius: 12px;
  transition: all 0.3s;
}

.spirit-dropdown-item:hover { background: rgba(255,255,255,0.03); color: #fff; transform: translateX(5px); }
.spirit-dropdown-item.highlight-aura { color: #34d399; background: rgba(52, 211, 153, 0.05); }
.logout-spirit { color: #f43f5e; margin-top: 10px; }

.btn-spirit-login {
  background: #fff; color: #0b0f19; padding: 8px 20px;
  border-radius: 50px; font-weight: 900; text-transform: uppercase;
  font-size: 0.75rem; display: flex; align-items: center; gap: 10px;
  transition: all 0.3s; border: none; text-decoration: none;
}
.btn-spirit-login:hover { transform: scale(1.05); box-shadow: 0 0 15px rgba(255,255,255,0.3); }

/* Animations */
@keyframes slideInAura { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes bellSwing { 
  0%, 100% { transform: rotate(0); }
  10%, 30% { transform: rotate(15deg); }
  20%, 40% { transform: rotate(-15deg); }
}
.animate-spin-slow { animation: spin 10s linear infinite; }
@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }

/* Mobile */
@media (max-width: 768px) {
  .spirit-search-container, .spirit-nav { display: none; }
  .header-content-aura { padding: 0 15px; }
  .logo-spirit { height: 32px; }
  .mobile-nav-items { display: block; }
}

@media (min-width: 769px) {
  .mobile-nav-items { display: none; }
}
</style>