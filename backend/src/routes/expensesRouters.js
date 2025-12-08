import express from "express";
import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  addBatchTransactions, // Import hàm mới
  updateTransaction     // Import hàm mới
} from "../controllers/expenseController.js";

const router = express.Router();

router.route("/")
    .get(getTransactions)
    .post(addTransaction);

// Route đặc biệt để thêm nhiều cái
router.route("/batch")
    .post(addBatchTransactions);

router.route("/:id")
    .delete(deleteTransaction)
    .put(updateTransaction); // Method PUT để sửa

export default router;