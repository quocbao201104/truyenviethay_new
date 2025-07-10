// auth.store.ts
import { defineStore } from "pinia";
import { AxiosError } from "axios";
import * as authApi from "./auth.api";
import type {
  User,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
} from "./auth.api";

interface AuthState {
  token: string | null;
  user: User | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: localStorage.getItem("token") || null,
    user: null,
  }),

  getters: {
    isLoggedIn: (state): boolean => !!state.token,
  },

  actions: {
    async login(loginData: LoginPayload): Promise<LoginResponse> {
      try {
        const response = await authApi.login(loginData);
        this.setToken(response.token);
        this.setUser(response.user);
        return response;
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>;
        throw {
          message:
            err.response?.data?.message || err.message || "Đăng nhập thất bại",
          raw: err,
        };
      }
    },

    async register(data: RegisterPayload): Promise<void> {
      try {
        await authApi.register(data);
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>;
        throw err.response?.data || { message: "Lỗi không xác định" };
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
    },
  },
});
