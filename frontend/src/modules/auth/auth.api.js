// src/modules/auth/auth.api.js
import axios from "@/utils/axios"; // Giả định bạn đã có file này để cấu hình base URL

export async function login(data) {
  // Đảm bảo username được truyền lên đúng với key backend cần (username)
  const res = await axios.post("/auth/dang-nhap", {
    username: data.username,
    password: data.password,
  });
  return res.data;
}

export const register = (data) => {
  // Tương tự, endpoint nên là /auth/dang-ky
  return axios.post("/auth/dang-ky", data);
};