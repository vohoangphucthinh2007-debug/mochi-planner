const Task = require("../models/Task");

// --- LẤY DANH SÁCH TASKS ---
exports.getTasks = async (req, res) => {
  try {
    // Lấy userId và bộ lọc ngày từ Frontend gửi lên
    const { userId, filter } = req.query;

    // QUAN TRỌNG: Nếu không có userId thì báo lỗi ngay (để bảo mật)
    if (!userId) {
      return res.status(400).json({ message: "Thiếu thông tin người dùng (userId)" });
    }

    // Tạo điều kiện tìm kiếm cơ bản: Phải đúng userId đó
    let query = { userId: userId };

    // Logic lọc theo ngày (Hôm nay)
    if (filter === "today") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // Thêm điều kiện ngày vào query
      query.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    // Tìm kiếm trong Database
    const tasks = await Task.find(query).sort({ createdAt: -1 });

    // Đếm số lượng
    const activeCount = await Task.countDocuments({ ...query, status: "active" });
    const completeCount = await Task.countDocuments({ ...query, status: "complete" });

    res.status(200).json({
      tasks,
      activeCount,
      activeTasks: tasks.filter(t => t.status === 'active'), // Trả về mảng để frontend tiện dùng
      completedTasks: tasks.filter(t => t.status === 'complete'),
      completeCount,
    });

  } catch (error) {
    console.error("Lỗi getTasks:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
};

// --- TẠO TASK MỚI ---
exports.createTask = async (req, res) => {
  try {
    // Lấy dữ liệu từ Frontend gửi lên
    const { title, status, date, priority, userId } = req.body;

    // QUAN TRỌNG: Kiểm tra xem có userId chưa
    if (!userId) {
      return res.status(400).json({ message: "Không thể tạo Task vì thiếu userId" });
    }

    const newTask = new Task({
      userId, // Lưu chủ sở hữu task
      title,
      status: status || "active",
      date: date || new Date(),
      priority: priority || "medium",
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);

  } catch (error) {
    console.error("Lỗi createTask:", error);
    res.status(500).json({ message: "Lỗi tạo Task", error: error.message });
  }
};

// --- CẬP NHẬT TRẠNG THÁI (Active/Complete) ---
exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Không tìm thấy Task" });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- XÓA TASK ---
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await Task.findByIdAndDelete(id);
    res.status(200).json({ message: "Đã xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};