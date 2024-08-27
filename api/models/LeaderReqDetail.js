const mongoose = require("mongoose");
const leaderDetails_schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    status: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
    },
    fpo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FPO",
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //Ref to the member who requested
    },
    approved: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);
const leader_Req_Detail = mongoose.model(
  "leader_Req_Detail",
  leaderDetails_schema
);
module.exports = leader_Req_Detail;
