// frontend/src/modules/user/user.store.ts
import { defineStore } from "pinia";
import { useToast } from "vue-toastification";
import { getMeApi, updateMeApi, changePasswordApi } from "./user.api";
import type { User, UpdateUserPayload, ChangePasswordPayload } from "@/types/user";
import { useAuthStore } from "@/modules/auth/auth.store";

interface UserState {
  profile: User | null;
  isLoadingProfile: boolean;
  profileError: string | null;
  isUpdatingProfile: boolean;
  updateProfileError: string | null;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    profile: null,
    isLoadingProfile: false,
    profileError: null,
    isUpdatingProfile: false,
    updateProfileError: null,
  }),

  getters: {
    getUserProfile: (state) => state.profile,
    isProfileLoading: (state) => state.isLoadingProfile,
    getProfileError: (state) => state.profileError,
  },

  actions: {
    async fetchUserProfile() {
      const authStore = useAuthStore();
      const toast = useToast();
      this.isLoadingProfile = true;
      this.profileError = null;

      if (!authStore.token) {
        this.profileError = "Người dùng chưa đăng nhập.";
        this.isLoadingProfile = false;
        return;
      }

      try {
        const response = await getMeApi();
        if (response.user.avatar) {
            response.user.avatar = response.user.avatar + '?' + Date.now();
        }
        this.profile = response.user;
        authStore.setUser(response.user);
      } catch (error: any) {
        this.profileError = error.message || "Không thể tải thông tin hồ sơ.";
        console.error("Lỗi fetchUserProfile:", error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          authStore.logout();
          toast.info("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        }
      } finally {
        this.isLoadingProfile = false;
      }
    },

    async updateUserProfile(data: UpdateUserPayload) {
      const authStore = useAuthStore();
      const toast = useToast();
      this.isUpdatingProfile = true;
      this.updateProfileError = null;

      try {
        const response = await updateMeApi(data);

        if (response.user) {
            if (response.user.avatar) {
                response.user.avatar = response.user.avatar + '?' + Date.now();
            }
            this.profile = response.user;
            authStore.setUser(response.user);
        } else {
            await this.fetchUserProfile();
        }
        
        toast.success("Cập nhật thông tin thành công!");
      } catch (error: any) {
        this.updateProfileError = error.message || "Cập nhật thông tin thất bại.";
        toast.error("Lỗi cập nhật hồ sơ: " + this.updateProfileError);
        console.error("Lỗi updateUserProfile action:", error);
        throw error;
      } finally {
        this.isUpdatingProfile = false;
      }
    },

    async changeUserPassword(data: ChangePasswordPayload) {
      const toast = useToast();
      try {
        await changePasswordApi(data);
        toast.success("Đổi mật khẩu thành công!");
      } catch (error: any) {
        toast.error("Đổi mật khẩu thất bại: " + (error.response?.data?.message || error.message || "Lỗi không xác định."));
        console.error("Lỗi changeUserPassword action:", error);
        throw error;
      }
    },
  },
});