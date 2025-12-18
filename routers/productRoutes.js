const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const upload = require("../middleware/cloudinary");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// 🔹 GET ALL PRODUCTS (public)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 GET FEATURED PRODUCTS (public)
router.get("/featured/all", async (req, res) => {
  try {
    const products = await Product.find({ featured: true });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 GET SINGLE PRODUCT + RELATED (public)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const related = await Product.find({
      category: product.category,
      _id: { $ne: id },
    })
      .limit(4)
      .select("title price image category");

    res.json({ product, related });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 CREATE PRODUCT (admin only)
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, price, description, category, featured } = req.body;
    if (!title || !price || !description || !category || !req.file) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const product = new Product({
      title,
      price,
      description,
      category,
      image: req.file.path, // Cloudinary URL
      featured: featured === "true" || featured === true,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 UPDATE PRODUCT (admin only)
router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, price, description, category } = req.body;
    const updateData = { title, price, description, category };

    if (req.file) updateData.image = req.file.path;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });

    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 DELETE PRODUCT (admin only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
