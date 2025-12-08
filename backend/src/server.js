import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { connectDB } from "./config/db.js";

// Import các Router
import taskRoute from "./routes/tasksRouters.js";
import expenseRoute from "./routes/expensesRouters.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const app = express();

// --- SỬA LẠI PHẦN CORS (QUAN TRỌNG) ---
// Cho phép cả Localhost và Vercel kết nối
app.use(cors({
    origin: [
        "http://localhost:5173",                  // Cho phép máy tính của bạn (khi chạy dev)
        "https://mochi-planner.vercel.app"        // Cho phép App trên Vercel
    ],
    credentials: true
}));

app.use(express.json());

// --- KHAI BÁO ROUTES ---
app.use("/api/tasks", taskRoute);
app.use("/api/expenses", expenseRoute);

// Cấu hình cho Production (Giữ nguyên logic này để phục vụ file tĩnh nếu cần)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
} else {
  // Route mặc định khi chạy dev
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

// Kết nối DB và chạy Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server bắt đầu trên cổng ${PORT}`);
  });
});