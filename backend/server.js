// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import otpRoutes from "./routes/otpRoutes.js"; // ✅ OTP login routes
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js"; // ⭐ Stripe routes
import sslcommerzRoutes from "./routes/sslcommerzRoutes.js"; // ✅ SSLCOMMERZ routes
import wishlistRoutes from "./routes/wishlistRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ DB Connect + log DB name
connectDB()
  .then(() => {
    console.log("MongoDB Connected Successfully");
    console.log("Mongo DB Name:", mongoose.connection.name);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });

// Test Route
app.get("/", (req, res) => {
  res.send("AIShop Backend Running");
});

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", otpRoutes); // ✅ same base, no conflict
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

// ✅ Payment Routes (Stripe + SSLCOMMERZ)
app.use("/api/pay", paymentRoutes);      // Stripe: /api/pay/checkout
app.use("/api/pay", sslcommerzRoutes);   // SSLC:  /api/pay/sslcommerz/init etc.

app.use("/api/wishlist", wishlistRoutes);

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Server Error", error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
