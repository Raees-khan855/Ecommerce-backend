const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    whatsapp: { type: String, required: true },
    address: { type: String, required: true },

    products: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        title: String,
        price: Number,
        quantity: Number,
        image: String, // image of selected product
        selectedColor: String, // ✅ color selected by customer
        selectedSize: String,  // ✅ size selected by customer
      },
    ],

    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
