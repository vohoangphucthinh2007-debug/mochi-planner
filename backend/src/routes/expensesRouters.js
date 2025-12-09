import express from "express";
import { 
    getTransactions, 
    addTransaction, 
    addBatchTransactions,
    deleteTransaction,
    updateTransaction
} from "../controllers/expenseController.js"; // Đảm bảo đúng tên file controller

const router = express.Router();

router.route("/")
    .get(getTransactions)
    .post(addTransaction);

router.route("/batch")
    .post(addBatchTransactions);

router.route("/:id")
    .delete(deleteTransaction)
    .put(updateTransaction); // Hoặc patch

export default router;