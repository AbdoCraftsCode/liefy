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

    phone: {
        type: String,
        required: true
    },

    serviceName: {
        type: String,  // مثل: "Vodafone Cash" – "Etisalat Cash" – "Bank Transfer"
        required: true
    },

    fullName: {
        type: String, // اسم صاحب الحساب اللي هيتحول له
        required: true
    },

    accountNumber: {
        type: String, // رقم الحساب / رقم المحفظة
        required: true
    },

    accountName: {
        type: String, // اسم الحساب على المحفظة / البنك
        required: true
    },
    reason: {
        type: String, // اسم الحساب على المحفظة / البنك
       
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId, // الادمن اللي نفذ العملية
        ref: "User",
        default: null
    },

    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "completed"],
        default: "pending"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Withdraw = mongoose.model("Withdraw", withdrawSchema);
