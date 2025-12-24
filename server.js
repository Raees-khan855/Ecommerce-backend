const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routers/productRoutes");
const heroRoutes = require("./routers/heroRoutes");
const adminRoutes = require("./routers/admin");

const app = express();

/* =======================
   CORS CONFIG (IMPORTANT)
======================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://ecommerce-website-nine-eta-72.vercel.app"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // ✅ VERY IMPORTANT: handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

/* =======================
   BODY PARSERS
======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =======================
   ROUTES
======================= */
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/hero", heroRoutes);

/* =======================
   MONGODB (SERVERLESS SAFE)
======================= */
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB error:", err);
  }
}

connectDB();

/* =======================
   EXPORT FOR VERCEL
======================= */
module.exports = app;
