const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    email: { type: String},
    phone: { type: String, required: true }, // ✅ ADD THIS
    whatsapp: { type: String, required: true }, // ✅ ADD THIS
    address: { type: String, required: true },

    products: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        title: String,
        price: Number,
        quantity: Number,
        image: String, // ✅ Image stored here
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
