import mongoose from "mongoose";

const SmsNotificationSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["pending", "sent", "failed"], default: "sent" },
  provider: { type: String, default: "MockSMS API" },
}, { timestamps: true });

export const SmsNotification = mongoose.models.SmsNotification || mongoose.model("SmsNotification", SmsNotificationSchema);

export async function sendSMS(phone: string, message: string) {
  console.log(`[SMS SYSTEM] Sending SMS to ${phone}:\n      "${message}"`);
  
  if (mongoose.connection.readyState === 1) { // 1 = connected
    try {
      await SmsNotification.create({ phone, message, status: "sent" });
    } catch (e) {
      console.error("[SMS SYSTEM] Failed to log SMS:", e);
    }
  }
  return true;
}
