const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },

    images: {
      type: [String],
      required: true,
      validate: v => v.length >= 1 && v.length <= 5,
    },
    mainImage: String,

    // NEW: colors & sizes
    colors: {
      type: [String],   // array of color names or codes (e.g., ["Red", "Blue"])
      default: [],
    },
    sizes: {
      type: [String],   // array of sizes (e.g., ["S", "M", "L", "XL", "10"])
      default: [],
    },

    stock: { type: Number, default: 10 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Keep mainImage as first image
productSchema.pre("save", function (next) {
  if (this.images?.length) this.mainImage = this.images[0];
  next();
});

module.exports = mongoose.model("Product", productSchema);
