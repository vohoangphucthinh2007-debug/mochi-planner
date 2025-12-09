import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    // --- User ID ---
    userId: {
      type: String,
      required: true,
      index: true, 
    },
    // ---------------

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

export default mongoose.model("Task", TaskSchema);