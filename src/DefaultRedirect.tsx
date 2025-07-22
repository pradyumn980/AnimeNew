// DefaultRedirect.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./lib/AuthContext";

export default function DefaultRedirect() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />;
}
