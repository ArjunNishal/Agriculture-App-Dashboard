const mongoose = require("mongoose");
const Notification_schema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    image: { type: String },

    createdby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    fpo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FPO",
    },
    status: {
      type: Number,
      default: 0,
    },
    allfpos: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
const Notification = mongoose.model("Notification", Notification_schema);
module.exports = Notification;
