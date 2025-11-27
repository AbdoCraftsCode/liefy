import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        // minlength: 10
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Complaint = mongoose.model("Complaint", complaintSchema);
