import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const generateToken = (user, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production", // true in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });

  return token;
};


// POST /api/auth/register
export const register = async (req, res) => {
  let { username, password, email, securityQuestion, securityAnswer } = req.body;
  console.log(req.body)

  username = username.trim().toLowerCase();  // Normalize username here

  console.log("Register attempt for:", username);

  try {
    const existing = await User.findOne({ username }); // Query with lowercase username
    if (existing) {
      console.log("User exists:", existing.username);
      return res.status(409).json({ message: "Username already exists" });
    }
    
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,  // Save normalized username
      password: hashed,
      email,
      securityQuestion,
      securityAnswer,
    });

    const token =generateToken(user, res);

    res.status(201).json({ user: { username: user.username, email: user.email ,token:token} });
  } catch (err) {
    console.error("Error in register:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// POST /api/auth/login
export const loginUser = async (req, res) => {
  let { username, password } = req.body;

  username = username.trim().toLowerCase();  // Normalize username before search

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token =generateToken(user, res);
  res.status(200).json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar || null,
      token:token
    },
  });
};

// POST /api/auth/logout
export const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

// GET /api/auth/me
export const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ message: "Not authenticated" });
  res.json({ user });
};

// POST /api/auth/set-avatar
export const setAvatar = async (req, res) => {
  try {
    const userId = req.userId; // should be set by isAuthenticated middleware
    const { avatar } = req.body;

    if (!avatar) return res.status(400).json({ message: "Avatar URL is required" });

    // Update user's avatar field in DB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "Avatar updated successfully",
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    console.error("Error updating avatar:", error);
    res.status(500).json({ message: "Failed to update avatar" });
  }
};

// POST /api/auth/get-security-question
export const getSecurityQuestion = async (req, res) => {
  let { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }
  username = username.trim().toLowerCase();
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.securityQuestion) {
      return res.status(404).json({ message: "No security question set for this user" });
    }
    res.json({ securityQuestion: user.securityQuestion });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  let { username, securityAnswer, newPassword } = req.body;
  if (!username || !securityAnswer || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }
  username = username.trim().toLowerCase();
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.securityAnswer || user.securityAnswer.trim().toLowerCase() !== securityAnswer.trim().toLowerCase()) {
      return res.status(401).json({ message: "Incorrect security answer" });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
