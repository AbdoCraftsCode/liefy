import mongoose from "mongoose";

const kiloPriceSchema = new mongoose.Schema({
    kiloPrice: {
        type: Number,
     
    },
    distance: {
        type: Number,
     
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const KiloPriceModel = mongoose.model("KiloPrice", kiloPriceSchema);
