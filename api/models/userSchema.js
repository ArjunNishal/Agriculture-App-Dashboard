const mongoose = require("mongoose");
const { type } = require("os");
//user , leader , news admin all comes under this schema by defined roles
const userDetails_schema = new mongoose.Schema(
  {
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    phone: {
      type: String,
    },
    language: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Language",
    },
    profileImage: {
      type: String,
    },
    fpo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FPO",
    },
    user_verification_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User_Verificaiton",
    },
    status: {
      type: Number,
      default: 1, //active
    },
    location: {
      type: String,
    },
    jwtToken: {
      type: String,
    },
    FIGOwned: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FIG_Detail", //if leader
      },
    ],
    figPopup: { type: Number, default: 0 }, //To show popup when verifed as leader
    NgPopup: { type: Number, default: 0 },
    joinedFIG: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FIG_Detail", //if member
      },
    ],
    newsGroup: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewsGroup",
      },
    ],
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roles",
    },
    // 0 for not applied, 1 for appllied
    appliedLeader: { type: Number, default: 0 },
    Creator: { type: Number, default: 0 },
    Leader: { type: Number, default: 0 },
    creatorRequest: { type: Number, default: 0 },
    leaderRequest: { type: Number, default: 0 },
    otpVerified: { type: Number, default: 0 },
    appliedNewsGroup: { type: Number, default: 0 },
    otp: { type: Number, default: 0 },
    firebaseToken: { type: String },
    surveyResponses: [
      {
        survey: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Survey",
        },
        response: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Response",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userDetails_schema);
module.exports = User;
