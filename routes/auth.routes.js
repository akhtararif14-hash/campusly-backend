import express from "express";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "https://campusly-frontend-eight.vercel.app";

/* ===========================
   🔵 GOOGLE LOGIN START
   =========================== */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

/* ===========================
   🔵 GOOGLE CALLBACK
   =========================== */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${FRONTEND_URL}/login?error=google_auth_failed`,
  }),
  async (req, res) => {
    try {
      if (!req.user) {
        console.error("❌ Google callback: req.user missing");
        return res.redirect(
          `${FRONTEND_URL}/login?error=google_auth_failed`
        );
      }

      const token = jwt.sign(
        {
          _id: req.user._id,
          role: req.user.role,
          name: req.user.name,
          email: req.user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // ✅ SUCCESS → send token to frontend
      res.redirect(
        `${FRONTEND_URL}/login?token=${token}`
      );
    } catch (err) {
      console.error("GOOGLE CALLBACK ERROR ❌", err);
      res.redirect(
        `${FRONTEND_URL}/login?error=server_error`
      );
    }
  }
);

export default router;