import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Menu, X, ListTodo, Wallet } from "lucide-react";

// Import các component
import AddTask from "@/components/AddTask";
import DateTimeFilter from "@/components/DateTimeFilter";
import Footer from "@/components/Footer";
import { Header } from "@/components/Header";
import StatsAndFilters from "@/components/StatsAndFilters";
import TaskList from "@/components/TaskList";
import TaskListPagination from "@/components/TaskListPagination";
import api from "@/lib/axios";
import { visibleTaskLimit } from "@/lib/data";

// Import component Chi Tiêu
import ExpenseTracker from "@/components/ExpenseTracker";

// --- IMPORT LOGO MỚI ---
// Đảm bảo bạn đã lưu ảnh vào đường dẫn này
import mochiLogo from "@/assets/mochi-logo.jpg"; 

const HomePage = () => {
  // --- STATE ---
  const [taskBuffer, setTaskBuffer] = useState([]);
  const [activeTaskCount, setActiveTaskCount] = useState(0);
  const [completeTaskCount, setCompleteTaskCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const [dateQuery, setDateQuery] = useState("today");
  const [page, setPage] = useState(1);
  
  // State cho Menu và Chuyển màn hình
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState("tasks"); 

  // --- EFFECT ---
  useEffect(() => {
    if (currentView === "tasks") {
      fetchTasks();
    }
  }, [dateQuery, currentView]);

  useEffect(() => {
    setPage(1);
  }, [filter, dateQuery]);

  // --- API LOGIC ---
  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks?filter=${dateQuery}`);
      setTaskBuffer(res.data.tasks);
      setActiveTaskCount(res.data.activeCount);
      setCompleteTaskCount(res.data.completeCount);
    } catch (error) {
      console.error("Lỗi xảy ra khi truy xuất tasks:", error);
      toast.error("Lỗi xảy ra khi truy xuất tasks.");
    }
  };

  const handleTaskChanged = () => {
    fetchTasks();
  };

  // --- PAGINATION LOGIC ---
  const filteredTasks = taskBuffer.filter((task) => {
    switch (filter) {
      case "active": return task.status === "active";
      case "completed": return task.status === "complete";
      default: return true;
    }
  });

  const visibleTasks = filteredTasks.slice(
    (page - 1) * visibleTaskLimit,
    page * visibleTaskLimit
  );

  const totalPages = Math.ceil(filteredTasks.length / visibleTaskLimit);

  const handleNext = () => page < totalPages && setPage((prev) => prev + 1);
  const handlePrev = () => page > 1 && setPage((prev) => prev - 1);
  const handlePageChange = (newPage) => setPage(newPage);

  // --- RENDER ---
  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans">
      
      {/* 1. NỀN AURORA DREAM */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 85% 65% at 8% 8%, rgba(175, 109, 255, 0.42), transparent 60%),
            radial-gradient(ellipse 75% 60% at 75% 35%, rgba(255, 235, 170, 0.55), transparent 62%),
            radial-gradient(ellipse 70% 60% at 15% 80%, rgba(255, 100, 180, 0.40), transparent 62%),
            radial-gradient(ellipse 70% 60% at 92% 92%, rgba(120, 190, 255, 0.45), transparent 62%),
            linear-gradient(180deg, #f7eaff 0%, #fde2ea 100%)
          `,
        }}
      />

      {/* 2. LOGO MOCHI CHÌM GIỮA TRANG (MỚI THÊM) */}
      <div className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none overflow-hidden">
        <img 
            src={mochiLogo} 
            alt="Mochi Logo Watermark" 
            className="w-[500px] h-[500px] object-contain opacity-15 mix-blend-multiply grayscale-[0.2]"
            // Giải thích các class:
            // w-[500px]: Kích thước lớn
            // opacity-15: Độ mờ 15% (rất nhạt để không rối mắt)
            // pointer-events-none: Để chuột bấm xuyên qua được (không bị chặn click)
            // mix-blend-multiply: Giúp ảnh hòa trộn vào nền tốt hơn (loại bỏ bớt màu trắng của ảnh)
        />
      </div>

      {/* 3. NÚT MENU */}
      <div className="absolute top-6 left-4 z-50">
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="p-2 bg-white/60 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-all text-gray-700 hover:shadow-md"
        >
          <Menu size={28} />
        </button>
      </div>

      {/* 4. MENU SIDEBAR */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-[60] backdrop-blur-sm transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      
      <div className={`fixed top-0 left-0 h-full w-72 bg-white/90 backdrop-blur-xl shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-800">Menu</h2>
            <button onClick={() => setIsMenuOpen(false)} className="text-gray-500 hover:text-red-500">
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => { setCurrentView("tasks"); setIsMenuOpen(false); }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all font-medium ${currentView === 'tasks' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <ListTodo size={20} />
              Nhiệm Vụ Hằng Ngày
            </button>
            
            <button 
              onClick={() => { setCurrentView("expenses"); setIsMenuOpen(false); }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all font-medium ${currentView === 'expenses' ? 'bg-pink-50 text-pink-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Wallet size={20} />
              Quản Lý Chi Tiêu
            </button>
          </nav>
        </div>
      </div>

      {/* 5. NỘI DUNG CHÍNH (Z-INDEX CAO HƠN LOGO) */}
      <div className="container relative z-10 pt-8 mx-auto">
        <div className="w-full max-w-2xl p-6 mx-auto space-y-6">
          
          <Header />

          {currentView === "tasks" ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <AddTask handleNewTaskAdded={handleTaskChanged} />
              
              <div className="mt-6">
                <StatsAndFilters
                    filter={filter}
                    setFilter={setFilter}
                    activeTasksCount={activeTaskCount}
                    completedTasksCount={completeTaskCount}
                />
              </div>
              
              <div className="mt-6">
                <TaskList
                    filteredTasks={visibleTasks}
                    filter={filter}
                    handleTaskChanged={handleTaskChanged}
                />
              </div>

              <div className="flex flex-col items-center justify-between gap-6 sm:flex-row mt-6">
                <TaskListPagination
                  handleNext={handleNext}
                  handlePrev={handlePrev}
                  handlePageChange={handlePageChange}
                  page={page}
                  totalPages={totalPages}
                />
                <DateTimeFilter
                  dateQuery={dateQuery}
                  setDateQuery={setDateQuery}
                />
              </div>
              <div className="mt-6">
                <Footer
                    activeTasksCount={activeTaskCount}
                    completedTasksCount={completeTaskCount}
                />
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in duration-300">
                <ExpenseTracker />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;