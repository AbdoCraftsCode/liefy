import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: "User", default: null },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "dlivery", },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: String,
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

export const NotificationModel = mongoose.model("Notification", notificationSchema);
