const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    // --- PHẦN QUAN TRỌNG MỚI THÊM ---
    userId: {
      type: String,
      required: true, // Bắt buộc phải có ID người dùng
      index: true,    // Giúp tìm kiếm nhanh hơn
    },
    // --------------------------------
    
    title: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "complete"],
      default: "active",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);