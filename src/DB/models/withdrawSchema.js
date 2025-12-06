import mongoose from "mongoose";

const withdrawSchema = new mongoose.Schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    amount: {
        type: Number,
        required: true,
        min: 1
    },

    provider: {
        type: String,
        enum: ["paypal", "bankAccount"],
        required: true
    },

    identifier: {
        email: { type: String },   // PayPal
        iban: { type: String },    // Bank Account
        name: { type: String }     // مشترك بينهم
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "completed"],
        default: "pending"
    },

    reason: {
        type: String
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Withdraw = mongoose.model("Withdraw", withdrawSchema);
