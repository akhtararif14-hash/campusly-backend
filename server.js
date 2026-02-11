import dotenv from "dotenv";
dotenv.config(); // ✅ FIRST

import express from "express";
import cors from "cors";

import passport from "./config/passport.js";
import connectDB from "./config/db.js";

// routes
import authRoutes from "./routes/auth.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import orderRoutes from "./routes/order.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

import cors from 'cors';

const allowedOrigins = [
  'https://campusly-frontend-eight.vercel.app',  // Production
  'http://localhost:5173',                        // Local dev
  'http://localhost:5174',                        // Alternative port
  'http://127.0.0.1:5173',                       // Alternative localhost
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Only initialize passport, NO session
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
});