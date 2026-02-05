import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Product from "../models/Product.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// 👤 USER: GET ALL PRODUCTS
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("FETCH PRODUCTS ERROR ❌", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// 🔐 Get profile
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("GET PROFILE ERROR ❌", err);
    res.status(500).json({ message: "Failed to get profile" });
  }
});

// ✏️ Update profile
router.put("/me", auth, async (req, res) => {
  try {
    const { name, username, description } = req.body;

    const update = {};
    if (name !== undefined) update.name = name;
    if (username !== undefined) update.username = username;
    if (description !== undefined) update.description = description;

    if (username) {
      const exists = await User.findOne({
        username,
        _id: { $ne: req.user._id },
      });
      if (exists) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      update,
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.error("UPDATE PROFILE ERROR ❌", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// 🔒 Change password
router.put("/me/password", auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old and new password are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(oldPassword, user.password || "");
    if (!match) {
      return res
        .status(401)
        .json({ message: "Old password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated" });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR ❌", err);
    res.status(500).json({ message: "Failed to change password" });
  }
});

// 🔁 Change role (user ↔ seller)
router.put("/me/role", auth, async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !["user", "seller"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!process.env.JWT_SECRET) {
      console.warn("JWT_SECRET not set");
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({ token, user: safeUser });
  } catch (err) {
    console.error("CHANGE ROLE ERROR ❌", err);
    res.status(500).json({ message: "Failed to change role" });
  }
});

export default router;
