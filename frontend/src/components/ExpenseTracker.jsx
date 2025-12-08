import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, TrendingUp, TrendingDown, Edit3, X, Calendar as CalIcon,
  Droplets, ArrowRight, Wallet, History, AlertCircle, Trash2, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { format, subMonths, isSameMonth, isSameWeek, isSameYear } from 'date-fns';
import { JARS_INFO, ALLOCATION_MODELS } from "@/lib/jarsData"; 
import mochiLogo from "@/assets/mochi-logo.jpg"; 

// --- COMPONENT: HŨ NƯỚC MOCHI ---
const MochiJar = ({ jarKey, balance, totalIncome, onClick, isSelected }) => {
    const info = JARS_INFO[jarKey] || JARS_INFO['necessity']; // Fallback an toàn
    const fillPercent = totalIncome > 0 ? Math.min((balance / (totalIncome * 0.4)) * 100, 100) : 0;
    const safeFill = Math.max(fillPercent, 5); 

    return (
        <div 
            onClick={onClick}
            className={`relative flex flex-col items-center cursor-pointer transition-all duration-300 flex-shrink-0 ${isSelected ? 'scale-105 -translate-y-2' : 'hover:scale-105'}`}
        >
            <div className="relative w-20 h-28 md:w-24 md:h-32 bg-white/40 backdrop-blur-sm border-2 border-white/80 rounded-b-3xl rounded-t-lg overflow-hidden shadow-lg group">
                <div className="absolute inset-0 flex items-center justify-center z-10 opacity-80">
                   <img 
                        src={mochiLogo} 
                        alt="mochi" 
                        className="w-12 h-12 md:w-16 md:h-16 object-contain mix-blend-multiply" 
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
                    <span className="text-[10px] md:text-xs font-bold text-gray-800 bg-white/70 px-1.5 py-0.5 rounded-full shadow-sm">
                        {balance > 1000000 ? `${(balance/1000000).toFixed(1)}Tr` : balance.toLocaleString('vi-VN')}
                    </span>
                </div>
            </div>
            <span className={`mt-2 text-[10px] md:text-xs font-bold px-2 py-1 rounded-lg ${isSelected ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'}`}>
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
    
    const [allocationPreview, setAllocationPreview] = useState([]);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    // --- 1. INITIAL FETCH ---
    useEffect(() => { fetchTransactions(); }, []);
    
    useEffect(() => {
        if (transactionType === 'income' && formMode === 'add') {
            const model = ALLOCATION_MODELS.find(m => m.id === selectedModel);
            if (amount && model) {
                const preview = Object.keys(model.rules).map(jarKey => {
                    const percent = model.rules[jarKey];
                    const splitAmount = (+amount * percent) / 100;
                    return {
                        jar: jarKey, percent: percent, amount: splitAmount,
                        label: JARS_INFO[jarKey].label, color: JARS_INFO[jarKey].color
                    };
                });
                setAllocationPreview(preview);
            } else { setAllocationPreview([]); }
        }
    }, [amount, selectedModel, transactionType, formMode]);

    const fetchTransactions = async () => {
        try {
            const res = await api.get("/expenses");
            setTransactions(res.data.data || []); // Fallback array rỗng
            setLoading(false);
        } catch (error) { console.error(error); toast.error("Lỗi tải dữ liệu"); setLoading(false); }
    };

    // --- HELPER: AN TOÀN NGÀY THÁNG (CỐT LÕI CHỐNG SẬP) ---
    const isValidDate = (d) => {
        return d instanceof Date && !isNaN(d.getTime());
    };

    const safeParseDate = (dateString) => {
        if (!dateString) return null;
        const d = new Date(dateString);
        return isValidDate(d) ? d : null;
    };

    const stats = useMemo(() => {
        // Lọc và làm sạch dữ liệu trước khi tính toán
        const validTransactions = transactions.filter(t => t && typeof t.amount === 'number');

        const filtered = validTransactions.filter(t => {
            const tDate = safeParseDate(t.date);
            // Nếu ngày lỗi, mặc định hiển thị ở 'year' để user thấy mà sửa, hoặc ẩn luôn
            if (!tDate) return false; 

            if (timeFilter === 'week') return isSameWeek(tDate, currentDate, { weekStartsOn: 1 });
            if (timeFilter === 'month') return isSameMonth(tDate, currentDate);
            if (timeFilter === 'year') return isSameYear(tDate, currentDate);
            return true;
        });

        const totalIncome = filtered.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const totalExpense = filtered.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

        const allTimeJars = {}; 
        Object.keys(JARS_INFO).forEach(key => allTimeJars[key] = 0);
        
        validTransactions.forEach(t => {
            // Chỉ cộng nếu hũ đó có tồn tại trong hệ thống
            if (JARS_INFO[t.jar]) {
                if (t.type === 'income') allTimeJars[t.jar] += t.amount;
                else allTimeJars[t.jar] -= t.amount;
            }
        });

        // Growth calculation (Safe)
        const currentMonthTrans = validTransactions.filter(t => {
            const d = safeParseDate(t.date);
            return d && isSameMonth(d, new Date());
        });
        const lastMonthTrans = validTransactions.filter(t => {
            const d = safeParseDate(t.date);
            return d && isSameMonth(d, subMonths(new Date(), 1));
        });
        
        const curExpense = currentMonthTrans.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
        const lastExpense = lastMonthTrans.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
        
        let momGrowth = 0;
        if (lastExpense > 0) momGrowth = ((curExpense - lastExpense) / lastExpense) * 100;
        else if (curExpense > 0) momGrowth = 100;

        return { filtered, totalIncome, totalExpense, jarBalances: allTimeJars, momGrowth, curExpense, lastExpense };
    }, [transactions, timeFilter, currentDate]);

    const removeAllocationItem = (jarKeyToRemove) => {
        setAllocationPreview(prev => prev.filter(item => item.jar !== jarKeyToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text || !amount) return toast.error("Nhập thiếu thông tin!");

        const payloadBase = { text, date: new Date(date), type: transactionType };

        try {
            if (transactionType === 'income') {
                if (formMode === 'edit') {
                     await api.put(`/expenses/${editId}`, { ...payloadBase, amount: +amount });
                     toast.success("Đã cập nhật!");
                } else {
                    if (allocationPreview.length === 0) return toast.error("Cần ít nhất 1 hũ!");
                    const batchData = allocationPreview.map(item => ({
                        ...payloadBase, amount: item.amount, jar: item.jar, text: `${text} (${item.label})` 
                    }));
                    await api.post("/expenses/batch", batchData);
                    toast.success(`Đã nạp tiền vào ${batchData.length} hũ!`);
                }
            } else {
                 const payload = { ...payloadBase, amount: +amount, jar: selectedJar, category: 'others' };
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
        } catch (error) { console.error(error); toast.error("Có lỗi xảy ra"); }
    };

    const openDeleteModal = (id) => {
        setDeleteTargetId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteTargetId) return;
        try {
            await api.delete(`/expenses/${deleteTargetId}`);
            // Optimistic update an toàn
            const newTransactions = transactions.filter(t => t._id !== deleteTargetId);
            setTransactions(newTransactions); 
            toast.success("Đã xóa thành công");
        } catch (error) {
            console.error("Lỗi xóa:", error);
            toast.error("Không thể xóa");
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteTargetId(null);
        }
    };

    const startEdit = (t) => {
        try {
            setFormMode('edit'); setEditId(t._id); setTransactionType(t.type);
            setText(t.text || ""); setAmount(t.amount || ""); 
            
            const safeDate = safeParseDate(t.date) || new Date(); // Luôn có ngày mặc định
            setDate(format(safeDate, 'yyyy-MM-dd'));

            if (t.type === 'expense') {
                const safeJar = JARS_INFO[t.jar] ? t.jar : 'necessity';
                setSelectedJar(safeJar);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) { console.error(error); }
    };

    const resetForm = () => {
        setFormMode('add'); setEditId(null); setText(""); setAmount(""); setDate(format(new Date(), 'yyyy-MM-dd'));
    };

    const formatMoney = (n) => n?.toLocaleString('vi-VN', {style:'currency', currency:'VND'});

    // --- RENDER ---
    return (
        <div className="space-y-6 pb-24 md:pb-20 relative">
            
            {/* DASHBOARD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-5 md:p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                         <h3 className="text-indigo-200 text-xs md:text-sm font-medium uppercase tracking-wider mb-1">
                            Chi tiêu tháng này
                         </h3>
                         <div className="flex flex-wrap items-end gap-2 md:gap-3">
                             <h1 className="text-3xl md:text-4xl font-bold">{formatMoney(stats.curExpense)}</h1>
                             <div className={`flex items-center text-xs px-2 py-1 rounded-lg mb-1 ${stats.momGrowth > 0 ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'}`}>
                                {stats.momGrowth > 0 ? <TrendingUp size={14} className="mr-1"/> : <TrendingDown size={14} className="mr-1"/>}
                                {Math.abs(stats.momGrowth).toFixed(1)}%
                             </div>
                         </div>
                    </div>
                    <Wallet className="absolute -bottom-6 -right-6 w-24 h-24 md:w-32 md:h-32 text-white opacity-10" />
                </div>
                
                <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                    <h3 className="text-gray-500 text-xs md:text-sm font-bold mb-3 uppercase">Thời gian báo cáo</h3>
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                        {['week', 'month', 'year'].map(filter => (
                            <button key={filter} onClick={() => setTimeFilter(filter)} className={`flex-1 py-2 text-xs md:text-sm font-bold rounded-lg transition-all ${timeFilter === filter ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:bg-gray-200'}`}>
                                {filter === 'week' ? 'Tuần' : filter === 'month' ? 'Tháng' : 'Năm'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* HŨ MOCHI */}
            <div>
                <h3 className="text-gray-800 font-bold text-base md:text-lg mb-3 flex items-center gap-2">
                    <Droplets className="text-blue-500" size={20}/>
                    Hũ Quỹ Mochi
                </h3>
                <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 pt-2 px-1 custom-scrollbar snap-x scroll-smooth">
                    {Object.keys(JARS_INFO).map(jarKey => (
                        <MochiJar 
                            key={jarKey} jarKey={jarKey}
                            balance={stats.jarBalances[jarKey]}
                            totalIncome={Object.values(stats.jarBalances).reduce((a,b)=>a+b,0) + 1}
                            isSelected={selectedJar === jarKey && transactionType === 'expense'}
                            onClick={() => { setTransactionType('expense'); setSelectedJar(jarKey); }}
                        />
                    ))}
                    <div className="w-2 flex-shrink-0"></div>
                </div>
            </div>

            {/* FORM */}
            <div className="bg-white p-4 md:p-6 rounded-3xl shadow-lg border border-indigo-50 relative overflow-hidden">
                <div className="flex justify-center mb-6">
                    <div className="bg-gray-100 p-1 rounded-xl flex w-full md:w-auto">
                        <button onClick={() => setTransactionType('expense')} className={`flex-1 md:flex-none justify-center px-4 md:px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${transactionType === 'expense' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500'}`}><TrendingDown size={16} /> <span className="hidden xs:inline">Chi Tiêu</span><span className="xs:hidden">Chi</span></button>
                        <button onClick={() => setTransactionType('income')} className={`flex-1 md:flex-none justify-center px-4 md:px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${transactionType === 'income' ? 'bg-green-500 text-white shadow-md' : 'text-gray-500'}`}><TrendingUp size={16} /> <span className="hidden xs:inline">Thu Nhập</span><span className="xs:hidden">Thu</span></button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Ngày</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-medium focus:ring-2 ring-indigo-200 outline-none text-gray-700"/>
                        </div>
                        <div>
                             <label className="text-xs font-bold text-gray-500 uppercase ml-1">Số tiền</label>
                             <input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-indigo-600 focus:ring-2 ring-indigo-200 outline-none"/>
                        </div>
                    </div>
                    <div>
                         <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nội dung</label>
                         <input type="text" placeholder={transactionType === 'income' ? "Lương..." : "Ăn sáng..."} value={text} onChange={(e) => setText(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-medium focus:ring-2 ring-indigo-200 outline-none text-gray-700"/>
                    </div>

                    {transactionType === 'income' ? (
                        <div className="bg-green-50 p-3 md:p-4 rounded-xl border border-green-100 space-y-4">
                             <div>
                                 <label className="text-xs font-bold text-green-700 uppercase mb-2 block">Mô hình phân bổ:</label>
                                 <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                    {ALLOCATION_MODELS.map(model => (
                                        <button key={model.id} type="button" onClick={() => setSelectedModel(model.id)} className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold border transition-all whitespace-nowrap ${selectedModel === model.id ? 'bg-white border-green-500 text-green-700 shadow-sm' : 'border-transparent text-gray-500 hover:bg-white/50'}`}>{model.name}</button>
                                    ))}
                                 </div>
                             </div>
                             {amount > 0 && allocationPreview.length > 0 && (
                                <div className="bg-white/60 rounded-xl p-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 flex justify-between">
                                        <span>Dự kiến:</span><span className="text-green-600">{formatMoney(allocationPreview.reduce((a,b)=>a+b.amount,0))}</span>
                                    </label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                                        {allocationPreview.map((item) => (
                                            <div key={item.jar} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                                                <div className="flex items-center gap-2"><div className="w-1.5 h-6 rounded-full" style={{backgroundColor: item.color}}></div><div className="text-xs font-bold text-gray-700">{item.label}</div></div>
                                                <div className="flex items-center gap-2"><span className="text-xs md:text-sm font-bold text-green-600">+{formatMoney(item.amount)}</span><button type="button" onClick={() => removeAllocationItem(item.jar)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             )}
                        </div>
                    ) : (
                        <div className="bg-red-50 p-3 md:p-4 rounded-xl border border-red-100">
                             <label className="text-xs font-bold text-red-700 uppercase mb-2 block">Rút từ hũ:</label>
                             <div className="flex flex-wrap gap-2">
                                {Object.values(JARS_INFO).map(jar => (
                                    <button key={jar.id} type="button" onClick={() => setSelectedJar(jar.id)} className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex-grow md:flex-grow-0 ${selectedJar === jar.id ? 'bg-white border-red-400 text-red-600 shadow-sm' : 'border-transparent text-gray-500 hover:bg-white'}`}>{jar.label}</button>
                                ))}
                             </div>
                        </div>
                    )}
                    <button type="submit" className={`w-full py-3 md:py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-2 ${transactionType === 'income' ? 'bg-green-500 shadow-green-200' : 'bg-red-500 shadow-red-200'}`}>
                        {formMode === 'edit' ? <Edit3 size={18}/> : <Plus size={18}/>}{formMode === 'edit' ? 'Cập Nhật' : (transactionType === 'income' ? 'Nạp Tiền' : 'Xác Nhận')}
                    </button>
                    {formMode === 'edit' && (<button type="button" onClick={resetForm} className="w-full py-2 text-gray-400 text-xs font-medium hover:text-gray-600">Hủy chỉnh sửa</button>)}
                </form>
            </div>

            {/* LIST (CÓ CHECK DATE SAFE) */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 md:p-6 border border-white/50">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-base"><History size={20} className="text-indigo-500"/> Lịch sử giao dịch</h3>
                <div className="space-y-3">
                    {stats.filtered.length === 0 && <div className="text-center text-gray-400 py-4 text-sm">Chưa có giao dịch nào</div>}
                    {stats.filtered.map(t => {
                        const jar = JARS_INFO[t.jar] || JARS_INFO['necessity'];
                        const dateDisplay = safeParseDate(t.date) ? format(new Date(t.date), 'dd/MM') : 'N/A';
                        return (
                            <div key={t._id} className="group bg-white p-3 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-center hover:shadow-md transition-all">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white ${t.type === 'income' ? 'bg-green-500' : jar.bgColor}`}>{t.type === 'income' ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}</div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-gray-800 text-xs md:text-sm truncate pr-2">{t.text}</div>
                                        <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400"><span>{dateDisplay}</span><span className="w-1 h-1 bg-gray-300 rounded-full"></span><span style={{color: jar.color}}>{jar.label}</span></div>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className={`font-bold text-xs md:text-sm ${t.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>{t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}</div>
                                    <div className="flex gap-2 justify-end mt-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(t)} className="p-1 bg-indigo-50 text-indigo-500 rounded-md"><Edit3 size={12}/></button>
                                        <button onClick={() => openDeleteModal(t._id)} className="p-1 bg-red-50 text-red-500 rounded-md"><X size={12}/></button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* MODAL XÓA */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95">
                        <div className="flex flex-col items-center text-center">
                            <div className="p-3 rounded-full mb-4 bg-red-100 text-red-600"><AlertTriangle size={32} /></div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Xóa giao dịch?</h3>
                            <p className="text-sm text-gray-500 mb-6">Bạn có chắc chắn muốn xóa không?</p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2 text-sm font-bold text-gray-700 bg-gray-100 rounded-xl">Không</button>
                                <button onClick={confirmDelete} className="flex-1 px-4 py-2 text-sm font-bold text-white rounded-xl bg-red-500">Có, xóa</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseTracker;