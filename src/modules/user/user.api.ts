// frontend/src/modules/user/user.api.ts
import axios from "@/utils/axios";
import type {
  User,
  UpdateUserPayload,
  ChangePasswordPayload,
} from "@/types/user";

/**
 * Lấy thông tin chi tiết của người dùng hiện tại.
 * Endpoint: GET /api/user/me
 * @returns Promise<User> Thông tin người dùng.
 */
export async function getMeApi(): Promise<{ user: User }> {
  const response = await axios.get<{ user: User }>("/api/user/me");
  return response.data;
}

/**
 * Cập nhật thông tin của người dùng hiện tại.
 * Endpoint: PUT /api/user/me
 * @param data Dữ liệu cập nhật (full_name, email, phone, gender, avatar).
 * @returns Promise<any> Phản hồi từ server.
 */
export async function updateMeApi(data: UpdateUserPayload): Promise<any> {
  const formData = new FormData();

  if (data.full_name !== undefined)
    formData.append("full_name", data.full_name);
  if (data.email !== undefined) formData.append("email", data.email);
  if (data.phone !== undefined) formData.append("phone", data.phone);
  if (data.gender !== undefined) formData.append("gender", data.gender);

  if (data.avatar instanceof File) {
    formData.append("avatar", data.avatar);
  } else if (data.avatar === null) {
    formData.append("avatar", "null"); // Chuỗi 'null' để reset
  }

  // 👇 Thêm dòng này để override method
  formData.append("_method", "PUT");

  const response = await axios.post("/api/user/me", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

/**
 * Thay đổi mật khẩu của người dùng hiện tại.
 * Endpoint: PUT /api/user/change-password
 * @param data old_password và new_password.
 * @returns Promise<any> Phản hồi từ server.
 */
export async function changePasswordApi(
  data: ChangePasswordPayload
): Promise<any> {
  const response = await axios.put("/api/user/change-password", data);
  return response.data;
}
