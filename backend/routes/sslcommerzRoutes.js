import express from "express";
import SSLCommerzPayment from "sslcommerz-lts";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const store_id = process.env.SSLC_STORE_ID;
const store_passwd = process.env.SSLC_STORE_PASS;
const is_live = process.env.SSLC_IS_LIVE === "true";

/**
 * POST /api/pay/sslcommerz/init
 * body: { orderId }
 */
router.post("/sslcommerz/init", protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: "orderId required" });

    const order = await Order.findById(orderId).populate("items.product", "name image price");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // শুধু নিজের অর্ডার পে করতে পারবে
    if (order.user?.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const backend = process.env.BACKEND_URL || "http://localhost:5000";
    const frontend = process.env.FRONTEND_URL || "http://localhost:5173";

    const tran_id = `AIShop_${order._id}_${Date.now()}`;

    const data = {
      total_amount: Number(order.totalPrice || order.total || 0),
      currency: "BDT",
      tran_id,

      success_url: `${backend}/api/pay/sslcommerz/success?orderId=${order._id}`,
      fail_url: `${backend}/api/pay/sslcommerz/fail?orderId=${order._id}`,
      cancel_url: `${backend}/api/pay/sslcommerz/cancel?orderId=${order._id}`,
      ipn_url: `${backend}/api/pay/sslcommerz/ipn`,

      shipping_method: "Courier",
      product_name: "AIShop Products",
      product_category: "Ecommerce",
      product_profile: "general",

      cus_name: order.shippingAddress?.fullName || req.user.name || "Customer",
      cus_email: req.user.email,
      cus_add1: order.shippingAddress?.street || "Dhaka",
      cus_add2: order.shippingAddress?.district || "Dhaka",
      cus_city: order.shippingAddress?.city || "Dhaka",
      cus_state: order.shippingAddress?.district || "Dhaka",
      cus_postcode: order.shippingAddress?.postalCode || "1000",
      cus_country: order.shippingAddress?.country || "Bangladesh",
      cus_phone: order.shippingAddress?.phone || req.user.phone || "01700000000",

      ship_name: order.shippingAddress?.fullName || "Customer",
      ship_add1: order.shippingAddress?.street || "Dhaka",
      ship_add2: order.shippingAddress?.district || "Dhaka",
      ship_city: order.shippingAddress?.city || "Dhaka",
      ship_state: order.shippingAddress?.district || "Dhaka",
      ship_postcode: order.shippingAddress?.postalCode || "1000",
      ship_country: order.shippingAddress?.country || "Bangladesh",
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

    const apiResponse = await sslcz.init(data);

    // GatewayPageURL এ রিডাইরেক্ট URL থাকে
    if (!apiResponse?.GatewayPageURL) {
      return res.status(500).json({ message: "Failed to init payment" });
    }

    // tran_id অর্ডারে রেখে দিচ্ছি
    order.paymentMethod = "sslcommerz";
    order.paymentResult = { tran_id };
    await order.save();

    res.json({ url: apiResponse.GatewayPageURL });
  } catch (err) {
    console.error("SSLC init error:", err);
    res.status(500).json({ message: "SSLCOMMERZ init failed" });
  }
});

/**
 * SSLCOMMERZ success callback
 * POST body will contain val_id etc
 */
router.post("/sslcommerz/success", async (req, res) => {
  try {
    const { orderId } = req.query;
    const { val_id } = req.body;

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const validation = await sslcz.validate({ val_id });

    // VALIDATED বা VALID হলে পেমেন্ট কনফার্ম
    const status = validation?.status;

    if (status === "VALID" || status === "VALIDATED") {
      const order = await Order.findById(orderId);
      if (order) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentMethod = "sslcommerz";
        order.paymentResult = validation;
        await order.save();
      }

      const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
      return res.redirect(`${frontend}/payment-success?orderId=${orderId}`);
    }

    const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontend}/checkout?payment=failed`);
  } catch (err) {
    console.error("SSLC success error:", err);
    const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontend}/checkout?payment=failed`);
  }
});

router.post("/sslcommerz/fail", async (req, res) => {
  const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
  return res.redirect(`${frontend}/checkout?payment=failed`);
});

router.post("/sslcommerz/cancel", async (req, res) => {
  const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
  return res.redirect(`${frontend}/checkout?payment=cancelled`);
});

/**
 * IPN listener (optional but recommended)
 * SSLC will POST to this URL
 */
router.post("/sslcommerz/ipn", async (req, res) => {
  try {
    const { val_id, tran_id } = req.body;
    if (!val_id) return res.status(400).send("No val_id");

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const validation = await sslcz.validate({ val_id });

    if (validation?.status === "VALID" || validation?.status === "VALIDATED") {
      // tran_id থেকে orderId বের করা
      const parts = String(tran_id || "").split("_");
      const orderId = parts[1];

      const order = await Order.findById(orderId);
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentMethod = "sslcommerz";
        order.paymentResult = validation;
        await order.save();
      }
    }

    res.status(200).send("IPN received");
  } catch (err) {
    console.error("SSLC IPN error:", err);
    res.status(500).send("IPN error");
  }
});

export default router;
