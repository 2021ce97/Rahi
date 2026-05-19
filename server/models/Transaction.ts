import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  type: { type: String, required: true }, // e.g. "Ride Fare", "Commission", "Wallet Top-up"
  amount: { type: Number, required: true },
  entity: { type: String, required: true }, // e.g. "Driver D-101", "Platform"
  status: { type: String, default: "Completed" }
}, { timestamps: true });

export const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
