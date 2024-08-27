const mongoose = require("mongoose");

const leadercumcreator = new mongoose.Schema(
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
      default: "LeaderandCreator",
    },
  },
  { timestamps: true }
);

const LeaderandCreator = mongoose.model("LeaderandCreator", leadercumcreator);

module.exports = LeaderandCreator;
