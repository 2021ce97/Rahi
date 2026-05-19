import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ["rider_report", "driver_report", "dispute", "general"], default: "general" },
  status: { type: String, enum: ["open", "in_progress", "resolved", "closed"], default: "open" },
  reporterId: { type: String }, // e.g., Rider ID or Driver ID
  reportedEntityId: { type: String }, // optional, if reporting another user
  assignedAdmin: { type: String, default: null },
  resolutionNotes: { type: String },
}, { timestamps: true });

export const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
