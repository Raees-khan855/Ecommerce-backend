const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routers/productRoutes");
const heroRoutes = require("./routers/heroRoutes");
const adminRoutes = require("./routers/admin");

const app = express();

// ===========================
// CORS
// ===========================
const allowedOrigins = [
  "http://localhost:5173",
  "https://ecommerce-website-492ms53sc-raees-khan855s-projects.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
  })
);

// ===========================
// Body parsers
// ===========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===========================
// MongoDB (serverless-safe)
// ===========================
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB error:", err);
  }
};

// Ensure DB connection for every request
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ===========================
// Routes (NO /api prefix here ❗)
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
