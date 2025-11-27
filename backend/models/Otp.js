// backend/models/Otp.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // ✅ রাউটে যেটা ব্যবহার করছেন (codeHash) সেটাই রাখতে হবে
    codeHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ index শুধু email এ দিলেই যথেষ্ট
otpSchema.index({ email: 1 });

const Otp = mongoose.model("Otp", otpSchema);
export default Otp;
