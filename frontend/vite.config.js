import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa"; // 1. Import plugin PWA

// Tạo lại biến __dirname thủ công
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // 2. Cấu hình PWA
    VitePWA({
      registerType: 'autoUpdate', // Tự động cập nhật khi có bản mới
      devOptions: {
        enabled: true // QUAN TRỌNG: Cho phép test PWA ngay khi chạy npm run dev
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Mochi Planner',
        short_name: 'Mochi',
        description: 'Quản lý nhiệm vụ và chi tiêu cùng Mochi',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', // Ẩn thanh địa chỉ trình duyệt, trông như App thật
        orientation: 'portrait', // Khóa chiều dọc trên điện thoại (tùy chọn)
        icons: [
          {
            src: '/mochi-logo.jpg', // Đường dẫn ảnh (Lưu ý xem hướng dẫn bên dưới)
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: '/mochi-logo.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
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
    port: 5173,
    host: true, // Cho phép truy cập qua mạng LAN
    cors: true,
    // Cho phép tên miền mochi.local
    allowedHosts: ['mochi.local'] 
  }
});