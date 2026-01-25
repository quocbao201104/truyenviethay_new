// frontend/vite.config.ts
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  const target = env.VITE_API_URL || "http://localhost:3000";

  return {
    plugins: [
      vue(),
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          name: "TruyenVietHay",
          short_name: "TVH",
          start_url: "/",
          display: "standalone",
          background_color: "#ffffff",
          theme_color: "#42b983",
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: true, // Cho phép truy cập qua IP
      port: 5173, // Hoặc cổng em muốn
      proxy: {
        // Generic proxy for all /api requests
        "/api": {
          target: target,
          changeOrigin: true,
          secure: false,
          // rewrite: (pathStr) => pathStr, // Default behavior is sufficient
        },
        // Uploaded images proxy
        "/uploads_img": {
          target: target,
          changeOrigin: true,
          secure: false,
        }
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
  };
});