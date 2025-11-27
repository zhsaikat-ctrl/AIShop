import express from "express";
import Order from "../models/Order.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ======================================================
   USER: PLACE ORDER
   POST /api/orders
   (Checkout.jsx এই রুট কল করে)
====================================================== */
router.post("/", protect, async (req, res) => {
  try {
    const { items, shippingAddress, totalPrice, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.street) {
      return res.status(400).json({ message: "Shipping address required" });
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      totalPrice,
      paymentMethod: paymentMethod || "stripe",
      status: "pending",
      isPaid: false,
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("Order create error:", err);
    res.status(500).json({ message: "Failed to place order" });
  }
});

/* ======================================================
   ADMIN: Get All Orders
   GET /api/orders/all
   (/:id এর আগে রাখতে হবে)
====================================================== */
router.get("/all", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .populate("items.product", "name image price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("All orders error:", err);
    res.status(500).json({ message: "Failed to load orders" });
  }
});

/* ======================================================
   ADMIN: Dashboard Stats
   GET /api/orders/stats/admin
====================================================== */
router.get("/stats/admin", protect, adminOnly, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    const totalRevenueAgg = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, sum: { $sum: "$totalPrice" } } },
    ]);

    const last5 = await Order.find({})
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalOrders,
      revenue: totalRevenueAgg[0]?.sum || 0,
      recent: last5,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Failed to load stats" });
  }
});

/* ======================================================
   USER: My Orders
   GET /api/orders/my
====================================================== */
router.get("/my", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name image price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("My orders error:", err);
    res.status(500).json({ message: "Failed to load orders" });
  }
});

/* ======================================================
   USER/ADMIN: Track Single Order
   GET /api/orders/:id
====================================================== */
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name image price")
      .populate("user", "name email phone address");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // User can only see his order (admin can see all)
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(order);
  } catch (err) {
    console.error("Order view error:", err);
    res.status(500).json({ message: "Failed to load order" });
  }
});

/* ======================================================
   USER: Mark order as paid (Stripe success)
   PUT /api/orders/:id/pay
====================================================== */
router.put("/:id/pay", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // only owner/admin
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = req.body.paymentResult || {};

    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    console.error("Pay update error:", err);
    res.status(500).json({ message: "Failed to update payment status" });
  }
});

/* ======================================================
   ADMIN: Update Order Status
   PATCH /api/orders/status/:id
====================================================== */
router.patch("/status/:id", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = [
      "pending",
      "processing",
      "shipped",
      "completed",
      "cancelled",
    ];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ message: "Status updated!", order });
  } catch (err) {
    console.error("Order status error:", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

export default router;
