<template>
  <header class="header">
    <div class="header-content">
      <div class="header-left">
        <router-link to="/truyen-chu" class="logo-link">
          <img
            src="@/assets/images/logo.png"
            alt="TruyenVietHay Logo"
            class="logo"
          />
        </router-link>

        <div class="search-bar">
          <i class="fas fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            placeholder="Tìm kiếm truyện..."
            class="search-input"
            v-model="searchQuery"
            @focus="showSuggestions = true"
            @blur="showSuggestions = false"
          />
          <div v-if="showSuggestions && searchQuery" class="search-suggestions">
            <div class="suggestion-item">Ngôn Tình</div>
            <div class="suggestion-item">Kiếm Hiệp</div>
            <div class="suggestion-item">Kinh Dị</div>
          </div>
        </div>
      </div>

      <div class="header-right">
        <nav class="nav-menu">
          <router-link to="/the-loai" class="nav-link">Thể loại</router-link>

          <router-link to="/xep-hang" class="nav-link">Xếp Hạng</router-link>
          <router-link to="/duyet-tim" class="nav-link">Duyệt Tìm</router-link>
          <router-link to="/truyen-viet" class="nav-link"
            >Truyện Việt</router-link
          >
          <router-link to="/truyen-hot" class="nav-link"
            >Truyện Hot</router-link
          >
        </nav>

        <span class="separator">|</span>

        <div v-if="isLoggedIn" class="user-menu">
          <div class="avatar-wrapper" @click="toggleDropdown">
            <img
              :src="avatarUrl"
              alt="User Avatar"
              class="user-avatar"
              @error="handleAvatarError"
              crossorigin="anonymous"
            />

            <i
              class="fas fa-caret-down dropdown-toggle-icon"
              :class="{ rotate: showDropdown }"
            ></i>
          </div>

          <div v-if="showDropdown" class="user-dropdown">
            <div class="user-greeting">
              <img
                :src="avatarUrl"
                alt="User Avatar"
                class="greeting-avatar"
                @error="handleAvatarError"
                crossorigin="anonymous"
              />
              <span>Chào, {{ userFullName }}!</span>
            </div>
            <router-link to="/user/thong-tin-ca-nhan" class="dropdown-item">
              <i class="fas fa-user"></i> Thông Tin Cá Nhân
            </router-link>
            <router-link to="/user/truyen-theo-doi" class="dropdown-item">
              <i class="fas fa-bookmark"></i> Truyện Theo Dõi
            </router-link>
            <router-link to="/user/lich-su-doc" class="dropdown-item">
              <i class="fas fa-history"></i> Lịch Sử Đọc
            </router-link>
            <router-link to="/user/cai-dat-thong-tin" class="dropdown-item">
              <i class="fas fa-cog"></i> Cài Đặt Thông Tin
            </router-link>
            <div class="dropdown-item logout" @click="handleLogout">
              <i class="fas fa-sign-out-alt"></i> Đăng Xuất
            </div>
          </div>
        </div>

        <router-link v-else to="/dang-nhap" class="login-button">
          <i class="fas fa-user login-icon"></i>
          Đăng nhập
        </router-link>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/auth.store";

export default {
  name: "AppHeader",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const showDropdown = ref(false);
    // showGenreDropdown không còn cần thiết
    const searchQuery = ref("");
    const showSuggestions = ref(false);

    onMounted(() => {
      authStore.initialize();
    });

    const isLoggedIn = computed(() => !!authStore.token && !!authStore.user);

    const userFullName = computed(
      () => authStore.user?.full_name || "Người dùng"
    );

    const avatarUrl = computed(() => {
      const userAvatar = authStore.user?.avatar;
      // Nếu có avatar BE → dùng luôn
      if (userAvatar) {
        return `http://localhost:3000${userAvatar}`;
      }
      // Nếu BE chưa set → fallback ảnh default trên BE
      return `http://localhost:3000/uploads_img/avatar/default-avatar.jpg`;
    });

    const avatarErrored = ref(false);

    const handleAvatarError = (event) => {
      if (!avatarErrored.value) {
        console.warn("Avatar load failed, switching to fallback.");
        avatarErrored.value = true;
        event.target.src =
          "http://localhost:3000/uploads_img/avatar/default-avatar.jpg";
      } else {
        console.error("Fallback avatar also failed. Giving up.");
      }
    };

    // toggleGenreDropdown không còn cần thiết
    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value;
    };

    const handleLogout = () => {
      authStore.logout();
      showDropdown.value = false;
      alert("Đăng xuất thành công!");
      router.push("/truyen-chu");
    };

    return {
      isLoggedIn,
      userFullName,
      avatarUrl,
      showDropdown,
      toggleDropdown,
      // showGenreDropdown không còn cần thiết
      // toggleGenreDropdown không còn cần thiết
      handleLogout,
      searchQuery,
      showSuggestions,
      handleAvatarError,
    };
  },
};
</script>

<style scoped>
/* Import Google Fonts cho typography */
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");

/* Header */
.header {
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: #1a1d29;
  animation: fadeInScale 0.6s ease-in-out;
}

/* Hiệu ứng fade-in và scale cho header */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Hiệu ứng fade-in từ trái cho header-left */
.header-left {
  animation: fadeInLeft 0.8s ease-in-out;
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Hiệu ứng fade-in từ phải cho header-right */
.header-right {
  animation: fadeInRight 0.8s ease-in-out;
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

/* Bên trái: Logo và Tìm kiếm */
.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-left: 0;
}

/* Logo */
.logo-link {
  text-decoration: none;
}

.logo {
  width: 100px;
  height: auto;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

/* Thanh tìm kiếm */
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  border: 2px solid #4caf50;
  border-radius: 25px;
  padding: 8px 12px;
  width: 220px;
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

.search-bar:hover {
  border-color: #4caf50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
}

.search-icon {
  font-size: 1rem;
  color: #cccccc;
  margin-right: 10px;
}

.search-input {
  background: none;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 0.8rem;
  width: 100%;
}

.search-input::placeholder {
  color: #cccccc;
}

.search-input:focus {
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #222;
  border-radius: 5px;
  padding: 10px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  z-index: 100;
  animation: slideDown 0.3s ease-out;
}

.suggestion-item {
  padding: 8px 20px;
  color: #ffffff;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.suggestion-item:hover {
  background: #444;
  color: #ffd700;
}

/* Bên phải: Menu và Đăng nhập */
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-right: 0;
}

/* Menu điều hướng */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  position: relative;
  color: #ffffff;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #4caf50;
}

/* Hiệu ứng gạch chân khi hover */
.nav-link::after {
  content: "";
  position: absolute;
  width: 0;
  height: 2px;
  background: #4caf50;
  bottom: -4px;
  left: 0;
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}

/* Các style liên quan đến dropdown Thể loại đã bị xóa */
/* .dropdown, .dropdown-toggle, .genre-toggle-icon, .dropdown-menu, .dropdown-item, .dropdown-divider không còn được sử dụng */

/* Dấu phân cách */
.separator {
  color: #cccccc;
  font-size: 1.5rem;
  line-height: 1;
}

/* Nút Đăng nhập */
.login-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  background: #ffffff;
  color: #1a1a1a;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 25px;
  border: 1px solid #ffffff;
  transition: all 0.3s ease;
}

.login-icon {
  font-size: 0.8rem;
}

.login-button:hover {
  background: #e0e0e0;
  border-color: #e0e0e0;
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

/* Avatar và Dropdown người dùng */
.user-menu {
  position: relative;
}

.avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  position: relative;
}

.user-avatar {
  width: 33px;
  height: 33px;
  border-radius: 50%;
  border: 2px solid #4caf50;
  object-fit: cover;
  transition: all 0.3s ease;
}

.avatar-wrapper:hover .user-avatar {
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(76, 175, 80, 0.5);
}

.avatar-wrapper:hover::after {
  content: "";
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(76, 175, 80, 0.3);
  animation: ripple 1s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.dropdown-toggle-icon {
  color: #ffffff;
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.dropdown-toggle-icon.rotate {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: linear-gradient(
    135deg,
    rgba(34, 34, 34, 0.9) 0%,
    rgba(51, 51, 51, 0.9) 100%
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
  z-index: 100;
  min-width: 290px;
  animation: scaleFadeIn 0.3s ease-out;
}

@keyframes scaleFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.user-greeting {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  color: #4caf50;
  font-weight: 600;
  font-size: 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  animation: pulseGlow 2s infinite ease-in-out;
}

.greeting-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #4caf50;
  object-fit: cover;
}

@keyframes pulseGlow {
  0% {
    box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
  }
  50% {
    box-shadow: 0 0 15px rgba(76, 175, 80, 0.5);
  }
  100% {
    box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
  }
}

.user-dropdown .dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  color: #ffffff;
  font-size: 0.8rem;
  border-radius: 5px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.user-dropdown .dropdown-item i {
  color: #4caf50;
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.user-dropdown .dropdown-item:hover i {
  transform: rotate(15deg);
}

.user-dropdown .dropdown-item:hover {
  background: linear-gradient(
    90deg,
    rgba(76, 175, 80, 0.2) 0%,
    rgba(255, 215, 0, 0.2) 100%
  );
  color: #ffffff;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
  transform: translateX(5px);
}

.user-dropdown .dropdown-item:hover span {
  background: linear-gradient(90deg, #4caf50, #ffd700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.user-dropdown .dropdown-item::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.user-dropdown .dropdown-item:hover::after {
  transform: translateX(100%);
}

.user-dropdown .logout {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #d32f2f;
  cursor: pointer;
}

.user-dropdown .logout:hover {
  background: linear-gradient(
    90deg,
    rgba(211, 47, 47, 0.2) 0%,
    rgba(255, 85, 85, 0.2) 100%
  );
  color: #ff5555;
  box-shadow: 0 0 10px rgba(211, 47, 47, 0.3);
  transform: translateX(5px);
}

.user-dropdown .logout:hover span {
  background: linear-gradient(90deg, #d32f2f, #ff5555);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 10px;
  }

  .header-left {
    width: 100%;
    justify-content: space-between;
  }

  .logo {
    width: 100px;
  }

  .search-bar {
    width: 100%;
    max-width: 250px;
    padding: 6px 10px;
  }

  .search-input {
    font-size: 0.8rem;
  }

  .search-icon {
    font-size: 0.9rem;
  }

  .header-right {
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }

  .nav-menu {
    gap: 10px;
  }

  .nav-link,
  .dropdown-toggle {
    font-size: 0.7rem;
  }

  .dropdown-menu {
    left: -50%;
    transform: translateX(50%);
  }

  .dropdown-item {
    font-size: 0.7rem;
  }

  .genre-toggle-icon {
    font-size: 0.7rem;
  }

  .separator {
    font-size: 1.2rem;
  }

  .login-button {
    font-size: 0.7rem;
    padding: 4px 10px;
  }

  .login-icon {
    font-size: 0.7rem;
  }

  .user-avatar {
    width: 28px;
    height: 28px;
  }

  .dropdown-toggle-icon {
    font-size: 0.8rem;
  }

  .user-dropdown {
    right: -10px;
    min-width: 180px;
  }

  .greeting-avatar {
    width: 20px;
    height: 20px;
  }

  .user-greeting {
    font-size: 0.8rem;
  }

  .user-dropdown .dropdown-item {
    font-size: 0.7rem;
    padding: 8px 12px;
  }

  .user-dropdown .dropdown-item i {
    font-size: 0.9rem;
  }
}
</style>
