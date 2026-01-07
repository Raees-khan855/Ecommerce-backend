const express = require("express");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

/* ================= CREATE ORDER (PUBLIC) ================= */
router.post("/", async (req, res) => {
  try {
    const order = new Order({
      customerName: req.body.customerName,
      address: req.body.address,
      products: req.body.products,
      totalAmount: req.body.totalAmount,
      status: "Pending",
      email: req.body.email,
      phone: req.body.phone,
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: "Failed to create order" });
  }
});

/* ================= GET ALL ORDERS (ADMIN) ================= */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/* ================= CONFIRM ORDER (ADMIN) ================= */
router.put("/:id/confirm", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "Confirmed" },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch {
    res.status(500).json({ message: "Confirm failed" });
  }
});

/* ================= DELETE ORDER (ADMIN) ================= */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.deleteOne();
    res.json({ message: "Order deleted successfully" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
