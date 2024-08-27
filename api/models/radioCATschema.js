const mongoose = require("mongoose");
const RadioCat_schema = new mongoose.Schema(
  {
    category: { type: String },
    image: { type: String },
    status: { type: Number, default: 1 }, // 1= Active , 0 = Inactive
    fpo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FPO",
    },
  },
  {
    timestamps: true,
  }
);
const RadioCat = mongoose.model("RadioCat", RadioCat_schema);
module.exports = RadioCat;
