// frontend/src/types/user.d.ts

/**
 * Định nghĩa cấu trúc dữ liệu đầy đủ của một User
 * nhận được từ API backend (ví dụ từ /api/user/me).
 */
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  avatar: string; // Đường dẫn avatar, có thể là /uploads_img/avatar/default-avatar.jpg
  role: 'user' | 'author' | 'admin'; // Role của người dùng
  gender: 'male' | 'female' | 'other'; // Giới tính
  created_at: string; // Ngày tham gia (chuỗi ISO 8601)
  // Các trường khác như status, ban_until nếu cần hiển thị
  // Bạn có thể thêm các trường liên quan đến level, point nếu chúng được tích hợp trực tiếp vào object user
  // Ví dụ: current_level_name?: string; current_points?: number;
}

/**
 * Payload khi cập nhật thông tin người dùng.
 * Tất cả các trường là optional vì người dùng có thể chỉ cập nhật một phần.
 */
export interface UpdateUserPayload {
  full_name?: string;
  email?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  avatar?: File | string | null; // Có thể là File khi upload, hoặc string là đường dẫn, hoặc null để xóa
}

/**
 * Payload khi thay đổi mật khẩu.
 */
export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}