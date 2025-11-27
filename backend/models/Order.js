import mongoose from "mongoose";

// Single Order Item Schema
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: { type: String, required: true },   // ✅ snapshot
    image: { type: String, default: "" },     // ✅ snapshot

    qty: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

// Shipping Address Schema
const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    postalCode: { type: String, default: "" },
    country: { type: String, default: "Bangladesh" },
  },
  { _id: false }
);

// Main Order Schema
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ items array
    items: {
      type: [orderItemSchema],
      required: true,
    },

    // ✅ shipping address saved with order
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    // ✅ totals
    totalPrice: {
      type: Number,
      required: true,
    },

    // ✅ payment
    paymentMethod: {
      type: String,
      default: "stripe",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    paymentResult: {
      id: String,
      status: String,
      email_address: String,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
