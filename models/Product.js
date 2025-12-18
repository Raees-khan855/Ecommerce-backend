// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    image: { type: String, required: true },
    stock: { type: Number, default: 10 },
    featured: { type: Boolean, default: false }, // ✅ new field
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
