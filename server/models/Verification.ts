import mongoose from "mongoose";

const VerificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, default: "Pending" },
  submittedAt: { type: Date, default: Date.now },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' } // optional
}, { timestamps: true });

export const Verification = mongoose.models.Verification || mongoose.model("Verification", VerificationSchema);
