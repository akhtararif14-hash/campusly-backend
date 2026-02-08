import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

/* ===========================
   🔵 GOOGLE LOGIN START
   =========================== */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

/* ===========================
   🔵 GOOGLE CALLBACK
   =========================== */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  (req, res) => {
    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // redirect to frontend with token
    res.redirect(
      `${process.env.FRONTEND_URL}/login?token=${token}`
    );
  }
);

export default router;
