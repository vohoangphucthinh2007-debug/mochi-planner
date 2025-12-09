import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // Import công cụ auth từ file vừa tạo
import loginBg from "../assets/login-bg.png"; 

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); 
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading

  // State lưu dữ liệu nhập
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Để hiện lỗi nếu nhập sai

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLogin) {
        // --- LOGIC ĐĂNG NHẬP THẬT ---
        await signInWithEmailAndPassword(auth, email, password);
        // Đăng nhập thành công -> Lưu cờ vào máy để PrivateRoute cho qua
        localStorage.setItem("isLoggedIn", "true");
        navigate("/dashboard");
      } else {
        // --- LOGIC ĐĂNG KÝ THẬT ---
        await createUserWithEmailAndPassword(auth, email, password);
        // Đăng ký xong tự động đăng nhập luôn
        localStorage.setItem("isLoggedIn", "true");
        navigate("/dashboard");
      }
    } catch (err) {
      // Xử lý lỗi (Ví dụ: Sai mật khẩu, Email đã tồn tại)
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError("Tài khoản hoặc mật khẩu không đúng!");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Email này đã được đăng ký rồi!");
      } else if (err.code === 'auth/weak-password') {
        setError("Mật khẩu phải có ít nhất 6 ký tự!");
      } else {
        setError("Có lỗi xảy ra: " + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fefcff] p-4 font-sans">
      <div className="w-full max-w-5xl h-[650px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
        
        {/* --- FORM --- */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative z-10">
          <div className="flex flex-col items-center mb-6">
            <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 drop-shadow-sm mb-2">
                Mochi
            </h1>
            <div className="inline-block bg-pink-50 border border-pink-100 rounded-full px-4 py-1 mt-2">
                <p className="text-sm text-pink-600 font-semibold italic tracking-wide">
                  "Sinh viên nghèo thì STK đi"
                </p>
            </div>
            <p className="text-gray-400 text-sm mt-4 text-center font-medium">
              {isLogin ? "Chào mừng bạn quay trở lại 👋" : "Bắt đầu hành trình tự do tài chính 🚀"}
            </p>
          </div>

          {/* Hiển thị lỗi nếu có */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm mx-auto">
            
            {/* Tên hiển thị (Chỉ trang trí ở Frontend, Firebase Auth quản lý Email là chính) */}
            {!isLogin && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold text-gray-600 uppercase ml-1">Tên hiển thị</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Ví dụ: Bé Mochi" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300" />
                </div>
              </div>
            )}

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase ml-1">Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="email"
                        placeholder="ban@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase ml-1">Mật khẩu</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3.5 mt-4 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold text-sm shadow-lg shadow-pink-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? "Đang xử lý..." : (isLogin ? "Đăng Nhập" : "Đăng Ký Tài Khoản")}
                {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
              <button onClick={() => { setIsLogin(!isLogin); setError(""); }} className="text-pink-600 font-bold hover:underline transition-colors">
                {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
              </button>
            </p>
          </div>
        </div>

        {/* --- ẢNH NỀN (GIỮ NGUYÊN) --- */}
        <div className="hidden md:block w-1/2 relative overflow-hidden bg-pink-100">
            <img src={loginBg} alt="Cherry Blossom" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-pink-900/60 to-transparent flex flex-col justify-end p-12 text-white">
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 border border-white/30">
                        <Sparkles className="text-pink-200" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Quản lý tài chính <br/><span className="text-pink-200">Phong cách Mochi</span></h2>
                    <p className="text-pink-100 text-sm opacity-90 leading-relaxed">"Tiết kiệm không phải là hà tiện, mà là cách bạn trân trọng công sức lao động của chính mình."</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;