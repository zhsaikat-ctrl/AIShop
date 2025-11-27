// backend/utils/sendOtpEmail.js
import nodemailer from "nodemailer";

export async function sendOtpEmail(email, otp) {
  if (!email || !otp) {
    throw new Error("sendOtpEmail: email/otp missing");
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.OTP_EMAIL_USER,
        pass: process.env.OTP_EMAIL_PASS, // Gmail App Password
      },
    });

    // Optional: ensures auth OK (helpful for debugging)
    await transporter.verify();

    const subject = "Your AIShop OTP Code";
    const text = `Your OTP is ${otp}. It will expire in 5 minutes.`;

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>AIShop OTP Verification</h2>
        <p>Your OTP code is:</p>
        <h1 style="letter-spacing:4px">${otp}</h1>
        <p>This code will expire in <b>5 minutes</b>.</p>
        <p>If you didn’t request this, you can ignore this email.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"AIShop" <${process.env.OTP_EMAIL_USER}>`,
      to: email,
      subject,
      text,
      html,
    });

    return true;
  } catch (err) {
    console.error("sendOtpEmail error:", err.message);
    throw new Error("Failed to send OTP email");
  }
}
