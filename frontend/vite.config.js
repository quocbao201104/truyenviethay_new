import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, '/api/auth'),
      },
    },
  },
  // --- PHẦN ĐƯỢC THÊM VÀO ---
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Loại bỏ console.log
        drop_debugger: true, // Loại bỏ debugger
      },
    },
  },
});