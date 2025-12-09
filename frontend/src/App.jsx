import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import AuthPage from "./pages/AuthPage"; // Import trang mới
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";

const PrivateRoute = ({ children }) => {
  const isUserLoggedIn = localStorage.getItem("isLoggedIn");
  return isUserLoggedIn ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        
        {/* Cả 2 đường dẫn đều trỏ về AuthPage */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;