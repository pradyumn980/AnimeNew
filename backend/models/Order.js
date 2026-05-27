import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		type: {
			type: String,
			enum: ["membership", "merchandise", "donation"],
			required: true,
		},
		itemName: { type: String, required: true },
		amount: { type: Number, required: true }, // in paise (INR smallest unit)
		currency: { type: String, default: "INR" },
		razorpayOrderId: { type: String, required: true },
		razorpayPaymentId: { type: String, default: null },
		razorpaySignature: { type: String, default: null },
		status: {
			type: String,
			enum: ["pending", "paid", "failed"],
			default: "pending",
		},
		metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
	},
	{ timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
