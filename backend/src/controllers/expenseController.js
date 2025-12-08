import Transaction from "../models/Transaction.js";

// @desc    Lấy tất cả giao dịch
// @route   GET /api/expenses
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1, createdAt: -1 }); // Sắp xếp theo ngày giao dịch

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

// @desc    Thêm 1 giao dịch mới (Dùng cho Chi tiêu hoặc Thu nhập lẻ)
// @route   POST /api/expenses
export const addTransaction = async (req, res) => {
  try {
    // Client gửi lên: text, amount, type, date, jar...
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

// @desc    Thêm nhiều giao dịch cùng lúc (Dùng cho Nạp tiền chia lọ)
// @route   POST /api/expenses/batch
export const addBatchTransactions = async (req, res) => {
  try {
    const transactions = req.body; // Nhận vào một mảng []
    
    if (!Array.isArray(transactions) || transactions.length === 0) {
        return res.status(400).json({ success: false, error: "Dữ liệu không hợp lệ" });
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

    // Cập nhật dữ liệu
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