import express from "express";
import {
  register,
  loginUser,
  logoutUser,
  getCurrentUser,
  setAvatar,
  getSecurityQuestion,
  resetPassword,
} from "../controllers/authController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", isAuthenticated, getCurrentUser);
router.post("/set-avatar", isAuthenticated, setAvatar);
router.post("/get-security-question", getSecurityQuestion);
router.post("/reset-password", resetPassword);
 // optional: protect this too with isAuthenticated

export default router;
