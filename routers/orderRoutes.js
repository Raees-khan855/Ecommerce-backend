const express = require("express");
const Order = require("../models/Order.js");
const authMiddleware = require("../middleware/auth.js");

const router = express.Router();

/* CREATE ORDER (FROM CHECKOUT) */
router.post("/", async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json(err);
  }
});

/* GET ALL ORDERS (ADMIN) */
router.get("/", authMiddleware, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

/* UPDATE STATUS */
router.put("/:id", authMiddleware, async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, {
    status: req.body.status,
  });
  res.json({ message: "Order updated" });
});
    
module. exports = router;
