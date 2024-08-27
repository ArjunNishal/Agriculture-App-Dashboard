const mongoose = require("mongoose");
const adminDetails_schema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    username: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
    },
    mobileno: {
      type: String,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
    },
    status: {
      type: Number,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    fpo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FPO",
    },
    permissions: {
      type: Array,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
const Admin = mongoose.model("Admin", adminDetails_schema);
module.exports = Admin;
