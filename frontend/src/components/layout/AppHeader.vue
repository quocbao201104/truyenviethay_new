<template>
  <header class="header-xianxia">
    <div class="header-content-aura">
      
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
              placeholder="Tỏa thần thức tìm kiếm..."
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
          
          <div 
            v-if="showSuggestions && searchQuery" 
            class="spirit-suggestions-dropdown cosmic-glass"
            @mousedown.prevent
          >
            <div v-if="searchLoading" class="spirit-loading">
              <i class="fas fa-yin-yang fa-spin text-cyan-400 text-2xl mb-2"></i>
              <span>Đang thỉnh thiên cơ...</span>
            </div>

            <div v-else-if="searchResults.length === 0" class="spirit-empty">
              <i class="fas fa-eye-slash opacity-30 text-3xl mb-2"></i>
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

      <div class="header-right-spirit">
        <nav class="spirit-nav">
          <router-link to="/the-loai" class="nav-spirit-link">Tàng Kinh Các</router-link>
          <router-link to="/xep-hang" class="nav-spirit-link">Kỳ Thư</router-link>
          <router-link to="/truyen-hot" class="nav-spirit-link">Thiên Bảng</router-link>
        </nav>

        <div class="aura-separator"></div>

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

        <div v-if="isLoggedIn" class="user-spirit-menu">
          <div class="user-aura-trigger" @click="toggleDropdown">
            <div class="avatar-ring-glow">
              <img
                :src="avatarUrl"
                class="avatar-spirit"
                @error="handleAvatarError"
                crossorigin="anonymous"
              />
            </div>
            <i class="fas fa-chevron-down caret-spirit" :class="{ 'rotate-aura': showDropdown }"></i>
          </div>

          <div v-if="showDropdown" class="user-spirit-dropdown cosmic-glass">
            <div class="user-spirit-greeting">
              <span class="greeting-aura">Đạo hữu, <strong class="text-cyan-400">{{ userFullName }}</strong>!</span>
            </div>
            
            <div class="aura-divider-horizontal"></div>

            <router-link to="/user/thong-tin-ca-nhan" class="spirit-dropdown-item">
              <i class="fas fa-id-card-clip"></i> Lệnh Bài Thân Phận
            </router-link>
            <router-link to="/nhiem-vu" class="spirit-dropdown-item highlight-aura">
              <i class="fas fa-meteor"></i> Động Thiên Phúc Địa
            </router-link>
            <router-link to="/user/truyen-theo-doi" class="spirit-dropdown-item">
              <i class="fas fa-fingerprint"></i> Thần Thức Lạc Ấn
            </router-link>
            <router-link to="/user/lich-su-doc" class="spirit-dropdown-item">
              <i class="fas fa-hourglass-half"></i> Tuế Nguyệt Lục
            </router-link>
            
            <div class="mobile-nav-items">
              <div class="aura-divider-horizontal"></div>
              <router-link to="/xep-hang" class="spirit-dropdown-item">
                <i class="fas fa-trophy"></i> Thiên Bảng
              </router-link>
              <router-link to="/truyen-hot" class="spirit-dropdown-item">
                <i class="fas fa-fire"></i> Kỳ Thư
              </router-link>
              <router-link to="/the-loai" class="spirit-dropdown-item">
                <i class="fas fa-book-bookmark"></i> Tàng Kinh Các
              </router-link>
            </div>
            
            <div class="aura-divider-horizontal"></div>
            
            <div class="spirit-dropdown-item logout-spirit" @click="handleLogout">
              <i class="fas fa-power-off"></i> Thu Hồi Thần Thức
            </div>
          </div>
        </div>

        <router-link v-else to="/dang-nhap" class="btn-spirit-login">
          <i class="fas fa-user-astronaut"></i>
          <span>Quy Vị Tiên Môn</span>
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
    const userFullName = computed(() => authStore.user?.full_name || "Vô Danh");
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
      showSuccessToast("Hẹn ngày tái ngộ, đạo hữu bảo trọng!");
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
    
    const handleNotificationNavigation = async (notif) => {
        showNotifications.value = false;
        if (notif.target_id) {
          try {
             const res = await axios.get(`/api/truyen/${notif.target_id}`);
             if (res.data?.data?.slug) router.push(`/truyen-chu/${res.data.data.slug}`);
          } catch (err) {
            console.error("Thiên cơ che lấp, không thể tiếp cận:", err);
          }
        }
    };

    return {
      isLoggedIn, userFullName, avatarUrl, showDropdown, toggleDropdown, handleLogout,
      searchQuery, showSuggestions, searchResults, searchLoading, searchInputRef,
      handleSearchInput, handleSearchFocus, handleSearchBarClick, clearSearch,
      closeSuggestions, handleSearchSubmit, getStoryImageUrl, handleImageError, handleAvatarError,
      toggleNotification, showNotifications, notifications, unreadCount,
      handleNotificationNavigation
    };
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;700;900&display=swap');

/* ===== CORE THEME SPIRIT ===== */
.header-xianxia {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1000;
  background: rgba(2, 6, 23, 0.85); /* Midnight Blue Deep */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(34, 211, 238, 0.15); /* Viền Băng Lam */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  height: 70px;
  font-family: 'Be Vietnam Pro', sans-serif;
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

/* Kính mờ dùng chung cho dropdown */
.cosmic-glass {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(34, 211, 238, 0.2);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(34, 211, 238, 0.05);
}

/* ===== LEFT: LOGO & SEARCH ===== */
.header-left-spirit { display: flex; align-items: center; gap: 30px; }

.logo-spirit {
  height: 40px; transition: all 0.4s;
  filter: drop-shadow(0 0 5px rgba(34, 211, 238, 0.3));
}
.logo-spirit:hover { transform: scale(1.05); filter: drop-shadow(0 0 15px rgba(34, 211, 238, 0.7)); }

.spirit-search-container { position: relative; width: 320px; }

.search-aura-input-group {
  display: flex; align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(34, 211, 238, 0.2);
  border-radius: 50px; padding: 8px 18px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.search-aura-input-group:hover, .search-aura-input-group:focus-within {
  border-color: #22d3ee; background: rgba(34, 211, 238, 0.05);
  box-shadow: 0 0 15px rgba(34, 211, 238, 0.2); width: 380px;
}

.search-spirit-icon { color: #64748b; margin-right: 10px; font-size: 0.9rem; transition: 0.3s;}
.search-aura-input-group:focus-within .search-spirit-icon { color: #22d3ee; }

.aura-search-input {
  background: transparent; border: none; outline: none;
  color: #fff; font-size: 0.85rem; width: 100%; font-weight: 500;
}
.aura-search-input::placeholder { color: #64748b; }

.clear-spirit-icon { color: #475569; cursor: pointer; margin-left: 8px; font-size: 1rem; transition: color 0.3s; }
.clear-spirit-icon:hover { color: #f43f5e; }

/* Suggestions Xianxia */
.spirit-suggestions-dropdown {
  position: absolute; top: calc(100% + 15px); left: 0;
  width: 450px; border-radius: 20px; overflow: hidden;
  animation: slideInAura 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.spirit-loading, .spirit-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 40px 20px; color: #64748b; font-size: 0.9rem; font-weight: 600;
}

.spirit-suggestion-item {
  display: flex; gap: 15px; padding: 15px 20px; text-decoration: none;
  border-bottom: 1px solid rgba(255,255,255,0.05); transition: all 0.3s;
}
.spirit-suggestion-item:hover { background: rgba(34, 211, 238, 0.08); padding-left: 25px; }

.suggestion-cover-wrapper img {
  width: 45px; height: 60px; object-fit: cover; border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1);
}

.suggestion-spirit-title { color: #f8fafc; font-weight: 700; font-size: 0.95rem; margin-bottom: 4px; }
.suggestion-spirit-author { font-size: 0.75rem; color: #94a3b8; }
.suggestion-spirit-author i { font-size: 0.7rem; color: #22d3ee; }

.spirit-see-all {
  display: flex; justify-content: center; padding: 14px;
  background: linear-gradient(90deg, #0ea5e9, #22d3ee);
  color: #020617; font-weight: 900; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;
}

/* ===== RIGHT: NAV & USER ===== */
.header-right-spirit { display: flex; align-items: center; gap: 25px; }
.spirit-nav { display: flex; gap: 24px; }

.nav-spirit-link {
  color: #94a3b8; text-decoration: none; font-size: 0.85rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s; position: relative;
}
.nav-spirit-link:hover { color: #22d3ee; text-shadow: 0 0 8px rgba(34, 211, 238, 0.5); }
.nav-spirit-link::after {
  content: ''; position: absolute; bottom: -6px; left: 50%; width: 0; height: 2px;
  background: #22d3ee; transition: all 0.3s; transform: translateX(-50%); box-shadow: 0 0 8px #22d3ee;
}
.nav-spirit-link:hover::after { width: 100%; }

.aura-separator { width: 1px; height: 24px; background: rgba(255,255,255,0.1); }

/* Notif Spirit */
.notif-aura-trigger { 
  position: relative; cursor: pointer; padding: 10px; border-radius: 50%; transition: all 0.3s;
}
.notif-aura-trigger:hover { background: rgba(34, 211, 238, 0.1); }

.spirit-bell { font-size: 1.25rem; color: #cbd5e1; transition: all 0.3s; }
.notif-aura-trigger:hover .spirit-bell { color: #22d3ee; }
.spirit-bell.ringing { color: #fbbf24; animation: bellSwing 2s infinite ease-in-out; filter: drop-shadow(0 0 5px #fbbf24); }

.spirit-badge {
  position: absolute; top: 0px; right: 0px;
  background: linear-gradient(135deg, #ef4444, #b91c1c); color: #fff; 
  font-size: 0.65rem; font-weight: 900; min-width: 18px; height: 18px; 
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  border: 2px solid #020617; box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
}

.spirit-notif-dropdown-wrapper { position: relative; }

/* User Menu */
.user-aura-trigger {
  display: flex; align-items: center; gap: 10px; cursor: pointer;
  padding: 6px 14px 6px 6px; background: rgba(255,255,255,0.05);
  border-radius: 50px; border: 1px solid rgba(255,255,255,0.1); transition: all 0.3s;
}
.user-aura-trigger:hover { border-color: rgba(34, 211, 238, 0.4); background: rgba(34, 211, 238, 0.05); box-shadow: 0 0 15px rgba(34, 211, 238, 0.15); }

.avatar-ring-glow {
  width: 32px; height: 32px; border-radius: 50%;
  padding: 2px; background: linear-gradient(135deg, #22d3ee, #3b82f6);
}
.avatar-spirit { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; background: #000; }
.caret-spirit { color: #94a3b8; font-size: 0.8rem; transition: 0.3s; }
.rotate-aura { transform: rotate(180deg); color: #22d3ee; }

.user-spirit-dropdown {
  position: absolute; top: calc(100% + 15px); right: 25px;
  width: 280px; border-radius: 20px; padding: 15px; 
  animation: slideInAura 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.user-spirit-greeting { padding: 5px 15px 10px; }
.greeting-aura { font-size: 0.95rem; color: #f8fafc; font-weight: 600; }

.aura-divider-horizontal { height: 1px; background: rgba(255,255,255,0.1); margin: 8px 0; }

.spirit-dropdown-item {
  display: flex; align-items: center; gap: 12px; padding: 12px 15px; 
  color: #cbd5e1; text-decoration: none; font-size: 0.9rem; font-weight: 600; 
  border-radius: 12px; transition: all 0.3s; cursor: pointer;
}

.spirit-dropdown-item i { width: 20px; text-align: center; color: #64748b; transition: 0.3s; }
.spirit-dropdown-item:hover { background: rgba(255,255,255,0.05); color: #fff; transform: translateX(5px); }
.spirit-dropdown-item:hover i { color: #22d3ee; }

.spirit-dropdown-item.highlight-aura { color: #22d3ee; background: rgba(34, 211, 238, 0.1); border: 1px solid rgba(34, 211, 238, 0.2); }
.spirit-dropdown-item.highlight-aura i { color: #22d3ee; }
.spirit-dropdown-item.highlight-aura:hover { box-shadow: 0 0 15px rgba(34, 211, 238, 0.2); }

.logout-spirit { color: #f43f5e; }
.logout-spirit i { color: #f43f5e; }
.logout-spirit:hover { background: rgba(244, 63, 94, 0.1); color: #f43f5e; }

.btn-spirit-login {
  background: linear-gradient(135deg, #0ea5e9, #22d3ee); color: #020617; 
  padding: 10px 24px; border-radius: 50px; font-weight: 900; text-transform: uppercase;
  font-size: 0.8rem; display: flex; align-items: center; gap: 10px;
  transition: all 0.3s; border: none; text-decoration: none;
  box-shadow: 0 4px 15px rgba(34, 211, 238, 0.3);
}
.btn-spirit-login:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(34, 211, 238, 0.5); }

/* Animations */
@keyframes slideInAura { from { opacity: 0; transform: scale(0.95) translateY(-10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes bellSwing { 0%, 100% { transform: rotate(0); } 10%, 30% { transform: rotate(15deg); } 20%, 40% { transform: rotate(-15deg); } }

/* Mobile */
@media (max-width: 768px) {
  .spirit-search-container, .spirit-nav { display: none; }
  .header-content-aura { padding: 0 15px; }
  .logo-spirit { height: 32px; }
  .mobile-nav-items { display: block; }
}

@media (min-width: 769px) { .mobile-nav-items { display: none; } }
</style>