import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import  Anime  from "./Anime";
import { Home } from "./Home";
import Login from "./Login";
import Signup from "./Signup";
import { useAuth } from "./lib/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import { AnimeDetails } from "./AnimeDetails";
import { Profile } from "./Profile";
import { useEffect, useState } from "react";
import Community from "./Community";
import Footer from "./components/Footer";
import ResetPassword from "./ResetPassword";
import { useNavigationType } from "react-router-dom";

export function App() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hideHeader = location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/reset";
  const avatar = user?.avatar;

  // Determine if back button should be shown
  const hideBackButton = ["/", "/login", "/signup", "/reset"].includes(location.pathname);

  return (
    <div className="flex flex-col w-full min-h-screen bg-gradient-to-b from-black via-[#0f172a] to-[#1f2937]">
      {/* Header */}
      {!hideHeader && (
        <header className="backdrop-blur-md bg-black/60 border-b border-red-700/30 shadow-2xl p-4 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-4">
            {/* Back arrow button on all pages except home/login/signup/reset */}
            {!hideBackButton && (
              <button
              onClick={() => navigate(-1)}
              className="text-white/90 hover:text-white transition duration-200 hover:scale-105 px-4 py-2 rounded-lg hover:bg-red-700/20 backdrop-blur-sm border border-transparent hover:border-red-700/50 flex items-center justify-center"
              title="Go Back"
            >
              <span className="text-3xl">←</span>
            </button>
            
              
            )}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-emerald-400 bg-clip-text text-transparent drop-shadow-lg ml-0">
              AnimeFinder
            </h1>
          </div>
          
          <nav className="space-x-6 flex items-center">
            <Link 
              to="/" 
              className={`text-white/90 hover:text-white font-medium transition-all duration-200 hover:scale-105 px-4 py-2 rounded-lg hover:bg-red-700/20 backdrop-blur-sm border border-transparent hover:border-red-700/50 ${
                location.pathname === "/" ? "bg-red-700/30 text-white border-red-700/50" : ""
              }`}
            >
              🏠 Home
            </Link>
            
            <Link 
              to="/search" 
              className={`text-white/90 hover:text-white font-medium transition-all duration-200 hover:scale-105 px-4 py-2 rounded-lg hover:bg-red-700/20 backdrop-blur-sm border border-transparent hover:border-red-700/50 ${
                location.pathname === "/search" ? "bg-red-700/30 text-white border-red-700/50" : ""
              }`}
            >
              🔍 Search
            </Link>
            
            <Link 
              to="/community" 
              className={`text-white/90 hover:text-white font-medium transition-all duration-200 hover:scale-105 px-4 py-2 rounded-lg hover:bg-red-700/20 backdrop-blur-sm border border-transparent hover:border-red-700/50 ${
                location.pathname === "/community" ? "bg-red-700/30 text-white border-red-700/50" : ""
              }`}
            >
              👥 Community
            </Link>

            {isAuthenticated && (
              <div className="relative group">
                <img
                  src={avatar || "/avatars/default-avatar.png"}
                  alt="User Avatar"
                  title="View Profile"
                  className="w-10 h-10 rounded-full border-2 border-red-500/60 ml-4 cursor-pointer hover:scale-110 transition-all duration-200 hover:border-red-500 shadow-lg hover:shadow-red-500/25"
                  onClick={() => navigate("/profile")}
                />
                
                {/* Tooltip */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm border border-red-700/30">
                  Profile
                </div>
              </div>
            )}
          </nav>
        </header>
      )}

      <main className="flex-1 relative">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><Anime /></ProtectedRoute>} />
          <Route path="/anime/:id" element={<ProtectedRoute><AnimeDetails /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/community" element={<Community />} />
          <Route path="/reset" element={<ResetPassword />} />
        </Routes>
      </main>
      {!hideHeader && <Footer />}
    </div>
  );
}