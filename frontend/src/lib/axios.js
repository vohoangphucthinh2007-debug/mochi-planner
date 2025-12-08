import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api" // Khi chạy ở máy tính thì dùng cái này
    : "https://mochi-planner.onrender.com/api"; // <--- DÁN LINK CỦA BẠN VÀO ĐÂY (Nhớ thêm /api)

const api = axios.create({
  baseURL: BASE_URL,
});

export default api;