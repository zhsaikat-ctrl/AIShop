import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { protect } from "../middleware/authMiddleware.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// POST /api/pay/checkout
router.post("/checkout", protect, async (req, res) => {
  try {
    const { items, userId, orderId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items to pay for" });
    }
    if (!orderId) {
      return res.status(400).json({ message: "orderId required" });
    }

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: Number(item.qty) || 1,
    }));

    const frontend = process.env.FRONTEND_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,

      // ✅ pass orderId to success page
      success_url: `${frontend}/payment-success?orderId=${orderId}`,
      cancel_url: `${frontend}/checkout`,

      // ✅ keep metadata for safety
      metadata: {
        userId: userId || req.user._id.toString(),
        orderId,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.log("Stripe Error:", error);
    res.status(500).json({ message: "Payment failed", error: error?.message });
  }
});

export default router;
