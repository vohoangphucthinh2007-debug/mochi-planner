import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url"; // Cần thêm cái này để xử lý đường dẫn trong ES Modules
import { connectDB } from "./config/db.js";

// Import các Router
import taskRoute from "./routes/tasksRouters.js";
import expenseRoute from "./routes/expensesRouters.js";

dotenv.config();

// --- CẤU HÌNH ĐƯỜNG DẪN CHO ES MODULES ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ------------------------------------------

const PORT = process.env.PORT || 5001;

const app = express();

// --- CẤU HÌNH CORS ---
app.use(cors({
    origin: [
        "http://localhost:5173",          // Localhost
        "https://mochi-planner.vercel.app", // Vercel (nếu dùng)
        "https://mochi-planner.onrender.com" // Render (chính trang này)
    ],
    credentials: true
}));

app.use(express.json());

// --- KHAI BÁO ROUTES API ---
app.use("/api/tasks", taskRoute);
app.use("/api/expenses", expenseRoute);

// --- CẤU HÌNH STATIC FILES (QUAN TRỌNG NHẤT) ---
// File server.js nằm ở: /backend/src/
// Nên cần lùi 2 cấp (../../) để ra thư mục gốc, rồi mới vào frontend/dist
const frontendPath = path.join(__dirname, "../../frontend/dist");

// Phục vụ file tĩnh từ thư mục dist
app.use(express.static(frontendPath));

// Với mọi request không phải API, trả về file index.html (để React Router hoạt động)
app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// Kết nối DB và chạy Server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server bắt đầu trên cổng ${PORT}`);
        console.log(`Đang phục vụ Frontend tại: ${frontendPath}`); // Log ra để dễ debug
    });
});