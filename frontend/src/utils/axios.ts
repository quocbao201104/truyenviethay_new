// frontend/src/utils/axios.ts
import axios, { AxiosInstance } from "axios";

const instance: AxiosInstance = axios.create({
  // Thay đổi baseURL chỉ đến gốc của backend (ví dụ: http://localhost:3000)
  // và các lời gọi API sẽ bao gồm /api/
  baseURL: import.meta.env.VITE_API_BASE_URL_ROOT || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
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