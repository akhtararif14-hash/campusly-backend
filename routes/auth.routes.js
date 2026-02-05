import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/User.js";

const router = express.Router();

// 🔐 LOGIN ROUTE (supports password or email-only magic login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN ATTEMPT 🔐", { email, hasPassword: !!password });

    let user = await User.findOne({ email });

    if (password) {
      // Normal password-based login
      if (!user) {
        // Auto-register user when password provided on first login
        const hashed = await bcrypt.hash(password, 10);
        user = new User({
          name: email.split("@")[0],
          email,
          password: hashed,
          role: "user",
        });
        await user.save();
        console.log("AUTO-REGISTER: created user via login", {
          email,
          userId: user._id,
        });
      } else {
        const match = await bcrypt.compare(password, user.password || "");
        if (!match) {
          console.log("LOGIN: bad password", { email });
          return res.status(401).json({ message: "Invalid credentials" });
        }
      }
    } else {
      // Email-only (magic) login
      if (!user) {
        const hashed = await bcrypt.hash(
          Math.random().toString(36).slice(2),
          10
        );
        user = new User({
          name: email.split("@")[0],
          email,
          password: hashed,
          role: "user",
        });
        await user.save();
        console.log("MAGIC LOGIN: created user", {
          email,
          userId: user._id,
        });
      } else {
        console.log("MAGIC LOGIN: existing user", {
          email,
          userId: user._id,
        });
      }
    }

    if (!process.env.JWT_SECRET) {
      console.warn("WARNING: JWT_SECRET is not set");
    }

    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR ❌", err);
    res.status(500).json({ message: "Login failed" });
  }
});

// ✅ REGISTER ROUTE
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, adminSecret } = req.body;

    console.log("REGISTER ATTEMPT 📝", { email, role });

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    if (role === "admin") {
      if (adminSecret !== process.env.ADMIN_SECRET) {
        return res
          .status(403)
          .json({ message: "Admin secret required or invalid" });
      }

      const admins = await User.countDocuments({ role: "admin" });
      if (admins >= 3) {
        return res
          .status(400)
          .json({ message: "Admin limit reached (3)" });
      }
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    await user.save();

    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR ❌", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

export default router;
