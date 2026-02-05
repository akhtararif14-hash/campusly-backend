import express from "express";
import path from "path";

import Product from "../models/Product.js";
import Order from "../models/Order.js";
import upload from "../middleware/upload.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ================= ADD PRODUCT (SELLER ONLY) =================
router.post(
  "/product",
  auth,
  auth.authorize("seller"),
  upload.single("image"),
  async (req, res) => {
    try {
      console.log("HEADERS:", req.headers["content-type"]);
      console.log("BODY RAW:", req.body);
      console.log("FILE RAW:", req.file);

      const { title, price } = req.body || {};

      if (!title || !price) {
        return res
          .status(400)
          .json({ message: "Title and price are required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Image is required" });
      }

      const numericPrice = Number(price);
      if (isNaN(numericPrice) || numericPrice < 0) {
        return res.status(400).json({ message: "Invalid price" });
      }

      const product = await Product.create({
        title: String(title).trim(),
        price: numericPrice,
        sellerId: req.user._id,
        sellerName: req.user.name || "",
        // ✅ IMPORTANT: store URL-friendly path
        image: `/uploads/${req.file.filename}`,
      });

      res.status(201).json(product);
    } catch (err) {
      console.error("ADD PRODUCT ERROR ❌", err);
      res
        .status(500)
        .json({ message: err.message || "Failed to add product" });
    }
  }
);

// ================= LIST PRODUCTS =================
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 });
    res.json(products);
  } catch (err) {
    console.error("FETCH PRODUCTS ERROR ❌", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// ================= SELLER ORDERS =================
router.get("/orders", auth, auth.authorize("seller"), async (req, res) => {
  try {
    const orders = await Order.find({ sellerId: req.user._id }).sort({
      _id: -1,
    });
    res.json(orders);
  } catch (err) {
    console.error("FETCH SELLER ORDERS ERROR ❌", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

export default router;
