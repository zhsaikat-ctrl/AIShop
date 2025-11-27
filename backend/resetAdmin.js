// resetAdmin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // ⚠️ যদি আপনার backend bcrypt ব্যবহার করে, এটা "bcrypt" করে দিন
import User from "./models/User.js"; // ⚠️ আপনার আসল User model path দিন

const run = async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/aishop");

  const email = "admin@example.com";
  const newPass = "123456";

  const user = await User.findOne({ email });
  if (!user) {
    console.log("Admin user not found in DB");
    process.exit(0);
  }

  user.password = await bcrypt.hash(newPass, 10);
  user.role = "admin";
  await user.save();

  console.log("✅ Admin password reset done. Email:", email, "Pass:", newPass);
  process.exit(0);
};

run();