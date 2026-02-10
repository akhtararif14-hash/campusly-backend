import express from "express";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import upload from "../middleware/upload.js";
import { annauth as protect, authorize } from "../middleware/auth.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/* ===========================
   🗑️ DELETE PRODUCT
   =========================== */
router.delete(
  "/product/:id",
  protect, // ✅ Fixed
  authorize("seller", "admin"), // ✅ Fixed
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // ensure seller owns the product
      if (product.sellerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not allowed" });
      }

      // delete image file
      if (product.image) {
        // product.image = "/uploads/products/xxx.jpg"
        const imagePath = path.join(
          __dirname,
          "..",
          product.image.replace(/^\/+/, "") // remove leading slash
        );

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await product.deleteOne();

      res.json({ message: "Product deleted successfully" });
    } catch (err) {
      console.error("DELETE PRODUCT ERROR ❌", err);
      res.status(500).json({ message: "Failed to delete product" });
    }
  }
);

/* ===========================
   ➕ ADD PRODUCT (SELLER ONLY)
   =========================== */
router.post(
  "/product",
  protect,
  authorize("seller", "admin"),
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, price } = req.body;

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
        image: req.file.path
      });

      res.status(201).json(product);
    } catch (err) {
      console.error("ADD PRODUCT ERROR ❌", err);
      console.error("ERROR DETAILS:", JSON.stringify(err, null, 2)); // ✅ Added this
      console.error("ERROR MESSAGE:", err.message); // ✅ Added this
      console.error("ERROR STACK:", err.stack); // ✅ Added this
      res
        .status(500)
        .json({ message: err.message || "Failed to add product" });
    }
  }
);

/* ===========================
   📦 LIST PRODUCTS
   =========================== */
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 });
    res.json(products);
  } catch (err) {
    console.error("FETCH PRODUCTS ERROR ❌", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

/* ===========================
   📬 SELLER ORDERS
   =========================== */
router.get(
  "/orders",
  protect, // ✅ Fixed
  authorize("seller", "admin"), // ✅ Fixed
  async (req, res) => {
    try {
      const orders = await Order.find({
        "items.sellerId": req.user._id,
      }).sort({ _id: -1 });

      res.json(orders);
    } catch (err) {
      console.error("FETCH SELLER ORDERS ERROR ❌", err);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  }
);

export default router;