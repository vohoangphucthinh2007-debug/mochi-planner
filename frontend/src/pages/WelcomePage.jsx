import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import welcomeBg from "../assets/welcome-bg.webp";

function WelcomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div 
      className="h-screen w-full bg-cover bg-center relative flex flex-col justify-between items-center py-20"
      style={{ backgroundImage: `url(${welcomeBg})` }}
    >
      {/* Lớp phủ mờ */}
      <div className="absolute inset-0 bg-black/30 z-0"></div>

      {/* --- PHẦN TIÊU ĐỀ & SLOGAN ĐÃ ĐƯỢC PHÓNG TO --- */}
      <div className="z-10 text-center mt-16 md:mt-24 px-4">
        {/* Chữ Mochi siêu to khổng lồ (từ 6xl lên 8xl/9xl) */}
        <h1 className="text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-purple-300 drop-shadow-2xl animate-fade-in-down leading-tight">
          Mochi
        </h1>
        
        {/* Slogan to hơn và rõ ràng hơn (từ lg lên 2xl/3xl) */}
        <div className="inline-block mt-6 md:mt-8 animate-fade-in-down delay-100">
            <p className="text-white text-2xl md:text-3xl font-bold tracking-wider drop-shadow-lg italic bg-pink-600/40 px-8 py-3 rounded-full backdrop-blur-md border border-white/20">
            "Sinh viên nghèo thì STK đi"
            </p>
        </div>
      </div>

      {/* Nút Bắt đầu */}
      <div className="z-10 w-full px-8 mb-16 flex flex-col items-center animate-fade-in-up delay-200">
        <button 
          onClick={() => navigate("/login")}
          className="w-full max-w-md bg-gradient-to-r from-pink-500 to-purple-600 text-white text-2xl font-bold py-5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/40"
        >
          Bắt đầu ngay 🚀
        </button>
      </div>
    </div>
  );
}

export default WelcomePage;