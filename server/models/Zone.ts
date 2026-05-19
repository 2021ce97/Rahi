import mongoose from "mongoose";

const ZoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // e.g. "High Demand"
  baseMultiplier: { type: Number, default: 1.0 },
  activeDrivers: { type: Number, default: 0 },
  status: { type: String, default: "Active" },
  lat: { type: Number },
  lng: { type: Number },
  radius: { type: Number }
}, { timestamps: true });

export const Zone = mongoose.models.Zone || mongoose.model("Zone", ZoneSchema);
