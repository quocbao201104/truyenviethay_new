interface ImportMetaEnv {
  readonly VITE_API_API_URL: string;
  readonly VITE_API_URL: string;
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
