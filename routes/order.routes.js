import express from "express";
import jwt from "jsonwebtoken";

import Order from "../models/Order.js";

const router = express.Router();

// 🔐 AUTH MIDDLEWARE
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ decoded MUST contain _id
    if (!decoded._id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// 📦 CREATE ORDER
router.post("/", authMiddleware, async (req, res) => {
  try {
    console.log("ORDER ROUTE HIT ✅");
    console.log("USER:", req.user);
    console.log("BODY:", req.body);

    const { items, totalAmount } = req.body;

    // 🔴 BASIC VALIDATION
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items missing" });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    // 🔴 VALIDATE EACH ITEM
    for (const item of items) {
      if (!item.title || !item.price || !item.quantity || !item.sellerId) {
        return res.status(400).json({
          message: "Invalid item data in order",
        });
      }
    }

    // ✅ CREATE ORDER
    const order = await Order.create({
      user: req.user._id,
      items: items.map((item) => ({
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        sellerId: item.sellerId,
      })),
      totalAmount,
    });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.error("ORDER ERROR ❌", err);
    res.status(500).json({ message: "Order failed" });
  }
});

export default router;
