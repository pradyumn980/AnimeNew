import { useState } from "react";
import { useAuth } from "./lib/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { showSuccessToast, showErrorToast } from "./lib/toast";
import Loader from "./components/ui/Loader";

const avatars = [

  "/avatars/avatar1.jpg", 
  "/avatars/avatar2.jpg",
  "/avatars/avatar3.jpg",
  "/avatars/avatar4.jpg",
  "/avatars/avatar5.jpg",
  "/avatars/avatar6.jpeg", 
  "/avatars/avatar7.jpeg",
  "/avatars/avatar8.jpeg",
  "/avatars/avatar9.jpeg",
  "/avatars/avatar10.jpeg",
];

export default function Signup() {
  const { register, setAvatar } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    securityQuestion: "",
    securityAnswer: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Controls UI between signup form and avatar picker
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  // Remove selectedAvatar and custom avatar logic
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [registeredUser, setRegisteredUser] = useState<string | null>(null);

  // Add a setUser state updater for context
  const [_, setForceUser] = useState<any>(null); // force update

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Normalize username and email
    const normalizedUsername = formData.username.trim().toLowerCase();
    const normalizedEmail = formData.email.trim().toLowerCase();

    try {
      const success = await register(normalizedUsername, formData.password, {
        email: normalizedEmail,
        securityQuestion: formData.securityQuestion,
        securityAnswer: formData.securityAnswer,
      });
      setLoading(false);
      if (success) {
        setRegisteredUser(normalizedUsername);
        setSuccessMessage("Account created! Please choose your avatar.");
        setError("");
        setShowAvatarPicker(true);
        showSuccessToast("Account created! Please choose your avatar.");
      } else {
        setError("Username or email already exists.");
        setSuccessMessage("");
        showErrorToast("Username or email already exists.");
      }
    } catch (err: any) {
      setLoading(false);
      // Try to show more specific error if available
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
        showErrorToast(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
        showErrorToast("Something went wrong. Please try again.");
      }
      setSuccessMessage("");
    }
  };

  // Restore handleAvatarSignup for button
  const handleAvatarSignup = async () => {
    if (!registeredUser || !selectedAvatar) return;
    try {
      await axios.post(
        "http://localhost:8000/api/set-avatar",
        {
          avatar: selectedAvatar,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setAvatar(selectedAvatar);
      // Fetch latest user data and update context
      try {
        const res = await axios.get("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.data.user) {
          localStorage.setItem("currentUser", JSON.stringify(res.data.user));
          setForceUser(res.data.user); // force rerender if needed
        }
      } catch (err) {
        // ignore fetch error, fallback to setAvatar
      }
      showSuccessToast("Avatar set! Welcome to AnimeFinder.");
      navigate("/");
    } catch (err) {
      setError("Failed to save avatar. Please try again.");
      console.error("Failed to save avatar:", err);
      showErrorToast("Failed to save avatar. Please try again.");
    }
  };

  // Remove showPassword state
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className="w-screen h-screen bg-no-repeat bg-cover bg-center flex items-center justify-center overflow-hidden"
      style={{ backgroundImage: "url('/bgSignup.jpg')" }}
    >
      {showAvatarPicker ? (
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-full max-w-lg animate-fade-in relative flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-6 text-orange-600 text-center anime-font">Choose Your Avatar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            {avatars.map((avatar, idx) => (
              <img
                key={avatar}
                src={avatar}
                alt={`Avatar ${idx + 1}`}
                className={`w-20 h-20 rounded-full border-4 cursor-pointer transition-all duration-200 ${selectedAvatar === avatar ? 'border-orange-500 scale-110' : 'border-transparent hover:border-orange-400 hover:scale-105'}`}
                onClick={() => setSelectedAvatar(avatar)}
              />
            ))}
          </div>
          <button
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded flex items-center justify-center disabled:opacity-50"
            onClick={handleAvatarSignup}
            disabled={!selectedAvatar}
          >
            Set Avatar
          </button>
          {error && <p className="text-red-600 mt-4">{error}</p>}
        </div>
      ) : (
        <form className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-full max-w-lg animate-fade-in relative" onSubmit={handleSubmit}>
          {loading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20 rounded-xl">
              <Loader />
            </div>
          )}
          <h2 className="text-2xl font-bold mb-6 text-orange-600 text-center anime-font">
            Signup for AnimeFinder
          </h2>
          {error && <p className="text-red-600 mb-3">{error}</p>}
          {successMessage && (
            <p className="text-green-600 mb-3">{successMessage}</p>
          )}
          {/* Username */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md h-10 py-2 px-3 text-base"
              required
            />
          </div>
          {/* Password */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-md h-10 py-2 px-3 text-base${showPassword ? '' : ' pr-10'}`}
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
          {/* Email */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md h-10 py-2 px-3 text-base"
              required
            />
          </div>
          {/* Security Question */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700">Security Question</label>
            <select
              name="securityQuestion"
              required
              className="mt-1 block w-full border rounded-md h-10 py-2 px-3 text-base"
              value={formData.securityQuestion}
              onChange={handleChange}
            >
              <option value="">Select a question</option>
              <option value="pet">What was your first pet's name?</option>
              <option value="school">What school did you attend as a child?</option>
              <option value="city">In what city were you born?</option>
            </select>
          </div>
          {/* Security Answer */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-700">Answer</label>
            <input
              type="text"
              name="securityAnswer"
              required
              className="mt-1 block w-full border rounded-md h-10 py-2 px-3 text-base"
              value={formData.securityAnswer}
              onChange={handleChange}
            />
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded flex items-center justify-center"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
          <div className="mt-4 text-sm text-center">
            <span>Already have an account?{' '}
              <Link to="/login" className="text-blue-600 underline">
                Login
              </Link>
            </span>
          </div>
        </form>
      )}
    </div>
  );
}
