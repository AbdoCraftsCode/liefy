import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    seq: { type: Number, default: 99 } // يبدأ من 99 علشان أول رقم يبقى 100
});

export const OrderCounter = mongoose.model("OrderCounter", CounterSchema);
