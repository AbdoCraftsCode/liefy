// models/Complaint.model.js (جديد ومُحسّن)
import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "dlivery",
        required: true
    },
    complainant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    complainantRole: {
        type: String,
        enum: ["client", "captain"],
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true,
        minlength: 10
    },
    status: {
        type: String,
        enum: ["pending", "under_review", "resolved", "rejected"],
        default: "pending"
    },
    adminResponse: { type: String, default: null },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    respondedAt: { type: Date, default: null }
}, { timestamps: true });

complaintSchema.index({ orderId: 1, complainant: 1 }, { unique: true });

export const ComplaintModell = mongoose.model("Complainttt", complaintSchema);