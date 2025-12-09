import Transaction from "../models/Transaction.js"; // Nhớ đuôi .js

// @desc    Lấy tất cả giao dịch (Của riêng User)
// @route   GET /api/expenses
export const getTransactions = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "Thiếu thông tin người dùng (userId)",
      });
    }

    // Chỉ lấy giao dịch khớp với userId
    const transactions = await Transaction.find({ userId: userId }).sort({
      date: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Lỗi Server",
    });
  }
};

// @desc    Thêm 1 giao dịch mới
// @route   POST /api/expenses
export const addTransaction = async (req, res) => {
  try {
    const { text, amount, type, date, userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: ["Chưa đăng nhập (Thiếu userId)"],
      });
    }

    const transaction = await Transaction.create(req.body);

    return res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: "Lỗi Server",
      });
    }
  }
};

// @desc    Thêm nhiều giao dịch (Batch)
// @route   POST /api/expenses/batch
export const addBatchTransactions = async (req, res) => {
  try {
    const transactions = req.body; 
    
    if (!Array.isArray(transactions) || transactions.length === 0) {
        return res.status(400).json({ success: false, error: "Dữ liệu không hợp lệ" });
    }

    const isValid = transactions.every(t => t.userId);
    if (!isValid) {
        return res.status(400).json({ success: false, error: "Thiếu userId trong dữ liệu gửi lên" });
    }
    
    const createdTransactions = await Transaction.insertMany(transactions);
    
    return res.status(201).json({
      success: true,
      count: createdTransactions.length,
      data: createdTransactions
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Lỗi Server khi thêm batch' });
  }
};

// @desc    Xóa giao dịch
// @route   DELETE /api/expenses/:id
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy giao dịch này",
      });
    }

    await transaction.deleteOne();

    return res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Lỗi Server",
    });
  }
};

// @desc    Sửa giao dịch
// @route   PUT /api/expenses/:id
export const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy' });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    return res.status(200).json({ success: true, data: updatedTransaction });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Lỗi Server' });
  }
};