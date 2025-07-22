import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  username: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (
    username: string,
    password: string,
    extraData: { email: string; securityQuestion: string; securityAnswer: string }
  ) => Promise<boolean>;
  setAvatar: (url: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Set axios base URL here if your backend is on localhost:9000
  axios.defaults.baseURL = "http://localhost:8000";

  // On mount, check if token exists and fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
        const res = await axios.get("/api/auth/me");
        localStorage.setItem("currentUser", JSON.stringify(res.data.user));
        setUser(res.data.user);
      } catch (err) {
        console.error("Failed to fetch user", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await axios.post("/api/auth/login", { username, password });
      if (res.data.user.token) {
        localStorage.setItem("token", res.data.user.token);
        setUser(res.data.user);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    // Clear anime search data
    localStorage.removeItem('animeSearchParams');
    localStorage.removeItem('animeSearchResults');
  };

  
  const register = async (
    username: string,
    password: string,
    extraData: { email: string; securityQuestion: string; securityAnswer: string }
  ): Promise<boolean> => {
    try {
      const res = await axios.post("/api/auth/register", {
        username,
        password,
        ...extraData,
      });

       if (res.data.user.token) {
        localStorage.setItem("token", res.data.user.token);
        setUser(res.data.user);
        return true;
      }
      // Backend should send success status true/false
      return res.data.success;
    } catch (err) {
      return false;
    }
  };

  // Set avatar function
  const setAvatar = (url: string) => {
    if (!user) return;
    // Update user avatar in context and localStorage
    const updatedUser = { ...user, avatar: url };
    setUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        register,
        setAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};