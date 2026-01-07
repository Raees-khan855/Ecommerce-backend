const express = require("express");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/auth");
const sendEmail = require("../utils/sendEmail");

const customerConfirmTemplate = (order) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
</head>
<body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,.1);">

          <!-- HEADER -->
          <tr>
            <td style="background:#28a745; padding:20px; color:#ffffff; text-align:center;">
              <h1 style="margin:0;">✅ Order Confirmed</h1>
              <p style="margin:5px 0 0;">Thank you for shopping with us</p>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding:20px; color:#333;">
              <p>Hello <strong>${order.customerName}</strong>,</p>

              <p>
                🎉 Your order has been successfully
                <strong style="color:#28a745;">confirmed</strong>.
              </p>

              <h3>📦 Order Summary</h3>

              <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
                <tr style="background:#f1f1f1;">
                  <th align="left">Product</th>
                  <th align="center">Qty</th>
                </tr>

                ${order.products
                  .map(
                    (p) => `
                  <tr>
                    <td>${p.title}</td>
                    <td align="center">${p.quantity}</td>
                  </tr>`
                  )
                  .join("")}
              </table>

              <p style="margin-top:15px;">
                <strong>Total Amount:</strong>
                <span style="color:#28a745;">₹${order.totalAmount}</span>
              </p>

              <p>
                <strong>Delivery Address:</strong><br/>
                ${order.address}
              </p>

              <p style="margin-top:20px;">
                🚚 Your order is being prepared and will be shipped soon.
              </p>

              <p>
                Thank you for choosing <strong>My Store</strong> ❤️
              </p>

              <p style="margin-top:30px;">
                Regards,<br/>
                <strong>My Store Team</strong>
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f1f1f1; padding:10px; text-align:center; font-size:12px;">
              © ${new Date().getFullYear()} My Store. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;


const router = express.Router();

/* ================= CREATE ORDER (PUBLIC) ================= */
router.post("/", async (req, res) => {
  try {
    const order = new Order({
      customerName: req.body.customerName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      products: req.body.products,
      totalAmount: req.body.totalAmount,
      status: "Pending",
    });

    await order.save();

    // 📧 ADMIN EMAIL
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: "🛒 New Order Received",
        html: `
          <h2>New Order Received</h2>
          <p><b>Name:</b> ${order.customerName}</p>
          <p><b>Email:</b> ${order.email}</p>
          <p><b>Phone:</b> ${order.phone}</p>
          <p><b>Total:</b> ₹${order.totalAmount}</p>
        `,
      });
    } catch (err) {
      console.error("Admin email failed:", err.message);
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Order creation failed" });
  }
});

/* ================= GET ALL ORDERS ================= */
router.get("/", authMiddleware, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

/* ================= CONFIRM ORDER ================= */
router.put("/:id/confirm", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "Confirmed" },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    // 📧 CUSTOMER EMAIL (BEAUTIFUL TEMPLATE)
    try {
      await sendEmail({
        to: order.email,
        subject: "✅ Your Order is Confirmed",
        html: customerConfirmTemplate(order),
      });
    } catch (err) {
      console.error("Customer email failed:", err.message);
    }

    res.json(order);
  } catch {
    res.status(500).json({ message: "Confirm failed" });
  }
});

/* ================= DELETE ORDER ================= */
router.delete("/:id", authMiddleware, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  await order.deleteOne();
  res.json({ message: "Order deleted" });
});

module.exports = router;
