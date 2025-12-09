// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import thêm Auth để đăng nhập

// Cấu hình Firebase của bạn (Giữ nguyên như bạn gửi)
const firebaseConfig = {
  apiKey: "AIzaSyAqVVgPuXJCtt6ig7W4wP2dy2zXtL53trQ",
  authDomain: "mochi-app-4cac8.firebaseapp.com",
  projectId: "mochi-app-4cac8",
  storageBucket: "mochi-app-4cac8.firebasestorage.app",
  messagingSenderId: "215500041600",
  appId: "1:215500041600:web:c7073f55e59213d9032565"
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// Xuất công cụ xác thực (auth) để dùng ở trang Đăng nhập
export const auth = getAuth(app);