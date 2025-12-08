import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "Vui lòng nhập nội dung"],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, "Vui lòng nhập số tiền"],
  },
  // --- CÁC TRƯỜNG MỚI ---
  type: {
    type: String,
    enum: ["income", "expense"], // Chỉ nhận 'income' (thu) hoặc 'expense' (chi)
    required: true,
    default: "expense"
  },
  date: {
    type: Date,
    required: true,
    default: Date.now, // Cho phép chọn ngày
  },
  jar: {
    type: String,
    required: true, // Bắt buộc phải thuộc về 1 hũ nào đó
    default: "necessity", 
  },
  category: {
    type: String, // Chỉ dùng cho Expense (Ăn uống, mua sắm...)
    default: "others",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Transaction", TransactionSchema);