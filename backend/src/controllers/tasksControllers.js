import Task from "../models/Task.js"; // Nhớ phải có đuôi .js khi dùng import

// --- LẤY DANH SÁCH TASKS ---
export const getTasks = async (req, res) => {
  try {
    const { userId, filter } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "Thiếu thông tin người dùng (userId)" });
    }

    let query = { userId: userId };

    if (filter === "today") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });

    const activeCount = await Task.countDocuments({ ...query, status: "active" });
    const completeCount = await Task.countDocuments({ ...query, status: "complete" });

    res.status(200).json({
      tasks,
      activeCount,
      activeTasks: tasks.filter(t => t.status === 'active'),
      completedTasks: tasks.filter(t => t.status === 'complete'),
      completeCount,
    });

  } catch (error) {
    console.error("Lỗi getTasks:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
};

// --- TẠO TASK MỚI ---
export const createTask = async (req, res) => {
  try {
    const { title, status, date, priority, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Không thể tạo Task vì thiếu userId" });
    }

    const newTask = await Task.create({
      userId,
      title,
      status: status || "active",
      date: date || new Date(),
      priority: priority || "medium",
    });

    res.status(201).json(newTask);

  } catch (error) {
    console.error("Lỗi createTask:", error);
    res.status(500).json({ message: "Lỗi tạo Task", error: error.message });
  }
};

// --- CẬP NHẬT TRẠNG THÁI ---
export const updateTaskStatus = async (req, res) => {
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
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await Task.findByIdAndDelete(id);
    res.status(200).json({ message: "Đã xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};