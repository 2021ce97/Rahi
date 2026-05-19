import mongoose from "mongoose";

const DriverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  tazkiraId: { type: String, unique: true, sparse: true },
  vehicleMake: { type: String, required: true },
  vehicleModel: { type: String, required: true },
  vehicleColor: { type: String, required: true },
  plateNumber: { type: String, required: true },
  rating: { type: Number, default: 5.0 },
  status: { type: String, enum: ["online", "offline", "in-ride"], default: "offline" },
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
  commissionBalance: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

DriverSchema.index({ location: "2dsphere" });

export const Driver = mongoose.models.Driver || mongoose.model("Driver", DriverSchema);
