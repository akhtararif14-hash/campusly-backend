const express = require("express")
const cors = require("cors")
const path = require("path")
require("dotenv").config()

const connectDB = require("./config/db")

const authRoutes = require("./routes/auth.routes")
const sellerRoutes = require("./routes/seller.routes")
const orderRoutes = require("./routes/order.routes")
const userRoutes = require("./routes/user.routes")
const adminRoutes = require("./routes/admin.routes")

const app = express()

// ✅ CORS
app.use(cors({
  origin: true,
  credentials: true,
}))

// ✅ BODY PARSERS
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ✅ STATIC FILES (THIS LINE FIXES YOUR IMAGE ISSUE)
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
)

// ✅ ROUTES
app.use("/api/auth", authRoutes)
app.use("/api/seller", sellerRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/user", userRoutes)
app.use("/api/admin", adminRoutes)

// ✅ TEST ROUTE (OPTIONAL)
app.get("/", (req, res) => {
  res.send("Backend running 🚀")
})

// ❌ error handler LAST
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR ❌", err)
  res.status(500).json({ message: err.message || "Server error" })
})

// ✅ START SERVER
const PORT = process.env.PORT || 5000
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
