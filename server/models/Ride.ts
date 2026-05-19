import mongoose from "mongoose";

const RideSchema = new mongoose.Schema({
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: "Rider", required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
  pickupLocation: {
    name: { type: String }, // e.g., "PD6 Mosque"
    coordinates: { type: [Number] } // [lng, lat]
  },
  dropoffLocation: {
    name: { type: String },
    coordinates: { type: [Number] }
  },
  fareProposed: { type: Number, required: true }, // AFN
  fareAgreed: { type: Number },
  status: { 
    type: String, 
    enum: ["searching", "negotiating", "accepted", "in-progress", "completed", "cancelled"], 
    default: "searching" 
  },
  bids: [{
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
    amount: { type: Number },
    timeToPickup: { type: Number } // minutes
  }],
}, { timestamps: true });

export const Ride = mongoose.models.Ride || mongoose.model("Ride", RideSchema);
