import express from "express";
import User from "../models/User.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/set-avatar", isAuthenticated, async (req, res) => {
  const { avatar } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.userId, { avatar }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Avatar updated", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
