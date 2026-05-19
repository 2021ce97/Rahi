import mongoose from "mongoose";

const RiderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  rating: { type: Number, default: 5.0 },
  status: { type: String, enum: ["active", "flagged", "banned"], default: "active" },
  walletBalance: { type: Number, default: 0 },
  totalRides: { type: Number, default: 0 }
}, { timestamps: true });

export const Rider = mongoose.models.Rider || mongoose.model("Rider", RiderSchema);
