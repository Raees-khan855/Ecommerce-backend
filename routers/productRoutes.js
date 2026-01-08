const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const upload = require("../middleware/cloudinary");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

/* ===========================
   GET ALL PRODUCTS (PUBLIC)
   Supports: ?category=
=========================== */
router.get("/", async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ===========================
   GET FEATURED PRODUCTS
=========================== */
router.get("/featured/all", async (req, res) => {
  const products = await Product.find({ featured: true })
    .limit(8)
    .select("title price images mainImage category");
  res.json(products);
});

/* ===========================
   GET SINGLE PRODUCT + RELATED
=========================== */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .limit(4)
      .select("title price images mainImage category");

    res.json({ product, related });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ===========================
   CREATE PRODUCT (ADMIN)
   Supports 1–5 images
=========================== */
router.post(
  "/",
  authMiddleware,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { title, price, description, category, featured } = req.body;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "At least one image required" });
      }

      const imageUrls = req.files.map((f) => f.path);

      const product = new Product({
        title,
        price: Number(price),
        description,
        category,
        images: imageUrls,
        featured: featured === "true",
      });

      await product.save();
      res.status(201).json(product);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);


/* ===========================
   UPDATE PRODUCT (ADMIN)
   Optional new images
=========================== */
router.put(
  "/:id",
  authMiddleware,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const updateData = {
        title: req.body.title,
        price: Number(req.body.price),
        description: req.body.description,
        category: req.body.category,
        featured: String(req.body.featured) === "true",
      };

      if (req.files && req.files.length > 0) {
        const imageUrls = req.files.map((file) => file.path);
        updateData.images = imageUrls;
        updateData.mainImage = imageUrls[0];
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(updatedProduct);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/* ===========================
   DELETE PRODUCT (ADMIN)
=========================== */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
