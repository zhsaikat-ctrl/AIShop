import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import Otp from "../models/Otp.js";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";

const router = express.Router();

// POST /api/auth/request-otp
router.post("/request-otp", async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await bcrypt.hash(otp, 10);

    await Otp.deleteMany({ email }); // আগের OTP রিমুভ

    await Otp.create({
      email,
      codeHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 মিনিট
    });

    await sendOtpEmail(email, otp);

    // ইউজার যদি না থাকে, এখানে create করে দিচ্ছি (guest→user smooth)
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name || "User",
        email,
        password: undefined,
        role: "user",
      });
    }

    res.json({ message: "OTP sent to email" });
  } catch (e) {
    console.log("request-otp error:", e);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required" });

    const record = await Otp.findOne({ email });
    if (!record) return res.status(400).json({ message: "OTP not found / expired" });

    const ok = await bcrypt.compare(String(otp), record.codeHash);
    if (!ok) return res.status(400).json({ message: "Invalid OTP" });

    await Otp.deleteMany({ email }); // OTP one-time

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      address: user.address || {},
      token: generateToken(user._id),
    });
  } catch (e) {
    console.log("verify-otp error:", e);
    res.status(500).json({ message: "OTP verify failed" });
  }
});

export default router;
