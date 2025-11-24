import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    productId: {
        type: String, // أو ObjectId لو عندك منتجات مخزنة في قاعدة بيانات
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: "usd"
    },
    status: {
        type: String,
        enum: ["pending", "succeeded", "failed"],
        default: "pending"
    },
    stripePaymentIntentId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Payment = mongoose.model("Payment", paymentSchema);
