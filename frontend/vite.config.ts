// frontend/vite.config.ts
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
        // rewrite: (pathStr) => pathStr, // Giữ nguyên đường dẫn
      },

      // Proxy cho stories
      "/api/truyen": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr, // Giữ nguyên đường dẫn
      },

      // Proxy cho category
      "/api/theloai": { // Match '/api/theloai' và '/api/theloai/'
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr, // Giữ nguyên đường dẫn
      },
      "/api/chuong": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/upload-truyen": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/upload-files": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/history": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/comments": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/follow": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/like": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      // user level
      "/api/levels": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/levels/history": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/points": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/tasks": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/rewards": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/user-rewards": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
      "/api/ratings": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (pathStr) => pathStr,
      },
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