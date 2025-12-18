require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const productRoutes = require("./routers/productRoutes.js");
const heroRoutes = require("./routers/heroRoutes.js");
const adminRoutes = require("./routers/admin.js"); // login
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads if needed
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/admin", adminRoutes);        // admin login
app.use("/api/products", productRoutes);   // public GET, admin POST/PUT/DELETE inside router
app.use("/api/hero", heroRoutes);          // public GET, admin POST inside router

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
