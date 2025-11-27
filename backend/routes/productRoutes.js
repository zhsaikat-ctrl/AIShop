// backend/routes/productRoutes.js
import express from "express";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ============================
   GET ALL PRODUCTS (Public)
=============================== */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.log("GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Failed to load products" });
  }
});

/* ============================
   GET SINGLE PRODUCT (Public)
=============================== */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "reviews.user",
      "name avatar"
    );

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    console.log("GET PRODUCT ERROR:", err);
    res.status(500).json({ message: "Failed to load product" });
  }
});

/* ============================
   CREATE PRODUCT (Admin Only)
   POST /api/products
=============================== */
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name, price, category, description, image, stock } = req.body;

    if (!name || !price || !category) {
      return res
        .status(400)
        .json({ message: "name, price, category required" });
    }

    const product = await Product.create({
      name: name.trim(),
      price: Number(price),
      category: category.trim(),
      description: description || "",
      image: image || "",
      stock: stock ?? 0,
    });

    res.status(201).json(product);
  } catch (err) {
    console.log("CREATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Create product failed" });
  }
});

/* ============================
   UPDATE PRODUCT (Admin Only)
   PUT /api/products/:id
=============================== */
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    product.name = req.body.name ?? product.name;
    product.price = req.body.price ?? product.price;
    product.category = req.body.category ?? product.category;
    product.description = req.body.description ?? product.description;
    product.image = req.body.image ?? product.image;
    product.stock = req.body.stock ?? product.stock;

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    console.log("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Update product failed" });
  }
});

/* ============================
   DELETE PRODUCT (Admin Only)
   DELETE /api/products/:id
=============================== */
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.log("DELETE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Delete product failed" });
  }
});

/* ============================
   CREATE REVIEW (Logged-in user)
   POST /api/products/:id/reviews
=============================== */
router.post("/:id/reviews", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    // Already reviewed?
    const already = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (already)
      return res.status(400).json({ message: "Already reviewed" });

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((a, r) => a + r.rating, 0) /
      product.reviews.length;

    await product.save();

    res.json({ message: "Review added" });
  } catch (err) {
    console.log("ADD REVIEW ERROR:", err);
    res.status(500).json({ message: "Failed to add review" });
  }
});

export default router;
