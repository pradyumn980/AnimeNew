import crypto from "crypto";
import express from "express";
import Razorpay from "razorpay";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

const router = express.Router();

// Lazily instantiate Razorpay so that dotenv has already loaded by the time
// this runs (ES module imports are hoisted before server.js calls dotenv.config())
let _razorpay = null;
const getRazorpay = () => {
	if (!_razorpay) {
		_razorpay = new Razorpay({
			key_id: process.env.RAZORPAY_KEY_ID,
			key_secret: process.env.RAZORPAY_KEY_SECRET,
		});
	}
	return _razorpay;
};

// ─── POST /api/payment/order ───────────────────────────────────────────────
// Creates a Razorpay order and saves a pending Order doc in DB.
router.post("/order", isAuthenticated, async (req, res) => {
	try {
		const {
			amount,
			currency = "INR",
			type,
			itemName,
			metadata = {},
		} = req.body;

		if (!amount || !type || !itemName) {
			return res
				.status(400)
				.json({ message: "amount, type, and itemName are required." });
		}

		const razorpayOrder = await getRazorpay().orders.create({
			amount: Math.round(amount * 100), // convert ₹ → paise
			currency,
			receipt: `receipt_${Date.now()}`,
			notes: { userId: req.userId.toString(), type, itemName },
		});

		const order = new Order({
			userId: req.userId,
			type,
			itemName,
			amount: Math.round(amount * 100),
			currency,
			razorpayOrderId: razorpayOrder.id,
			metadata,
		});
		await order.save();

		res.status(201).json({
			orderId: razorpayOrder.id,
			amount: razorpayOrder.amount,
			currency: razorpayOrder.currency,
			keyId: process.env.RAZORPAY_KEY_ID,
		});
	} catch (err) {
		console.error("Create order error:", err);
		res
			.status(500)
			.json({ message: "Failed to create payment order.", error: err.message });
	}
});

// ─── POST /api/payment/verify ─────────────────────────────────────────────
// Verifies Razorpay signature, marks order paid, upgrades premium if membership.
router.post("/verify", isAuthenticated, async (req, res) => {
	try {
		const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
			req.body;

		const expectedSignature = crypto
			.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
			.update(`${razorpay_order_id}|${razorpay_payment_id}`)
			.digest("hex");

		if (expectedSignature !== razorpay_signature) {
			return res
				.status(400)
				.json({ message: "Payment verification failed — signature mismatch." });
		}

		// Update order in DB
		const order = await Order.findOneAndUpdate(
			{ razorpayOrderId: razorpay_order_id },
			{
				razorpayPaymentId: razorpay_payment_id,
				razorpaySignature: razorpay_signature,
				status: "paid",
			},
			{ new: true },
		);

		if (!order) {
			return res.status(404).json({ message: "Order not found." });
		}

		// If membership payment, upgrade user to premium
		if (order.type === "membership") {
			const durationDays = order.metadata?.plan === "annual" ? 365 : 30;
			const expiresAt = new Date(
				Date.now() + durationDays * 24 * 60 * 60 * 1000,
			);

			await User.findByIdAndUpdate(req.userId, {
				isPremium: true,
				premiumExpiresAt: expiresAt,
			});
		}

		res.status(200).json({ message: "Payment verified successfully.", order });
	} catch (err) {
		console.error("Verify payment error:", err);
		res
			.status(500)
			.json({ message: "Payment verification error.", error: err.message });
	}
});

// ─── GET /api/payment/orders ──────────────────────────────────────────────
// Returns the authenticated user's order history.
router.get("/orders", isAuthenticated, async (req, res) => {
	try {
		const orders = await Order.find({ userId: req.userId })
			.sort({ createdAt: -1 })
			.limit(50);
		res.status(200).json({ orders });
	} catch (err) {
		console.error("Fetch orders error:", err);
		res
			.status(500)
			.json({ message: "Failed to fetch orders.", error: err.message });
	}
});

export default router;
