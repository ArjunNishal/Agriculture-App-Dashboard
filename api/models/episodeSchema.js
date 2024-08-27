const mongoose = require("mongoose");
const Episode_Record_Schema = new mongoose.Schema(
  {
    title: { type: String },
    image: { type: String },
    seasonEpisode: { type: String },
    season: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Season",
    },
    recording: { type: String },
    radioCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RadioCat",
    },
    radio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Radio_Record",
    },
    fpo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FPO",
    },
    status: { type: Number, default: 1 }, // 1= Active , 0 = Inactive
    duration: { type: Number, default: 0 },
    viewed: { type: Array },
  },
  {
    timestamps: true,
  }
);
const Episode = mongoose.model("Episode", Episode_Record_Schema);
module.exports = Episode;
