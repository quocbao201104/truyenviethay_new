// auth.api.ts
import axios from "@/utils/axios";

// Kiểu dữ liệu gửi khi đăng nhập
export interface LoginPayload {
  username: string;
  password: string;
}

// Kiểu dữ liệu người dùng trả về (tùy theo backend của bạn)
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  avatar?: string | null;
  role: string;
  gender: string;
  created_at: string;
}

// Login trả về: có thể là { token, user }
export interface LoginResponse {
  token: string;
  user: User;
}

// Đăng nhập
export async function login(data: LoginPayload): Promise<LoginResponse> {
  const res = await axios.post<LoginResponse>("/auth/dang-nhap", data);
  return res.data;
}

// Kiểu dữ liệu gửi khi đăng ký
export interface RegisterPayload {
  full_name: string;
  email: string;
  username: string;
  password: string;
  gender: string;
  phone: string;
}

// Đăng ký
export async function register(data: RegisterPayload): Promise<any> {
  const res = await axios.post("/auth/dang-ky", data);
  return res.data;
}

// Lấy thông tin người dùng từ token
export async function getMe(): Promise<User> {
  const res = await axios.get<User>("/auth/me");
  return res.data;
}
