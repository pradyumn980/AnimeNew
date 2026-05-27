import { Navigate } from "react-router-dom";
import Loader from "./components/ui/Loader";
import { useAuth } from "./lib/AuthContext";

export default function ProtectedRoute({
	children,
}: { children: JSX.Element }) {
	const { isAuthenticated, loading } = useAuth();

	if (loading)
		return (
			<div className="flex justify-center items-center mt-10">
				<Loader />
			</div>
		);

	return isAuthenticated ? children : <Navigate to="/login" replace />;
}
