import mongoose from "mongoose";

const DiasporaGiftSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  recipientPhone: { type: String, required: true },
  amountUSD: { type: Number, required: true },
  amountAFN: { type: Number, required: true },
  status: { type: String, default: "Pending" },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export const DiasporaGift = mongoose.models.DiasporaGift || mongoose.model("DiasporaGift", DiasporaGiftSchema);
