import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  username: string;
  email: string;
  avatar?: string;
  token?: string;
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

// Get API URL from environment (default to localhost for dev)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000";

// Set base URL globally
axios.defaults.baseURL = API_BASE_URL;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const res = await axios.get("/api/auth/me");
        localStorage.setItem("currentUser", JSON.stringify(res.data.user));
        setUser(res.data.user);
      } catch (err) {
        console.error("Failed to fetch user", err);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await axios.post("/api/auth/login", { username, password });

      const { token, ...userData } = res.data.user;
      if (token) {
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser({ ...userData, token });
        return true;
      }

      return false;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("animeSearchParams");
    localStorage.removeItem("animeSearchResults");
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

      const { token, ...userData } = res.data.user;
      if (token) {
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser({ ...userData, token });
        return true;
      }

      return false;
    } catch (err) {
      console.error("Register error:", err);
      return false;
    }
  };

  const setAvatar = (url: string) => {
    if (!user) return;
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
