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
    },
    
    compareAtPrice: {
      type: Number,
      default: null,
    },

    // Always store category consistently
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    images: {
      type: [String],
      required: true,
      validate: (v) => v.length >= 1 && v.length <= 5,
    },

    mainImage: String,

    colors: {
      type: [String],
      default: [],
    },

    sizes: {
      type: [String],
      default: [],
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
  {
    timestamps: true,
  }
);

// Keep mainImage as first image
productSchema.pre("save", function (next) {
  if (this.images?.length) {
    this.mainImage = this.images[0];
  }

  next();
});

module.exports = mongoose.model("Product", productSchema);