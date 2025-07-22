import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { showSuccessToast, showErrorToast } from "./lib/toast";
import Loader from "./components/ui/Loader";

export default function ResetPassword() {
  const [username, setUsername] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1: ask username, 2: ask security answer & new password
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Get security question for username
  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/get-security-question", { username });
      setSecurityQuestion(res.data.securityQuestion || "");
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || "User not found or error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("/api/auth/reset-password", {
        username,
        securityAnswer,
        newPassword,
      });
      showSuccessToast("Password reset successful! You can now log in.");
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password.");
      showErrorToast("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-no-repeat bg-cover bg-center flex items-center justify-center overflow-hidden" style={{ backgroundImage: "url('/bg-reset.jpg')" }}>
      <form className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-full max-w-md animate-fade-in relative" onSubmit={step === 1 ? handleUsernameSubmit : handleResetSubmit}>
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20 rounded-xl">
            <Loader />
          </div>
        )}
        <h2 className="text-3xl font-bold mb-6 text-orange-600 text-center anime-font">Reset Password</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {step === 1 && (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              className="mb-6 block w-full border rounded-md p-2"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              disabled={loading}
            />
            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded flex items-center justify-center" disabled={loading}>
              Next
            </button>
            <div className="mt-4 text-sm text-center">
              <span>Remembered your password?{' '}
                <Link to="/login" className="text-blue-600 underline">
                  Back to Login
                </Link>
              </span>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-2">Security Question</label>
            <div className="mb-4 p-2 bg-gray-100 rounded">{securityQuestion || "No question set."}</div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
            <input
              type="text"
              className="mb-4 block w-full border rounded-md p-2"
              value={securityAnswer}
              onChange={e => setSecurityAnswer(e.target.value)}
              placeholder="Enter your answer"
              required
              disabled={loading}
            />
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              className="mb-6 block w-full border rounded-md p-2"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
              disabled={loading}
            />
            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded flex items-center justify-center" disabled={loading}>
              Reset Password
            </button>
            <div className="mt-4 text-sm text-center">
              <span>Remembered your password?{' '}
                <Link to="/login" className="text-blue-600 underline">
                  Back to Login
                </Link>
              </span>
            </div>
          </>
        )}
      </form>
    </div>
  );
} 