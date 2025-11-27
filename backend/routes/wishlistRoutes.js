import express from "express";
import Wishlist from "../models/Wishlist.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// add to wishlist
router.post("/add", protect, async (req, res) => {
  const { productId } = req.body;

  const exists = await Wishlist.findOne({ user: req.user._id, product: productId });
  if (exists) return res.status(400).json({ message: "Already in wishlist" });

  const item = await Wishlist.create({
    user: req.user._id,
    product: productId,
  });

  res.json(item);
});

// remove
router.post("/remove", protect, async (req, res) => {
  const { productId } = req.body;

  await Wishlist.findOneAndDelete({ user: req.user._id, product: productId });
  res.json({ message: "Removed" });
});

// get all wishlist for user
router.get("/", protect, async (req, res) => {
  const items = await Wishlist.find({ user: req.user._id }).populate("product");
  res.json(items);
});

export default router;
