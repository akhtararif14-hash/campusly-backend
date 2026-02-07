import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router(); // ✅ MUST BE HERE

/* ===========================
   🟢 GOOGLE AUTH START
   =========================== */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

/* ===========================
   🟢 GOOGLE CALLBACK
   =========================== */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  async (req, res) => {
    try {
      const user = req.user;

      const token = jwt.sign(
        {
          _id: user._id,
          role: user.role,
          name: user.name,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // 🔁 redirect back to frontend with token
      res.redirect(
        `${process.env.FRONTEND_URL}/oauth-success?token=${token}`
      );
    } catch (err) {
      console.error("GOOGLE CALLBACK ERROR ❌", err);
      res.redirect(`${process.env.FRONTEND_URL}/login`);
    }
  }
);

/* ===========================
   📝 REGISTER (SIGNUP)
   =========================== */
router.post("/register", async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    email = email.toLowerCase().trim();

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "user",
    });

    const token = jwt.sign(
      { _id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR ❌", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

/* ===========================
   🔐 LOGIN (STRICT)
   =========================== */
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR ❌", err);
    res.status(500).json({ message: "Login failed" });
  }
});

export default router;

