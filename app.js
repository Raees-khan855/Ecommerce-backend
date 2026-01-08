const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routers/productRoutes");
const heroRoutes = require("./routers/heroRoutes");
const adminRoutes = require("./routers/admin");
const orderRoutes = require("./routers/orderRoutes");
const sendEmail = require("./utils/sendEmail");
const contactRoutes = require("./routers/contact");
const app = express();

/* ===========================
   CORS
=========================== */
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/* ===========================
   Body Parsers
=========================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===========================
   MongoDB (Vercel safe)
=========================== */
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

/* ===========================
   TEST EMAIL ROUTE
=========================== */
app.get("/test-email", async (req, res) => {
  try {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "✅ Test Email",
      html: "<h2>Email system is working 🎉</h2>",
    });

    res.send("✅ Email sent successfully");
  } catch (err) {
    console.error("❌ Email test failed:", err);
    res.status(500).send("Email failed");
  }
});

/* ===========================
   Routes
=========================== */
app.use("/admin", adminRoutes);
app.use("/products", productRoutes);
app.use("/hero", heroRoutes);
app.use("/orders", orderRoutes);
app.use("/contact", contactRoutes);
/* ===========================
   Health Check
=========================== */
app.get("/", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

module.exports = app;
