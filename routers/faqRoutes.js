const express = require("express");
const router = express.Router();

const Faq = require("../models/Faq");
const authMiddleware = require("../middleware/auth");

/* ==========================
   GET ALL FAQS
========================== */

router.get("/", async (req, res) => {
  try {
    const faqs = await Faq.find().sort({
      order: 1,
      createdAt: -1,
    });

    res.json(faqs);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;