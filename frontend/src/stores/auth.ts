import { defineStore } from "pinia";
import axios from "@/utils/axios"; // file cấu hình riêng
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(localStorage.getItem("token") || "");
  const router = useRouter();

  // Cập nhật token header mỗi lần thay đổi
  if (token.value) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
  }

  // Đăng nhập
  const login = async (credentials: { username: string; password: string }) => {
    try {
      const res = await axios.post("/auth/dang-nhap", credentials);
      token.value = res.data.token;
      localStorage.setItem("token", token.value);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;

      user.value = res.data.user;
      return true;
    } catch (err: any) {
      throw err.response?.data?.message || "Đăng nhập thất bại";
    }
  };

  // Đăng ký
  const register = async (data: {
    username: string;
    password: string;
    email: string;
    full_name: string;
    phone: string;
  }) => {
    try {
      await axios.post("/auth/dang-ky", data);
      return true;
    } catch (err: any) {
      throw err.response?.data?.message || "Đăng ký thất bại";
    }
  };

  // Lấy thông tin người dùng hiện tại
  const fetchMe = async () => {
    try {
      const res = await axios.get("/auth/me");
      user.value = res.data.user;
    } catch (err: any) {
      logout(); // Token hết hạn thì logout
    }
  };

  // Đăng xuất
  const logout = () => {
    token.value = "";
    user.value = null;
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    router.push("/dang-nhap");
  };

  return {
    user,
    token,
    login,
    register,
    fetchMe,
    logout,
    isLoggedIn: computed(() => !!user.value),
  };
});
