interface ImportMetaEnv {
  readonly VITE_API_BASE_URL_ROOT: string;
  // khai báo thêm biến khác nếu có
  readonly VITE_APP_API_URL: string;
  readonly VITE_APP_IMAGE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
