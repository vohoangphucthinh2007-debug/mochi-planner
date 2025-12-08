import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, TrendingUp, TrendingDown, Edit3, X, Calendar as CalIcon,
  Droplets, ArrowRight, Wallet, History, AlertCircle, Trash2
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { format, subMonths, isSameMonth, isSameWeek, isSameYear, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';
import { JARS_INFO, ALLOCATION_MODELS } from "@/lib/jarsData"; 
import mochiLogo from "@/assets/mochi-logo.jpg"; 

// --- COMPONENT: HŨ NƯỚC MOCHI (WATER JAR) ---
const MochiJar = ({ jarKey, balance, totalIncome, onClick, isSelected }) => {
    const info = JARS_INFO[jarKey];
    // Tính mực nước tương đối (để hiển thị đẹp)
    const fillPercent = totalIncome > 0 ? Math.min((balance / (totalIncome * 0.4)) * 100, 100) : 0;
    const safeFill = Math.max(fillPercent, 5); 

    return (
        <div 
            onClick={onClick}
            className={`relative flex flex-col items-center cursor-pointer transition-all duration-300 ${isSelected ? 'scale-110 -translate-y-2' : 'hover:scale-105'}`}
        >
            <div className="relative w-24 h-32 bg-white/40 backdrop-blur-sm border-2 border-white/80 rounded-b-3xl rounded-t-lg overflow-hidden shadow-lg group">
                <div className="absolute inset-0 flex items-center justify-center z-10 opacity-80">
                   <img 
                        src={mochiLogo} 
                        alt="mochi" 
                        className="w-16 h-16 object-contain mix-blend-multiply" 
                        style={{ filter: info.mochiColor }}
                   />
                </div>

                <div 
                    className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ease-in-out ${info.bgColor}`}
                    style={{ height: `${balance > 0 ? safeFill : 0}%`, opacity: 0.6 }}
                >
                    <div className="absolute top-0 left-0 w-[200%] h-4 bg-white/30 animate-wave -translate-y-1/2 rounded-[100%]"></div>
                </div>

                <div className="absolute bottom-2 w-full text-center z-20">
                    <span className="text-xs font-bold text-gray-800 bg-white/70 px-2 py-0.5 rounded-full shadow-sm">
                        {balance.toLocaleString('vi-VN')}đ
                    </span>
                </div>
            </div>
            <span className={`mt-2 text-xs font-bold px-2 py-1 rounded-lg ${isSelected ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'}`}>
                {info.label}
            </span>
        </div>
    );
};

// --- COMPONENT CHÍNH ---
const ExpenseTracker = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('month'); 
    const [currentDate, setCurrentDate] = useState(new Date());

    const [formMode, setFormMode] = useState('add'); 
    const [editId, setEditId] = useState(null);
    const [transactionType, setTransactionType] = useState('expense'); 
    
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [text, setText] = useState("");
    const [amount, setAmount] = useState("");
    const [selectedJar, setSelectedJar] = useState('necessity'); 
    const [selectedModel, setSelectedModel] = useState('6jars');
    
    // STATE MỚI: Danh sách phân bổ dự kiến (Preview Allocation)
    const [allocationPreview, setAllocationPreview] = useState([]);

    // --- 1. LẤY DỮ LIỆU ---
    useEffect(() => {
        fetchTransactions();
    }, []);

    // --- 2. LOGIC TỰ ĐỘNG TẠO LIST PHÂN BỔ ---
    useEffect(() => {
        // Chỉ chạy khi đang ở chế độ Thu nhập (Income) và Thêm mới (Add)
        if (transactionType === 'income' && formMode === 'add') {
            const model = ALLOCATION_MODELS.find(m => m.id === selectedModel);
            if (amount && model) {
                // Tạo danh sách dự kiến dựa trên Model và Số tiền
                const preview = Object.keys(model.rules).map(jarKey => {
                    const percent = model.rules[jarKey];
                    const splitAmount = (+amount * percent) / 100;
                    return {
                        jar: jarKey,
                        percent: percent,
                        amount: splitAmount,
                        label: JARS_INFO[jarKey].label,
                        color: JARS_INFO[jarKey].color
                    };
                });
                setAllocationPreview(preview);
            } else {
                setAllocationPreview([]);
            }
        }
    }, [amount, selectedModel, transactionType, formMode]);

    const fetchTransactions = async () => {
        try {
            const res = await api.get("/expenses");
            setTransactions(res.data.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Lỗi tải dữ liệu");
            setLoading(false);
        }
    };

    // --- 3. TÍNH TOÁN THỐNG KÊ ---
    const stats = useMemo(() => {
        const filtered = transactions.filter(t => {
            const tDate = new Date(t.date);
            if (timeFilter === 'week') return isSameWeek(tDate, currentDate, { weekStartsOn: 1 });
            if (timeFilter === 'month') return isSameMonth(tDate, currentDate);
            if (timeFilter === 'year') return isSameYear(tDate, currentDate);
            return true;
        });

        const totalIncome = filtered.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const totalExpense = filtered.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

        const allTimeJars = {}; 
        Object.keys(JARS_INFO).forEach(key => allTimeJars[key] = 0);
        
        transactions.forEach(t => {
            if (t.type === 'income') {
                allTimeJars[t.jar] += t.amount;
            } else {
                allTimeJars[t.jar] -= t.amount;
            }
        });

        const currentMonthTrans = transactions.filter(t => isSameMonth(new Date(t.date), new Date()));
        const lastMonthTrans = transactions.filter(t => isSameMonth(new Date(t.date), subMonths(new Date(), 1)));
        
        const curExpense = currentMonthTrans.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
        const lastExpense = lastMonthTrans.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
        
        let momGrowth = 0;
        if (lastExpense > 0) {
            momGrowth = ((curExpense - lastExpense) / lastExpense) * 100;
        } else if (curExpense > 0) {
            momGrowth = 100;
        }

        return { 
            filtered, totalIncome, totalExpense, jarBalances: allTimeJars, 
            momGrowth, curExpense, lastExpense 
        };
    }, [transactions, timeFilter, currentDate]);

    // --- HÀM XÓA 1 MỤC KHỎI PREVIEW ---
    const removeAllocationItem = (jarKeyToRemove) => {
        setAllocationPreview(prev => prev.filter(item => item.jar !== jarKeyToRemove));
    };

    // --- 4. XỬ LÝ SUBMIT ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text || !amount) return toast.error("Nhập thiếu thông tin!");

        const payloadBase = {
            text, 
            date: new Date(date),
            type: transactionType
        };

        try {
            if (transactionType === 'income') {
                if (formMode === 'edit') {
                     await api.put(`/expenses/${editId}`, { ...payloadBase, amount: +amount });
                     toast.success("Đã cập nhật!");
                } else {
                    // THÊM MỚI: Dùng danh sách allocationPreview hiện tại (đã lọc các mục bị xóa)
                    if (allocationPreview.length === 0) {
                        return toast.error("Cần ít nhất 1 hũ để nạp tiền!");
                    }

                    const batchData = allocationPreview.map(item => ({
                        ...payloadBase,
                        amount: item.amount,
                        jar: item.jar,
                        // Thêm chi tiết vào nội dung để dễ theo dõi sau này
                        text: `${text} (${item.label})` 
                    }));

                    await api.post("/expenses/batch", batchData);
                    toast.success(`Đã nạp tiền vào ${batchData.length} hũ!`);
                }
            } else {
                 const payload = {
                    ...payloadBase,
                    amount: +amount,
                    jar: selectedJar,
                    category: 'others'
                };
                if (formMode === 'edit') {
                    await api.put(`/expenses/${editId}`, payload);
                    toast.success("Đã cập nhật chi tiêu!");
                } else {
                    await api.post("/expenses", payload);
                    toast.success("Đã thêm chi tiêu!");
                }
            }

            fetchTransactions();
            resetForm();

        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra");
        }
    };

    const handleDelete = async (id) => {
        if(confirm("Bạn chắc chắn muốn xóa?")) {
            await api.delete(`/expenses/${id}`);
            fetchTransactions();
            toast.success("Đã xóa");
        }
    }

    const startEdit = (t) => {
        setFormMode('edit');
        setEditId(t._id);
        setTransactionType(t.type);
        setText(t.text);
        setAmount(t.amount);
        setDate(format(new Date(t.date), 'yyyy-MM-dd'));
        if (t.type === 'expense') setSelectedJar(t.jar);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormMode('add');
        setEditId(null);
        setText("");
        setAmount("");
        setDate(format(new Date(), 'yyyy-MM-dd'));
    };

    const formatMoney = (n) => n?.toLocaleString('vi-VN', {style:'currency', currency:'VND'});

    return (
        <div className="space-y-8 pb-20">
            {/* DASHBOARD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                         <h3 className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-1">
                            Chi tiêu tháng này
                         </h3>
                         <div className="flex items-end gap-3">
                             <h1 className="text-4xl font-bold">{formatMoney(stats.curExpense)}</h1>
                             <div className={`flex items-center text-sm px-2 py-1 rounded-lg mb-1 ${stats.momGrowth > 0 ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'}`}>
                                {stats.momGrowth > 0 ? <TrendingUp size={16} className="mr-1"/> : <TrendingDown size={16} className="mr-1"/>}
                                {Math.abs(stats.momGrowth).toFixed(1)}% so với tháng trước
                             </div>
                         </div>
                    </div>
                    <Wallet className="absolute -bottom-6 -right-6 w-32 h-32 text-white opacity-10" />
                </div>
                
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                    <h3 className="text-gray-500 text-sm font-bold mb-3 uppercase">Thời gian xem báo cáo</h3>
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                        {['week', 'month', 'year'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setTimeFilter(filter)}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${timeFilter === filter ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:bg-gray-200'}`}
                            >
                                {filter === 'week' ? 'Tuần' : filter === 'month' ? 'Tháng' : 'Năm'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* HŨ MOCHI */}
            <div>
                <h3 className="text-gray-800 font-bold text-lg mb-4 flex items-center gap-2">
                    <Droplets className="text-blue-500" size={20}/>
                    Hũ Quỹ Mochi
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-2 custom-scrollbar snap-x">
                    {Object.keys(JARS_INFO).map(jarKey => (
                        <MochiJar 
                            key={jarKey}
                            jarKey={jarKey}
                            balance={stats.jarBalances[jarKey]}
                            totalIncome={Object.values(stats.jarBalances).reduce((a,b)=>a+b,0) + 1}
                            isSelected={selectedJar === jarKey && transactionType === 'expense'}
                            onClick={() => {
                                setTransactionType('expense');
                                setSelectedJar(jarKey);
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* FORM NHẬP LIỆU */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-indigo-50 relative overflow-hidden">
                <div className="flex justify-center mb-6">
                    <div className="bg-gray-100 p-1 rounded-xl flex">
                        <button 
                            onClick={() => setTransactionType('expense')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${transactionType === 'expense' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500'}`}
                        >
                            <TrendingDown size={16} /> Chi Tiêu
                        </button>
                        <button 
                            onClick={() => setTransactionType('income')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${transactionType === 'income' ? 'bg-green-500 text-white shadow-md' : 'text-gray-500'}`}
                        >
                            <TrendingUp size={16} /> Thu Nhập
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Ngày</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full p-3 bg-gray-50 rounded-xl font-medium focus:ring-2 ring-indigo-200 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                             <label className="text-xs font-bold text-gray-500 uppercase ml-1">Số tiền</label>
                             <input 
                                type="number" 
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full p-3 bg-gray-50 rounded-xl font-bold text-indigo-600 focus:ring-2 ring-indigo-200 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                         <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nội dung</label>
                         <input 
                            type="text" 
                            placeholder={transactionType === 'income' ? "Lương tháng 12..." : "Ăn sáng, Mua xăng..."}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full p-3 bg-gray-50 rounded-xl font-medium focus:ring-2 ring-indigo-200 outline-none"
                        />
                    </div>

                    {/* LOGIC RIÊNG CHO THU NHẬP (CÓ PREVIEW + XÓA) */}
                    {transactionType === 'income' ? (
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 space-y-4">
                             
                             {/* Chọn Mô Hình */}
                             <div>
                                 <label className="text-xs font-bold text-green-700 uppercase mb-2 block">Chọn mô hình phân bổ:</label>
                                 <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                    {ALLOCATION_MODELS.map(model => (
                                        <button 
                                            key={model.id}
                                            type="button"
                                            onClick={() => setSelectedModel(model.id)}
                                            className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${selectedModel === model.id ? 'bg-white border-green-500 text-green-700 shadow-sm' : 'border-transparent text-gray-500 hover:bg-white/50'}`}
                                        >
                                            {model.name}
                                        </button>
                                    ))}
                                 </div>
                             </div>

                             {/* DANH SÁCH PREVIEW (CÓ NÚT XÓA) */}
                             {amount > 0 && allocationPreview.length > 0 && (
                                <div className="bg-white/60 rounded-xl p-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex justify-between">
                                        <span>Dự kiến phân bổ:</span>
                                        <span className="text-green-600">{formatMoney(allocationPreview.reduce((a,b)=>a+b.amount,0))}</span>
                                    </label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                                        {allocationPreview.map((item) => (
                                            <div key={item.jar} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-8 rounded-full" style={{backgroundColor: item.color}}></div>
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-700">{item.label}</div>
                                                        <div className="text-[10px] text-gray-400">{item.percent}%</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-green-600">+{formatMoney(item.amount)}</span>
                                                    <button 
                                                        type="button"
                                                        onClick={() => removeAllocationItem(item.jar)}
                                                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {allocationPreview.length === 0 && (
                                        <div className="text-center text-xs text-red-500 py-2">Bạn đã xóa hết các hũ!</div>
                                    )}
                                </div>
                             )}
                        </div>
                    ) : (
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                             <label className="text-xs font-bold text-red-700 uppercase mb-2 block">Rút từ hũ:</label>
                             <div className="flex flex-wrap gap-2">
                                {Object.values(JARS_INFO).map(jar => (
                                    <button
                                        key={jar.id}
                                        type="button"
                                        onClick={() => setSelectedJar(jar.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedJar === jar.id ? 'bg-white border-red-400 text-red-600 shadow-sm' : 'border-transparent text-gray-500 hover:bg-white'}`}
                                    >
                                        {jar.label}
                                    </button>
                                ))}
                             </div>
                        </div>
                    )}

                    <button type="submit" className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-2 ${transactionType === 'income' ? 'bg-green-500 shadow-green-200' : 'bg-red-500 shadow-red-200'}`}>
                        {formMode === 'edit' ? <Edit3 size={20}/> : <Plus size={20}/>}
                        {formMode === 'edit' ? 'Cập Nhật Giao Dịch' : (transactionType === 'income' ? 'Nạp Tiền Vào Hũ' : 'Xác Nhận Chi Tiêu')}
                    </button>
                    
                    {formMode === 'edit' && (
                        <button type="button" onClick={resetForm} className="w-full py-2 text-gray-400 text-sm font-medium hover:text-gray-600">
                            Hủy chỉnh sửa
                        </button>
                    )}
                </form>
            </div>

            {/* LỊCH SỬ GIAO DỊCH */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/50">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <History size={20} className="text-indigo-500"/> Lịch sử giao dịch
                </h3>
                <div className="space-y-3">
                    {stats.filtered.length === 0 && <div className="text-center text-gray-400 py-4">Chưa có giao dịch nào trong thời gian này</div>}
                    
                    {stats.filtered.map(t => {
                        const jar = JARS_INFO[t.jar] || JARS_INFO['necessity'];
                        return (
                            <div key={t._id} className="group bg-white p-3 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-center hover:shadow-md transition-all">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${t.type === 'income' ? 'bg-green-500' : jar.bgColor}`}>
                                        {t.type === 'income' ? <TrendingUp size={18}/> : <TrendingDown size={18}/>}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 text-sm">{t.text}</div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span>{format(new Date(t.date), 'dd/MM/yyyy')}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span style={{color: jar.color}}>{jar.label}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
                                        {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                                    </div>
                                    <div className="flex gap-2 justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(t)} className="p-1.5 bg-indigo-50 text-indigo-500 rounded-lg hover:bg-indigo-100">
                                            <Edit3 size={14}/>
                                        </button>
                                        <button onClick={() => handleDelete(t._id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100">
                                            <X size={14}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default ExpenseTracker;