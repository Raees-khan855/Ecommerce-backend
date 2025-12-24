const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routers/productRoutes");
const heroRoutes = require("./routers/heroRoutes");
const adminRoutes = require("./routers/admin");

const app = express();

// ===========================
// ✅ CORS: allow local + deployed frontend
// ===========================
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://ecommerce-website-492ms53sc-raees-khan855s-projects.vercel.app" // production
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow server-to-server or Postman
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ===========================
// Body parsers
// ===========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===========================
// Routes
// ===========================
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/hero", heroRoutes);

// ===========================
// MongoDB connection (serverless safe)
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

connectDB();

// ===========================
// Export for Vercel
// ===========================
module.exports = app;
