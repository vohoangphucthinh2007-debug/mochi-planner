import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  // --- THÊM PHẦN USER ID (QUAN TRỌNG) ---
  userId: {
    type: String,
    required: [true, "Cần có thông tin người dùng (userId)"],
    trim: true,
    index: true // Giúp tìm kiếm nhanh hơn
  },
  // --------------------------------------

  text: {
    type: String,
    required: [true, "Vui lòng nhập nội dung"],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, "Vui lòng nhập số tiền"],
  },
  
  // --- CÁC TRƯỜNG CŨ CỦA BẠN (GIỮ NGUYÊN) ---
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