import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Proxy cho auth
      "/api/auth": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (pathStr) => pathStr.replace(/^\/api\/auth/, "/api/auth"),
      },

      // Proxy cho stories (thêm phần này)
      "/api/truyen": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (pathStr) => pathStr.replace(/^\/api\/truyen/, "/api/truyen"),
      },

      // Nếu muốn catch all /api/* thì dùng:
      // "/api": {
      //   target: "http://localhost:3000",
      //   changeOrigin: true,
      // }
    },
  },
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
