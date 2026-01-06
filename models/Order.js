 const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerName: String,
    email: String,
    address: String,
    products: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        title: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    totalAmount: Number,
    status: {
      type: String,
      default: "Pending", // Pending | Shipped | Delivered
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
