const mongoose = require("mongoose");

const faqItemSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    answer: {
      type: String,
      required: true,
      trim: true,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const faqSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    faqs: {
      type: [faqItemSchema],
      required: true,
      validate: {
        validator: function (value) {
          return value.length > 0 && value.length <= 10;
        },
        message: "You must have between 1 and 10 FAQs.",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Faq", faqSchema);