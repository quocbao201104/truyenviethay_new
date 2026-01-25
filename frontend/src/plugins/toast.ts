// frontend/src/plugins/toast.ts
import Toast, { type PluginOptions, POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";

const defaultToastOptions: PluginOptions = {
  position: POSITION.TOP_RIGHT,
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false,
};

export const ToastPlugin = {
  install(app: any, options?: PluginOptions) {
    const mergedOptions = { ...defaultToastOptions, ...options };
    app.use(Toast, mergedOptions);
  },
};

export { defaultToastOptions };
