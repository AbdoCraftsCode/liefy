import mongoose from "mongoose";
import { OrderCounter } from "./CounterSchema.js";

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




const OrderSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        // required: true
    },
    source: {
        location: {
            type: PointSchema,
            required: true
        },
        address: {
            type: String,
            required: true
        }
    },
    destination: {
        location: {
            type: PointSchema,
            required: true
        },
        address: {
            type: String,
            required: true
        }
    },
    orderPrice: {
        type: Number,
        // required: true
    },
    deliveryPrice: {
        type: Number,
        required: true
    },
    // bonus: {
    //     type: Number,
    //     default: 0
    // },
    totalPrice: {
        type: Number,
        // required: true
    },
    orderDetails: { type: String, default: "" },
    image: {
        secure_url: { type: String, default: null },
        public_id: { type: String, default: null }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    status: {
        type: String,
        enum: ["pending", "active", "completed", "cancelled"],
        default: "pending"
    },

    subStatus: {
        type: String,
        enum: [
            "waiting",       // pending
            "has_offers",    // pending
            "assigned",      // pending
            "preparing",     // active
            "going_to_pickup",   // active
            "picked",        // active
            "going_to_destination", // active
            "delivered",     // completed
            "by_client",     // cancelled
            "by_driver",     // cancelled
            "payment_failed" // cancelled
        ],
        default: "waiting"
    },


    cancellation: {
        isCanceled: {
            type: Boolean,
            default: false
        },
        canceledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        reason: {
            type: String,
            default: ""
        },
        date: {
            type: Date,
            default: null
        }
    },

    orderNumber: {
        type: String,
        unique: true
    },



    fromTime: {
        type: String,
        default: null
    },
    toTime: {
        type: String,
        default: null
    },


    negotiations: [
        {
            offeredBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            newDeliveryPrice: {
                type: Number,
                required: true
            },
            message: {
                type: String,
                default: ""
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});


OrderSchema.pre("save", async function (next) {
    if (!this.isNew) return next();

    const counter = await OrderCounter.findOneAndUpdate(
        { name: "order" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    this.orderNumber = `ORD-${counter.seq}`;
    next();
});
export const dliveryModel = mongoose.model("dlivery", OrderSchema);
