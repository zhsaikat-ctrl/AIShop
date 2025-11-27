// backend/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true, lowercase: true },

    // ✅ OTP login এ password লাগবে না, তাই optional
    password: { type: String, required: false },

    role: { type: String, default: "user" },

    avatar: { type: String, default: "" }, // ⭐ Profile photo

    // ✅ phone
    phone: { type: String, default: "" },

    // ✅ full address saved for future checkout autofill
    address: {
      fullName: { type: String, default: "" },
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      district: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      country: { type: String, default: "Bangladesh" },
    },
  },
  { timestamps: true }
);

// ✅ Hash Password only if password exists and modified
userSchema.pre("save", async function (next) {
  // password নেই (OTP user) → hash skip
  if (!this.password) return next();
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Compare Password safely
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false; // OTP-only user
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
