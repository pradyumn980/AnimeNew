import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import Anime from "./Anime";
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
import Pricing from "./Pricing";
import Shop from "./Shop";
import Donate from "./Donate";
import PremiumBadge from "./components/PremiumBadge";
import Recommendations from "./Recommendations";

export function App() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const hideHeader =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/reset";
  const avatar = user?.avatar;
  const hideBackButton = ["/", "/login", "/signup", "/reset"].includes(location.pathname);

  const navLinks = [
    { to: "/", label: "🏠 Home" },
    { to: "/search", label: "🔍 Search" },
    { to: "/community", label: "👥 Community" },
    { to: "/shop", label: "👕 Shop" },
    { to: "/donate", label: "❤️ Donate" },
    { to: "/recommendations", label: "🤖 For You" },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-gradient-to-b from-black via-[#0f172a] to-[#1f2937]">
      {/* Header */}
      {!hideHeader && (
        <header className="backdrop-blur-md bg-black/60 border-b border-red-700/30 shadow-2xl sticky top-0 z-50">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left: back + logo */}
            <div className="flex items-center gap-2">
              {!hideBackButton && (
                <button
                  onClick={() => navigate(-1)}
                  className="text-white/90 hover:text-white transition duration-200 p-2 rounded-lg hover:bg-red-700/20 border border-transparent hover:border-red-700/50"
                  title="Go Back"
                >
                  <span className="text-2xl leading-none">←</span>
                </button>
              )}
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-500 to-emerald-400 bg-clip-text text-transparent drop-shadow-lg">
                AnimeFinder
              </h1>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`text-white/90 hover:text-white font-medium transition-all duration-200 hover:scale-105 px-4 py-2 rounded-lg hover:bg-red-700/20 backdrop-blur-sm border border-transparent hover:border-red-700/50 ${
                    location.pathname === to ? "bg-red-700/30 text-white border-red-700/50" : ""
                  }`}
                >
                  {label}
                </Link>
              ))}

              <Link
                to="/pricing"
                className={`flex items-center gap-1.5 text-white/90 hover:text-white font-medium transition-all duration-200 hover:scale-105 px-4 py-2 rounded-lg hover:bg-yellow-500/10 backdrop-blur-sm border border-transparent hover:border-yellow-500/40 ${
                  location.pathname === "/pricing" ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40" : ""
                }`}
              >
                ⭐ Premium
              </Link>

              {isAuthenticated && (
                <div className="relative group ml-2 flex flex-col items-center">
                  <img
                    src={avatar || "/avatars/default-avatar.png"}
                    alt="User Avatar"
                    title="View Profile"
                    className="w-9 h-9 rounded-full border-2 border-red-500/60 cursor-pointer hover:scale-110 transition-all duration-200 hover:border-red-500 shadow-lg"
                    onClick={() => navigate("/profile")}
                  />
                  <div className="absolute -top-2 -right-2">
                    <PremiumBadge size="sm" />
                  </div>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-red-700/30 whitespace-nowrap">
                    Profile
                  </div>
                </div>
              )}
            </nav>

            {/* Mobile right: avatar + hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              {isAuthenticated && (
                <img
                  src={avatar || "/avatars/default-avatar.png"}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full border-2 border-red-500/60 cursor-pointer"
                  onClick={() => navigate("/profile")}
                />
              )}
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="p-2 text-white rounded-lg hover:bg-red-700/20 border border-transparent hover:border-red-700/50 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {mobileMenuOpen && (
            <nav className="md:hidden px-4 pb-4 flex flex-col gap-1 border-t border-red-700/20">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`text-white/90 hover:text-white font-medium transition-colors px-4 py-3 rounded-lg hover:bg-red-700/20 border border-transparent hover:border-red-700/50 ${
                    location.pathname === to ? "bg-red-700/30 text-white border-red-700/50" : ""
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}
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
          <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
          <Route path="/shop" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
          <Route path="/donate" element={<ProtectedRoute><Donate /></ProtectedRoute>} />
          <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
        </Routes>
      </main>
      {!hideHeader && <Footer />}
    </div>
  );
}