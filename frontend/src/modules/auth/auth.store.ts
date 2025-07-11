// frontend/src/modules/auth/auth.store.ts
import { defineStore } from "pinia";
import { AxiosError } from "axios";
import * as authApi from "./auth.api";
import type {
  User,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
} from "./auth.api";
import { useToast } from "vue-toastification"; // Import useToast

interface AuthState {
  token: string | null;
  user: User | null;
  isInitialized: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: localStorage.getItem("token") || null,
    user: null,
    isInitialized: false,
  }),

  getters: {
    isLoggedIn: (state): boolean => !!state.token,
  },

  actions: {
    async login(loginData: LoginPayload): Promise<LoginResponse> {
      const toast = useToast(); // Khởi tạo toast instance
      try {
        const response = await authApi.login(loginData);
        this.setToken(response.token);
        this.setUser(response.user);
        toast.success("Đăng nhập thành công!"); // Hiển thị toast thành công
        return response;
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>;
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Tài khoản hoặc mật khẩu không đúng.";
        toast.error(errorMessage); // Hiển thị toast lỗi
        throw {
          message: errorMessage,
          raw: err,
        };
      }
    },

    async register(data: RegisterPayload): Promise<void> {
      const toast = useToast(); // Khởi tạo toast instance
      try {
        await authApi.register(data);
        toast.success("Đăng ký thành công!"); // Hiển thị toast thành công cho đăng ký
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>;
        const errorMessage =
          err.response?.data?.message || err.message || "Đăng ký thất bại";
        toast.error(errorMessage); // Hiển thị toast lỗi cho đăng ký
        throw err.response?.data || { message: errorMessage };
      }
    },

    setToken(token: string | null) {
      this.token = token;
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
    },

    setUser(user: User | null) {
      this.user = user;
    },

    logout() {
      this.setToken(null);
      this.setUser(null);
      const toast = useToast();
      toast.info("Bạn đã đăng xuất."); // Thông báo khi đăng xuất
    },

    // Khởi tạo store khi reload app
    async initialize(): Promise<void> {
      if (this.token && !this.user) {
        try {
          const user = await authApi.getMe();
          this.setUser(user);
        } catch (error) {
          console.error("Token không hợp lệ hoặc hết hạn", error);
          this.logout(); // Clear token nếu có lỗi
        }
      }
      this.isInitialized = true;
    },
  },
});
