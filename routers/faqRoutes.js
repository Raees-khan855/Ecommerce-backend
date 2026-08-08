const express = require("express");
const router = express.Router();

const Faq = require("../models/Faq");
const authMiddleware = require("../middleware/auth");

// =========================
// GET ALL FAQS
// GET /api/faqs
// =========================
router.get("/", async (req, res) => {
  try {
    const faqs = await Faq.find().sort({
      order: 1,
      createdAt: -1,
    });

    res.status(200).json(faqs);
  } catch (err) {
    console.error("Get FAQs error:", err);
    res.status(500).json({
      message: err.message,
    });
  }
});

// =========================
// ADD FAQ
// POST /api/faqs
// =========================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { question, answer, active, order } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        message: "Question and answer are required.",
      });
    }

    const faq = await Faq.create({
      question: question.trim(),
      answer: answer.trim(),
      active: active !== false,
      order: Number(order) || 0,
    });

    res.status(201).json(faq);
  } catch (err) {
    console.error("Add FAQ error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// =========================
// UPDATE FAQ
// PUT /api/faqs/:id
// =========================
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { question, answer, active, order } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        message: "Question and answer are required.",
      });
    }

    const faq = await Faq.findByIdAndUpdate(
      req.params.id,
      {
        question: question.trim(),
        answer: answer.trim(),
        active: active !== false,
        order: Number(order) || 0,
      },
      {
        new: true,
        runValidators: true,
      }
    );

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

// =========================
// DELETE FAQ
// DELETE /api/faqs/:id
// =========================
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