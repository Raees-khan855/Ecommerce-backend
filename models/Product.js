const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      required: true,
    },

    // ✅ MULTIPLE IMAGES (1–5)
    images: {
      type: [String], // Cloudinary URLs
      required: true,
      validate: {
        validator: function (arr) {
          return arr.length >= 1 && arr.length <= 5;
        },
        message: "Product must have between 1 and 5 images",
      },
    },

    // OPTIONAL: main image shortcut (first image)
    mainImage: {
      type: String,
    },

    stock: {
      type: Number,
      default: 10,
    },

    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/* AUTO SET MAIN IMAGE */
productSchema.pre("save", function (next) {
  if (this.images && this.images.length > 0) {
    this.mainImage = this.images[0];
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
