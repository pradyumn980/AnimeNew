// src/Profile.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "./lib/AuthContext";
import { Button } from "./components/ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { showSuccessToast, showErrorToast } from "./lib/toast";

// Extend User type locally to include securityQuestion and securityAnswer
type UserWithSecurity = {
  username: string;
  email: string;
  avatar?: string;
  securityQuestion?: string;
  securityAnswer?: string;
};

export function Profile() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const { isAuthenticated, logout, user: baseUser, setAvatar } = useAuth();
  const user = baseUser as UserWithSecurity | null;
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [showSecurityAnswer, setShowSecurityAnswer] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
  });
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState("");
  const [avatarError, setAvatarError] = useState("");

  if (!isAuthenticated || !user) {
    return (
      <div className="bg-[#0f172a] min-h-screen flex items-center justify-center">
        <div className="bg-[#1f2937] rounded-xl p-8 shadow-2xl border border-gray-700">
          <p className="text-white text-xl text-center">⚠️ You are not logged in.</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      username: user?.username || "",
      email: user?.email || "",
      avatar: user?.avatar || "",
    });
    setIsEditing(false);
  };

  const handleAvatarUpdate = async () => {
    if (newAvatarUrl.trim()) {
      try {
        // Persist avatar to backend
        await axios.post(
          "/api/auth/set-avatar",
          { avatar: newAvatarUrl },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setAvatar(newAvatarUrl);
        setEditData({ ...editData, avatar: newAvatarUrl });
        setNewAvatarUrl("");
        setShowAvatarModal(false);
        setAvatarError("");
        showSuccessToast("Avatar updated successfully!");
      } catch (err: any) {
        setAvatarError(
          err.response?.data?.message || "Failed to update avatar. Please try again."
        );
        showErrorToast("Failed to update avatar. Please try again.");
      }
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    navigate("/login");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] min-h-screen text-white px-6 py-10">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-emerald-400 bg-clip-text text-transparent">
            👤 User Profile
          </h1>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-400 text-sm font-medium">Online</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#1f2937] to-[#374151] rounded-2xl p-8 shadow-2xl border border-gray-700/50 backdrop-blur-sm">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
              <div className="relative group">
                <img
                  src={user.avatar || "https://via.placeholder.com/120x120/6366f1/ffffff?text=👤"}
                  alt="User Avatar"
                  className="w-32 h-32 rounded-full border-4 border-gradient-to-r from-orange-400 to-emerald-400 shadow-2xl object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <button
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute bottom-2 right-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                  title="Change Avatar"
                >
                  📷
                </button>
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-3xl font-bold text-white mb-2">{user.username}</h2>
                <p className="text-gray-300 mb-4">Welcome back! 👋</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium border border-emerald-500/30">
                    ✅ Verified
                  </span>
                  <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-medium border border-orange-500/30">
                    🔒 Secure
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-emerald-300">📋 Profile Information</h3>
                <Button
                  onClick={isEditing ? handleCancel : () => setIsEditing(true)}
                  className={`${
                    isEditing 
                      ? "bg-gray-600 hover:bg-gray-700 text-white" 
                      : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  } transition-all duration-200`}
                >
                  {isEditing ? "❌ Cancel" : "✏️ Edit"}
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Username */}
                <div className="bg-[#0f1629] rounded-xl p-4 border border-gray-600/30">
                  <label className="block text-emerald-300 font-semibold mb-2">
                    👤 Username
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.username}
                      onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                      className="w-full bg-[#1f2937] text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-orange-400 focus:outline-none transition-colors break-all"
                      placeholder="Enter username"
                    />
                  ) : (
                    <p className="text-white text-lg break-all">{user.username}</p>
                  )}
                </div>

                {/* Email */}
                <div className="bg-[#0f1629] rounded-xl p-4 border border-gray-600/30">
                  <label className="block text-emerald-300 font-semibold mb-2">
                    📧 Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full bg-[#1f2937] text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-orange-400 focus:outline-none transition-colors break-all"
                      placeholder="Enter email"
                    />
                  ) : (
                    <p className="text-white text-lg break-all">{user.email || "Not provided"}</p>
                  )}
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="pt-4">
                  <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-6 py-2 transition-all duration-200"
                  >
                    💾 Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-gradient-to-br from-[#1f2937] to-[#374151] rounded-2xl p-6 shadow-2xl border border-gray-700/50 backdrop-blur-sm h-fit">
            <h3 className="text-xl font-semibold text-emerald-300 mb-6 flex items-center gap-2">
              🔐 Security Information
            </h3>
            
            <div className="space-y-4">
              <div className="bg-[#0f1629] rounded-xl p-4 border border-gray-600/30">
                <label className="block text-orange-300 font-semibold mb-2">
                  ❓ Security Question
                </label>
                <p className="text-white text-sm leading-relaxed">
                  {user.securityQuestion || "Not set"}
                </p>
              </div>

              <div className="bg-[#0f1629] rounded-xl p-4 border border-gray-600/30">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-orange-300 font-semibold">
                    🔑 Answer
                  </label>
                  <button
                    onClick={() => setShowSecurityAnswer(!showSecurityAnswer)}
                    className="text-gray-400 hover:text-orange-400 transition-colors"
                    title={showSecurityAnswer ? "Hide answer" : "Show answer"}
                  >
                    {showSecurityAnswer ? "🙈" : "👁️"}
                  </button>
                </div>
                <p className="text-white text-sm">
                  {showSecurityAnswer 
                    ? (user.securityAnswer || "Not set")
                    : "•".repeat((user.securityAnswer || "").length || 8)
                  }
                </p>
              </div>
            </div>

            {/* Account Stats */}
            <div className="mt-6 pt-6 border-t border-gray-600/30">
              <h4 className="text-sm font-semibold text-gray-400 mb-3">📊 Account Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Profile Completion</span>
                  <span className="text-emerald-400 font-semibold">85%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
          >
            🚪 Logout
          </Button>
        </div>
      </div>

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1f2937] rounded-2xl p-6 w-full max-w-md border border-gray-600">
            <h3 className="text-xl font-bold text-white mb-4">📷 Change Profile Picture</h3>
            <div className="space-y-4">
              {/* Avatar Selection Grid */}
              <div>
                <label className="block text-emerald-300 font-semibold mb-2">
                  🖼️ Choose an Avatar
                </label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {[1,2,3,4,5,6,7,8,9,10].map(num => {
                    const ext = num <= 5 ? 'jpg' : 'jpeg';
                    const url = `/avatars/avatar${num}.${ext}`;
                    return (
                      <img
                        key={url}
                        src={url}
                        alt={`Avatar ${num}`}
                        className={`w-12 h-12 rounded-full object-cover border-2 cursor-pointer transition-all duration-150 ${newAvatarUrl === url ? 'border-orange-400 ring-2 ring-orange-400' : 'border-gray-600 hover:border-orange-400'}`}
                        onClick={() => {
                          setNewAvatarUrl(url);
                          setAvatarError("");
                        }}
                      />
                    );
                  })}
                </div>
                <p className="text-gray-400 text-xs mb-2">Or paste a link below:</p>
                <label className="block text-emerald-300 font-semibold mb-2">
                  🔗 Image URL
                </label>
                <input
                  type="url"
                  value={newAvatarUrl}
                  onChange={(e) => {
                    setNewAvatarUrl(e.target.value);
                    setAvatarError("");
                  }}
                  className="w-full bg-[#0f1629] text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-orange-400 focus:outline-none transition-colors"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              {newAvatarUrl && (
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Preview:</p>
                  <img
                    src={newAvatarUrl}
                    alt="Preview"
                    className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-orange-400"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/80x80/6366f1/ffffff?text=❌";
                    }}
                  />
                </div>
              )}

              {avatarError && (
                <p className="text-red-400 text-sm mt-2">{avatarError}</p>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowAvatarModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAvatarUpdate}
                  disabled={!newAvatarUrl.trim() || !!avatarError}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#1f2937] to-[#374151] rounded-2xl p-8 w-full max-w-md border border-gray-700/50 shadow-2xl backdrop-blur-sm">
            <div className="text-center mb-6">
             
              <h3 className="text-2xl font-bold text-white mb-2">Confirm Logout</h3>
              <p className="text-gray-300 leading-relaxed">
                Are you sure you want to logout from your account?
              </p>
              <p className="text-sm text-gray-400 mt-2">
                You'll need to login again to access your profile.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={confirmLogout}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
              >
                 Yes, Logout
              </Button>
              <Button
                onClick={cancelLogout}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
              >
                Cancel
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-600/30">
              <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                <span>Your session will be terminated</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}