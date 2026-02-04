const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")

// 👤 Get all users (admin only)
router.get("/users", auth, auth.authorize("admin"), (req, res) => {
  res.json({
    message: "Admin can see all users"
  })
})

// ✅ Approve seller product (admin only)
router.put("/approve-product/:id", auth, auth.authorize("admin"), (req, res) => {
  res.json({
    message: "Product approved by admin"
  })
})

module.exports = router
