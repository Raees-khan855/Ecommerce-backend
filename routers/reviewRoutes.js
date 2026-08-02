console.log("✅ reviewRoutes.js loaded");
const express = require("express");
const router = express.Router();

const Review = require("../models/Review");
const Product = require("../models/Product");

const upload = require("../middleware/cloudinary");
const authMiddleware = require("../middleware/auth");

// GET reviews for a product
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId,
    }).sort({ createdAt: -1 });

    res.json(reviews);
  } 
  catch (err) {
    console.error("Review Error:", err);
  
    res.status(500).json({
      message: err.message,
      stack: err.stack,
    });
  }
});
// CREATE review
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        productId,
        customerName,
        rating,
        comment,
        verified,
      } = req.body;

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      const review = new Review({
        productId,
        customerName,
        rating: Number(rating),
        comment,
        verified: verified === "true",
        image: req.file ? req.file.path : "",
      });

      await review.save();

      res.status(201).json(review);
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  }
);

// DELETE review
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    res.json({
      message: "Review deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;