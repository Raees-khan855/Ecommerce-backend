const express = require("express");
const router = express.Router();

const Faq = require("../models/Faq");
const authMiddleware = require("../middleware/auth");

// ========================================
// GET ALL FAQS
// GET /api/faqs
// ========================================
router.get("/", async (req, res) => {
  try {
    const faqs = await Faq.find()
      .populate("productId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json(faqs);
  } catch (err) {
    console.error("Get FAQs error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// ========================================
// GET FAQs FOR ONE PRODUCT
// GET /api/faqs/product/:productId
// ========================================
router.get("/product/:productId", async (req, res) => {
  try {
    const faq = await Faq.findOne({
      productId: req.params.productId,
    }).populate("productId", "title");

    if (!faq) {
      return res.status(200).json([]);
    }

    const activeFaqs = faq.faqs.filter(
      (item) => item.active !== false
    );

    res.status(200).json(activeFaqs);
  } catch (err) {
    console.error("Get product FAQs error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// ========================================
// ADD FAQ
// POST /api/faqs
// ========================================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { productId, faqs } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "Product is required.",
      });
    }

    if (!Array.isArray(faqs) || faqs.length === 0) {
      return res.status(400).json({
        message: "At least one question and answer is required.",
      });
    }

    if (faqs.length > 10) {
      return res.status(400).json({
        message: "Maximum 10 FAQs are allowed.",
      });
    }

    const cleanedFaqs = faqs
      .map((faq) => ({
        question: faq.question?.trim(),
        answer: faq.answer?.trim(),
        active: faq.active !== false,
      }))
      .filter((faq) => faq.question && faq.answer);

    if (cleanedFaqs.length === 0) {
      return res.status(400).json({
        message: "Question and answer are required.",
      });
    }

    // Check if FAQs already exist for this product
    const existingFaq = await Faq.findOne({ productId });

    if (existingFaq) {
      return res.status(400).json({
        message: "FAQs already exist for this product. Please edit them instead.",
      });
    }

    const faq = await Faq.create({
      productId,
      faqs: cleanedFaqs,
    });

    const populatedFaq = await faq.populate(
      "productId",
      "title"
    );

    res.status(201).json(populatedFaq);
  } catch (err) {
    console.error("Add FAQ error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// ========================================
// UPDATE FAQ
// PUT /api/faqs/:id
// ========================================
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { productId, faqs } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "Product is required.",
      });
    }

    if (!Array.isArray(faqs) || faqs.length === 0) {
      return res.status(400).json({
        message: "At least one question and answer is required.",
      });
    }

    if (faqs.length > 10) {
      return res.status(400).json({
        message: "Maximum 10 FAQs are allowed.",
      });
    }

    const cleanedFaqs = faqs
      .map((faq) => ({
        question: faq.question?.trim(),
        answer: faq.answer?.trim(),
        active: faq.active !== false,
      }))
      .filter((faq) => faq.question && faq.answer);

    if (cleanedFaqs.length === 0) {
      return res.status(400).json({
        message: "Question and answer are required.",
      });
    }

    const faq = await Faq.findByIdAndUpdate(
      req.params.id,
      {
        productId,
        faqs: cleanedFaqs,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("productId", "title");

    if (!faq) {
      return res.status(404).json({
        message: "FAQ not found.",
      });
    }

    res.status(200).json(faq);
  } catch (err) {
    console.error("Update FAQ error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// ========================================
// DELETE FAQ
// DELETE /api/faqs/:id
// ========================================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);

    if (!faq) {
      return res.status(404).json({
        message: "FAQ not found.",
      });
    }

    res.status(200).json({
      message: "FAQ deleted successfully.",
    });
  } catch (err) {
    console.error("Delete FAQ error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;