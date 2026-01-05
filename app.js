const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routers/productRoutes");
const heroRoutes = require("./routers/heroRoutes");
const adminRoutes = require("./routers/admin");

const app = express();

// ===========================
// ✅ CORS (FIXED – ALLOW ALL)
// ===========================
app.use(
  cors({
    origin: true, // allow all origins
    credentials: true,
  })
);

// ===========================
// Body parsers
// ===========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===========================
// MongoDB (Vercel safe)
// ===========================
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI)
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  console.log("✅ MongoDB connected");
  return cached.conn;
}

// Connect DB per request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("❌ MongoDB connection failed", err);
    res.status(500).json({ message: "Database connection error" });
  }
});

// ===========================
// Routes (NO /api prefix)
// ===========================
app.use("/admin", adminRoutes);
app.use("/products", productRoutes);
app.use("/hero", heroRoutes);

// ===========================
// Health check
// ===========================
app.get("/", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

module.exports = app;
