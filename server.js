import dotenv from "dotenv";
dotenv.config({ path: "./.env" });  // ✅ MUST BE FIRST
console.log("ENV FILE CHECK:", {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
});


import express from "express";
import cors from "cors";
import path from "path";
import session from "express-session";
import passport from "passport";
import { fileURLToPath } from "url";

// 🔐 PASSPORT CONFIG (after dotenv)
import "./config/passport.js";

// ROUTES
import authRoutes from "./routes/auth.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import orderRoutes from "./routes/order.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";

// DB
import connectDB from "./config/db.js";

// 🔧 FIX __dirname FOR ES MODULES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// ✅ BODY PARSERS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ SESSION (MUST BE BEFORE PASSPORT)
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
)

app.use(passport.initialize())
app.use(passport.session())

app.use("/api/auth", authRoutes)

// ✅ STATIC FILES (if still using local uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ ROUTES

app.use("/api/seller", sellerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// ❌ ERROR HANDLER (LAST)
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR ❌", err);
  res.status(500).json({
    message: err.message || "Server error",
  });
});

// ✅ START SERVER
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("GOOGLE_CLIENT_ID =", process.env.GOOGLE_CLIENT_ID);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed ❌", err.message);
  });
