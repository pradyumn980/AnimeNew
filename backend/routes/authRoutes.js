import express from "express";
import {
	getCurrentUser,
	getSecurityQuestion,
	loginUser,
	logoutUser,
	register,
	resetPassword,
	setAvatar,
} from "../controllers/authController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post(
	"/login",
	(req, res, next) => {
		console.log("login route hit");
		next();
	},
	loginUser,
);
router.post("/logout", logoutUser);
router.get("/me", isAuthenticated, getCurrentUser);
router.post("/set-avatar", isAuthenticated, setAvatar);
router.post("/get-security-question", getSecurityQuestion);
router.post("/reset-password", resetPassword);
// optional: protect this too with isAuthenticated

export default router;
