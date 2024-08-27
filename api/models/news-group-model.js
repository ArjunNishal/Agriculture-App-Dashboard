const mongoose = require("mongoose");
const NewsGroup_schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    description: {
      type: String,
    },
    groupName: { type: String },
    location: {
      type: String,
    },
    longitude: { type: String },
    latitude: { type: String },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //Ref to the member who requested
    },
    fpo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FPO",
    },
    status: {
      type: Number,
      default: 0,
    },
    approved: {
      type: Number,
      default: 0,
    },
    leaderBlocked: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);
const NewsGroup = mongoose.model("NewsGroup", NewsGroup_schema);
module.exports = NewsGroup;
