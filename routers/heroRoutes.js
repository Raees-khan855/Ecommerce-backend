const express = require("express");
const Hero = require("../models/Hero");
const upload = require("../middleware/cloudinary");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// 🔹 GET HERO (public)
router.get("/", async (req, res) => {
  try {
    const hero = await Hero.findOne();
    res.json(hero);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 CREATE OR UPDATE HERO (admin only)
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, subtitle } = req.body;
    if (!title || !subtitle || !req.file) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    let hero = await Hero.findOne(); // only one hero document
    if (hero) {
      hero.title = title;
      hero.subtitle = subtitle;
      hero.image = req.file.path; // Cloudinary URL
    } else {
      hero = new Hero({ title, subtitle, image: req.file.path });
    }

    await hero.save();
    res.status(201).json(hero);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
