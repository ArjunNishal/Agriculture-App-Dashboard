const mongoose = require("mongoose");
const queryschema = new mongoose.Schema(
  {
    name: { type: String },
    message: { type: String },
    phone: { type: String },
    member: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fpo: { type: mongoose.Schema.Types.ObjectId, ref: "FPO" },
    status: { type: Number, default: 1 }, //1=Active  0=Resolved
  },
  {
    timestamps: true,
  }
);
const Query = mongoose.model("Query", queryschema);
module.exports = Query;
