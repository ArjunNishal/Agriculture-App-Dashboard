const mongoose = require("mongoose");
const seasonSchema = new mongoose.Schema(
  {
    season: { type: String },
    image: { type: String },
    status: { type: Number, default: 1 },
    fpo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FPO",
    },
    radio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Radio_Record",
    },
    radioCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RadioCat",
    },
  },
  {
    timestamps: true,
  }
);
const Season = mongoose.model("Season", seasonSchema);
module.exports = Season;
