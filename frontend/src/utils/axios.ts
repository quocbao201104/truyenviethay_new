// frontend/src/utils/axios.ts
import axios, { AxiosInstance } from "axios";
import { API_BASE_URL } from "@/config/constants";

const instance: AxiosInstance = axios.create({
  // và các lời gọi API sẽ bao gồm /api/
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
    withCredentials: true, // 🔥 BẮT BUỘC

});

// Thêm interceptor để tự động thêm token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default instance;