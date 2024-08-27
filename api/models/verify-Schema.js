const mongoose = require("mongoose");
const userverification_schema = new mongoose.Schema(
  {
    phone: {
      type: String,
    },
    userType: {
      type: String,
      default: "member",
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member_Detail",
    },
    status: {
      type: Number,
      default: 1,
    },
    firebaseToken: { type: String },
  },
  {
    timestamps: true,
  }
);
const User_verification = mongoose.model(
  "User_Verificaiton",
  userverification_schema
);
module.exports = User_verification;
