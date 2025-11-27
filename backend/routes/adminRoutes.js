// backend/routes/adminRoutes.js
import express from "express";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ============================
   ADMIN OVERVIEW / STATS
   Frontend expects: /api/admin/overview
   You already had: /api/admin/stats
   ✅ We keep both (overview alias)
=============================== */

// ⭐ Admin Overview (alias of stats)
router.get("/overview", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.countDocuments();
    const products = await Product.countDocuments();
    const orders = await Order.countDocuments();

    // Revenue (completed orders)
    const revenueData = await Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const revenue = revenueData[0]?.total || 0;

    res.json({ users, products, orders, revenue });
  } catch (error) {
    console.error("Admin Overview Error:", error);
    res.status(500).json({ message: "Failed to load admin overview" });
  }
});

// ⭐ Admin Stats (same as overview, but includes recentOrders)
router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.countDocuments();
    const products = await Product.countDocuments();
    const orders = await Order.countDocuments();

    const revenueData = await Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const revenue = revenueData[0]?.total || 0;

    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      users,
      products,
      orders,
      revenue,
      recentOrders,
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ message: "Failed to load admin stats" });
  }
});

/* ============================
   ADMIN: CHANGE ORDER STATUS
=============================== */
router.put("/order-status/:id", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error("Order Status Update Error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
});

/* ============================
   ADMIN: ALL ORDERS
=============================== */
router.get("/all-orders", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Load Orders Error:", error);
    res.status(500).json({ message: "Failed to load orders" });
  }
});

export default router;
