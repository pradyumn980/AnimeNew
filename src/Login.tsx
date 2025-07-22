import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./lib/AuthContext"; // your custom AuthContext
import { showSuccessToast, showErrorToast } from "./lib/toast";
import Loader from "./components/ui/Loader";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showExtraOptions, setShowExtraOptions] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // Remove showPassword state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(username, password);
    setLoading(false);
    if (!success) {
      setError("Invalid credentials. Try again.");
      setShowExtraOptions(true);
      showErrorToast("Invalid credentials. Try again.");
    } else {
      setError("");
      navigate("/"); // redirect to home on success
      showSuccessToast("Login successful! Welcome back.");
    }
  };

  return (
    <div
      className="w-screen h-screen bg-no-repeat bg-cover bg-center flex items-center justify-center overflow-hidden"
      style={{ backgroundImage: "url('/background.jpg')" }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-full max-w-md animate-fade-in relative"
      >
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20 rounded-xl">
            <Loader />
          </div>
        )}
        <h2 className="text-4xl font-bold mb-6 text-orange-600 text-center anime-font">
          Login to AnimeFinder
        </h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            className="mt-1 block w-full border rounded-md p-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="mt-1 block w-full border rounded-md p-2 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-600 focus:outline-none"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                // Eye SVG (visible)
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M1.458 12C2.732 7.943 6.523 5 12 5c5.477 0 9.268 2.943 10.542 7-.7 2.157-2.243 4.018-4.542 5.292M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                // Eye with slash SVG (hidden)
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.477 0-9.268-2.943-10.542-7a10.056 10.056 0 012.908-4.568M6.634 6.634A9.956 9.956 0 0112 5c5.477 0 9.268 2.943 10.542 7a9.956 9.956 0 01-4.043 5.013M15 12a3 3 0 11-6 0 3 3 0 016 0zm-6 0a6 6 0 016 0m-9 9l18-18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded flex items-center justify-center"
          disabled={loading}
        >
          Login
        </button>

        <div className="mt-4 text-sm text-center">
          <span>Don’t have an account?{' '}
            <a href="/signup" className="text-blue-600 underline">
              Sign up
            </a>
          </span>
        </div>

        {showExtraOptions && (
          <div className="mt-4 text-sm text-center">
            <p>
              Forgot password?{" "}
              <a href="/reset" className="text-blue-600 underline">
                Reset here
              </a>
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
