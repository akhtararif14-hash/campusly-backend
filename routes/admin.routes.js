import express from "express";
import { annauth as auth, authorize } from "../middleware/auth.js";

const router = express.Router();

// 👤 Get all users (admin only)
router.get("/users", auth, authorize("admin"), (req, res) => {
  res.json({
    message: "Admin can see all users",
  });
});

// ✅ Approve seller product (admin only)
router.put(
  "/approve-product/:id",
  auth,
  authorize("admin"),
  (req, res) => {
    res.json({
      message: "Product approved by admin",
    });
  }
);

export default router;