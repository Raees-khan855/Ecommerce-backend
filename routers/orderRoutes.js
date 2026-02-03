const express = require("express");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/auth");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

/* ================= CUSTOMER EMAIL TEMPLATE ================= */
const customerConfirmTemplate = (order) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.1);">
<tr><td style="background:#000;padding:20px;text-align:center;">
<h1 style="color:#ffffff;margin:0;">RaeesProduct</h1>
</td></tr>
<tr><td style="padding:20px;text-align:center;">
<h2 style="color:#28a745;margin-bottom:5px;">✅ Order Confirmed</h2>
<p style="color:#555;">Thank you for shopping with RaeesProduct</p>
</td></tr>
<tr><td style="padding:20px;color:#333;">
<p>Hello <strong>${order.customerName}</strong>,</p>
<p>Your order has been <strong style="color:#28a745;">confirmed</strong>.</p>
<h3 style="margin-top:25px;">📦 Order Items</h3>
<table width="100%" cellpadding="10" cellspacing="0" style="border-collapse:collapse;">
${order.products.map(p => `
<tr style="border-bottom:1px solid #eee;">
<td width="90">
  <img src="${p.image}" width="70" height="70" style="object-fit:cover;border-radius:6px;display:block;" />
</td>
<td>
  <strong>${p.title}</strong><br/>Qty: ${p.quantity}
</td>
<td align="right">
  Rs.${p.price}
</td>
</tr>`).join("")}
</table>
<p style="margin-top:15px;"><strong>Total Amount:</strong>
<span style="color:#28a745;"> Rs.${order.totalAmount}</span></p>
<p><strong>Delivery Address:</strong><br/>${order.address}</p>
<p style="margin-top:20px;">🚚 Your order is being prepared and will be shipped soon.</p>
<p style="margin-top:25px;">Thank you for choosing <strong>RaeesProduct</strong> ❤️</p>
</td></tr>
<tr><td style="background:#f1f1f1;padding:15px;text-align:center;font-size:12px;">
© ${new Date().getFullYear()} RaeesProduct. All rights reserved.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
`;

/* ================= CREATE ORDER (PUBLIC) ================= */
router.post("/", async (req, res) => {
  try {
    const {
      customerName,
      email,
      phone,
      whatsapp,
      address,
      products,
      totalAmount,
    } = req.body;

    if (
      !customerName ||
      !phone ||
      !whatsapp ||
      !address ||
      !products ||
      !Array.isArray(products) ||
      products.length === 0 ||
      !totalAmount
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields or cart empty",
      });
    }

    // ✅ FIXED — map correctly
    const validatedProducts = products.map((p) => ({
      productId: p.productId,
      title: p.title,
      price: p.price,
      quantity: p.quantity,
      image: p.image,

      // 🔥 MUST MATCH schema
      selectedColor: p.selectedColor || "",
      selectedSize: p.selectedSize || "",
    }));

    const order = new Order({
      customerName,
      email: email || "",
      phone,
      whatsapp,
      address,
      products: validatedProducts,
      totalAmount,
      status: "Pending",
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Order creation failed" });
  }
});



/* ================= GET ALL ORDERS (ADMIN) ================= */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ Fetch orders failed:", err);
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
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.email) {
      try {
        await sendEmail({
          to: order.email,
          subject: "✅ Your Order is Confirmed",
          html: customerConfirmTemplate(order),
        });
      } catch (emailErr) {
        console.error("❌ Email failed:", emailErr.message);
        return res.status(500).json({
          success: false,
          message: "Order confirmed but email failed",
          emailError: emailErr.message,
          order,
        });
      }
    }

    res.json({
      success: true,
      message: "Order confirmed successfully",
      order,
    });

  } catch (err) {
    console.error("❌ Confirm failed:", err);
    res.status(500).json({ message: "Confirm failed" });
  }
});

/* ================= DELETE ORDER (ADMIN) ================= */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await order.deleteOne();
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    console.error("❌ Delete failed:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
