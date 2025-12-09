import express from "express";
import { 
    getTasks, 
    createTask, 
    updateTaskStatus, 
    deleteTask 
} from "../controllers/tasksControllers.js"; // Đảm bảo đường dẫn đúng và có .js

const router = express.Router();

router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:id", updateTaskStatus); // Hoặc put tùy code bạn
router.delete("/:id", deleteTask);

export default router;