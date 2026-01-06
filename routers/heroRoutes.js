const express = require("express");
const Hero = require("../models/Hero");
const upload = require("../middleware/cloudinary");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// GET HERO (PUBLIC)
router.get("/", async (req, res) => {
  try {
    const hero = await Hero.findOne();
    res.json(hero);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE / UPDATE HERO (ADMIN)
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, subtitle } = req.body;

    if (!title || !subtitle) {
      return res.status(400).json({ message: "Title & subtitle required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    const imageUrl = req.file.secure_url || req.file.path;

    let hero = await Hero.findOne();

    if (hero) {
      hero.title = title;
      hero.subtitle = subtitle;
      hero.image = imageUrl;
    } else {
      hero = new Hero({ title, subtitle, image: imageUrl });
    }

    await hero.save();
    res.status(201).json(hero);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
