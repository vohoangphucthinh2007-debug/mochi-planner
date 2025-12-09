import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  // --- USER ID (Bắt buộc) ---
  userId: {
    type: String,
    required: [true, "Cần có thông tin người dùng (userId)"],
    trim: true,
    index: true 
  },
  // --------------------------

  text: {
    type: String,
    trim: true,
    required: [true, "Vui lòng nhập nội dung giao dịch"],
  },
  amount: {
    type: Number,
    required: [true, "Vui lòng nhập số tiền"],
  },
  type: {
    type: String, 
    required: [true, "Cần xác định là thu hay chi"], 
    enum: ["income", "expense"],
    default: "expense"
  },
  date: {
    type: Date,
    default: Date.now,
  },
  jar: {
    type: String,
    default: "necessity", 
  },
  category: {
    type: String, 
    default: "others",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Transaction", TransactionSchema);