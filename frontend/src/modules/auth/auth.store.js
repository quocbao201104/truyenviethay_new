// src/modules/auth/auth.store.js
import { defineStore } from "pinia";
import * as authApi from "./auth.api"; 

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || null, 
    user: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token, 
  },

  actions: {
    // === HÀM LOGIN ĐƯỢC THÊM VÀO ===
    async login(loginData) {
      try {
        const response = await authApi.login(loginData); 
        this.setToken(response.token); 
        this.setUser(response.user);   
        return response;
      } catch (error) {
        // Ném lỗi ra để component có thể bắt và hiển thị
        throw error.response?.data || { message: "Lỗi không xác định" };
      }
    },

    async register(data) {
      try {
        await authApi.register(data);
      } catch (error) {
        throw error.response?.data || { message: "Lỗi không xác định" };
      }
    },

    setToken(token) {
      this.token = token;
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
    },

    setUser(user) {
      this.user = user;
    },

    logout() {
      this.setToken(null);
      this.setUser(null);
    },
  },
});