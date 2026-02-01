const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const upload = require("../middleware/cloudinary");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

/* ===========================
   GET ALL PRODUCTS + SEARCH
   Supports:
   ?category=
   ?search=
=========================== */
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
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
        mainImage: imageUrls[0],
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
=========================== */
router.put(
  "/:id",
  authMiddleware,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      /* ===== BASIC FIELDS ===== */
      product.title = req.body.title;
      product.price = Number(req.body.price);
      product.description = req.body.description;
      product.category = req.body.category;
      product.featured = String(req.body.featured) === "true";

      /* ===================================================
         CASE 1 — New files uploaded → replace images
      =================================================== */
      if (req.files && req.files.length > 0) {
        const imageUrls = req.files.map((file) => file.path);

        product.images = imageUrls;
        product.mainImage = imageUrls[0];
      }

      /* ===================================================
         CASE 2 — Only reorder existing images
      =================================================== */
      if (req.body.imageOrder) {
        const order = JSON.parse(req.body.imageOrder);

        // convert full URLs back to stored paths
        const cleaned = order.map((url) =>
          url.replace(process.env.BACKEND_URL + "/", "")
        );

        product.images = cleaned;
        product.mainImage = cleaned[0];
      }

      await product.save();

      res.json(product);
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
