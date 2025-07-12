// frontend/src/composables/useAppToast.ts
import { useToast } from "vue-toastification"; // Import useToast hook từ thư viện


export function useAppToast() {
  const toast = useToast();

  // Hàm hiển thị thông báo thành công
  const showSuccessToast = (message: string) => {
    toast.success(message);
  };

  // Hàm hiển thị thông báo lỗi
  const showErrorToast = (message: string) => {
    toast.error(message);
  };

  // Hàm hiển thị thông báo thông tin
  const showInfoToast = (message: string) => {
    toast.info(message);
  };

  // Hàm hiển thị thông báo cảnh báo
  const showWarningToast = (message: string) => {
    toast.warning(message);
  };

  return {
    showSuccessToast,
    showErrorToast,
    showInfoToast,
    showWarningToast,
  };
}