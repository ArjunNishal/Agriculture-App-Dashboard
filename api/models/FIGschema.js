const mongoose = require("mongoose");
const FIGDetails_schema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    leaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    Joinedmembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: Number,
      default: 1,
    },
    latitude: {
      type: String,
    },
    image: { type: String },
    longitude: {
      type: String,
    },
    fpo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FPO",
    },

    location: {
      type: String,
    },
    leaderBlocked: {
      type: Number,
      default: 0,
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FIG_message",
      },
    ],
    meetings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FIG_meeting",
      },
    ],
  },
  {
    timestamps: true,
  }
);
const FIG_Detail = mongoose.model("FIG_Detail", FIGDetails_schema);
module.exports = FIG_Detail;
