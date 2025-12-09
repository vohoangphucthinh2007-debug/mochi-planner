import React, { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

// Nhận props currentUserId từ HomePage truyền vào
const AddTask = ({ handleNewTaskAdded, currentUserId }) => {
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Vui lòng nhập nội dung công việc!");
      return;
    }

    // Nếu chưa đăng nhập (không có ID) thì báo lỗi
    if (!currentUserId) {
        toast.error("Bạn cần đăng nhập lại để thực hiện!");
        return;
    }

    setIsLoading(true);
    try {
      // Gửi request kèm userId trong body
      await api.post("/tasks", {
        title: title,
        userId: currentUserId // <-- QUAN TRỌNG NHẤT
      });

      toast.success("Đã thêm nhiệm vụ mới");
      setTitle("");
      handleNewTaskAdded(); // Gọi hàm refresh ở HomePage
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi thêm nhiệm vụ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative group">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Hôm nay bạn cần làm gì?"
          disabled={isLoading}
          className="w-full p-4 pr-14 rounded-2xl border-none bg-white/80 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-pink-300 focus:outline-none placeholder-gray-400 text-gray-700 transition-all"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white p-2.5 rounded-xl shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </form>
    </div>
  );
};

export default AddTask;