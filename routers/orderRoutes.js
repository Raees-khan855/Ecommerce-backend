const express = require("express");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/auth");
const sendEmail = require("../utils/sendEmail"); // ✅ ADD THIS

const router = express.Router();

/* ================= CREATE ORDER (PUBLIC) ================= */
router.post("/", async (req, res) => {
  try {
    // 1️⃣ Create order
    const order = new Order({
      customerName: req.body.customerName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      products: req.body.products,
      totalAmount: req.body.totalAmount,
      status: "Pending",
    });

    // 2️⃣ Save order
    await order.save();

    // 3️⃣ Try sending email (DO NOT FAIL ORDER)
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: "🛒 New Order Received",
        html: `
          <h2>New Order on Your Store</h2>
          <p><strong>Name:</strong> ${order.customerName}</p>
          <p><strong>Email:</strong> ${order.email}</p>
          <p><strong>Phone:</strong> ${order.phone}</p>
          <p><strong>Address:</strong> ${order.address}</p>
          <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>

          <h3>Products:</h3>
          <ul>
            ${order.products
              .map(
                (p) =>
                  `<li>${p.title} × ${p.quantity} (₹${p.price})</li>`
              )
              .join("")}
          </ul>
        `,
      });
    } catch (emailErr) {
      console.error("❌ Email failed:", emailErr.message);
    }

    // 4️⃣ Always return success
    res.status(201).json(order);
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
});
    /* ===============================
       📧 EMAIL TO CUSTOMER
    =============================== */
    await sendEmail({
      to: order.email,
      subject: "✅ Order Placed Successfully",
      html: `
        <h2>Thank you for your order, ${order.customerName}!</h2>
        <p>Your order has been received successfully.</p>

        <h3>Order Summary</h3>
        <ul>
          ${order.products
            .map(
              (p) =>
                `<li>${p.title} × ${p.quantity}</li>`
            )
            .join("")}
        </ul>

        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
        <p>We will contact you once your order is confirmed.</p>

        <br />
        <p>— My Store Team ❤️</p>
      `,
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
