import mongoose from "mongoose";

const PointSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["Point"],
        default: "Point"
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
    }
}, { _id: false });

const FavoritePlaceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    name: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true
    },

    location: {
        type: PointSchema,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 🔍 مهم لبحث GeoSpatial
FavoritePlaceSchema.index({ location: "2dsphere" });

export const FavoritePlace = mongoose.model("FavoritePlace", FavoritePlaceSchema);
