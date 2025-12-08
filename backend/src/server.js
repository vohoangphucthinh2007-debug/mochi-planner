import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { connectDB } from "./config/db.js";

// Import các Router
import taskRoute from "./routes/tasksRouters.js";
import expenseRoute from "./routes/expensesRouters.js"; // <--- MỚI THÊM

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const app = express();

app.use(express.json());

// Cấu hình CORS
if (process.env.NODE_ENV !== "production") {
  app.use(cors({ origin: "http://localhost:5173" }));
}

// --- KHAI BÁO ROUTES ---
app.use("/api/tasks", taskRoute);
app.use("/api/expenses", expenseRoute); // <--- MỚI THÊM

// Cấu hình cho Production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// Kết nối DB và chạy Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server bắt đầu trên cổng ${PORT}`);
  });
});