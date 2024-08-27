const mongoose = require("mongoose");

const languageschema = new mongoose.Schema(
  {
    language: {
      type: String,
      required: true,
    },
    shortcode: {
      type: String,
    },
    file: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

const Language = mongoose.model("Language", languageschema);

module.exports = Language;
