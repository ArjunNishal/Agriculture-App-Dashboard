const mongoose = require("mongoose");

const contentCreatorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    fpo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FPO",
      required: true,
    },
    status: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      default: "contentcreator",
    },
  },
  { timestamps: true }
);

const ContentCreator = mongoose.model("ContentCreator", contentCreatorSchema);

module.exports = ContentCreator;
