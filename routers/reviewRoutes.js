console.log("✅ reviewRoutes.js loaded");

const express = require("express");
const router = express.Router();

const Review = require("../models/Review");
const Product = require("../models/Product");

const upload = require("../middleware/cloudinary");
const authMiddleware = require("../middleware/auth");

/* ===================================
   GET ALL REVIEWS (Admin)
=================================== */
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("productId", "title")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message,
    });
  }
});

/* ===================================
   GET REVIEWS OF SINGLE PRODUCT
=================================== */
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId,
    }).sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
});

/* ===================================
   CREATE REVIEW
=================================== */
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
      console.error(err);

      res.status(500).json({
        message: err.message,
      });
    }
  }
);

/* ===================================
   UPDATE REVIEW
=================================== */
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const review = await Review.findById(req.params.id);

      if (!review) {
        return res.status(404).json({
          message: "Review not found",
        });
      }

      review.productId = req.body.productId || review.productId;
      review.customerName =
        req.body.customerName || review.customerName;
      review.rating = Number(req.body.rating || review.rating);
      review.comment = req.body.comment || review.comment;
      review.verified =
        req.body.verified === "true"
          ? true
          : req.body.verified === "false"
          ? false
          : review.verified;

      if (req.file) {
        review.image = req.file.path;
      }

      await review.save();

      res.json(review);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: err.message,
      });
    }
  }
);

/* ===================================
   DELETE REVIEW
=================================== */
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
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;