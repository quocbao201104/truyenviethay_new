declare module "vue3-toastify" {
  export const ToastContainer: any;
  export const toast: {
    success: (msg: string, options?: any) => void;
    error: (msg: string, options?: any) => void;
    info: (msg: string, options?: any) => void;
    warning: (msg: string, options?: any) => void;
  };
  export const POSITION: Record<string, string>;
  export function useToast(): typeof toast;
}
