import { Navigate } from "react-router-dom";
import { useAuth } from "./lib/AuthContext";
import Loader from "./components/ui/Loader";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="flex justify-center items-center mt-10"><Loader /></div>;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
