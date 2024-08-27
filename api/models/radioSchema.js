const mongoose = require("mongoose");
const Radio_Record_Schema = new mongoose.Schema(
  {
    heading: { type: String },
    image: { type: String },
    host: { type: String },
    radioCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RadioCat",
    },
    fpo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FPO",
    },
    status: { type: Number, default: 1 }, // 1= Active , 0 = Inactive
  },
  {
    timestamps: true,
  }
);
const Radio_Record = mongoose.model("Radio_Record", Radio_Record_Schema);
module.exports = Radio_Record;
