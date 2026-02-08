import express from "express";
import passport from "../config/passport.js"; // ✅ Add correct path to passport config
import jwt from "jsonwebtoken";

const router = express.Router();

/* ===========================
   🔵 GOOGLE LOGIN START
   =========================== */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account", // 👈 avoids cached Google issues
  })
);

/* ===========================
   🔵 GOOGLE CALLBACK
   =========================== */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`, // ✅ Better error message
  }),
  async (req, res) => {
    try {
      if (!req.user) {
        console.error("❌ Google callback: req.user missing");
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
        );
      }

      const token = jwt.sign(
        {
          _id: req.user._id,
          role: req.user.role,
          name: req.user.name,
          email: req.user.email, // ✅ Add email to JWT payload
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // ✅ SUCCESS → send token to frontend
      res.redirect(
        `${process.env.FRONTEND_URL}/login?token=${token}`
      );
    } catch (err) {
      console.error("GOOGLE CALLBACK ERROR ❌", err);
      res.redirect(
        `${process.env.FRONTEND_URL}/login?error=server_error`
      );
    }
  }
);

export default router;