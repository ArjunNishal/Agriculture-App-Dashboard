const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema(
  {
    submittedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    filledfor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    surveyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Survey",
    },
    response: [
      {
        question: {
          id: { type: String },
          question: { type: String },
        },
        answer: [
          {
            qid: { type: String },
            answer: { type: String },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const Response = mongoose.model("Response", responseSchema);

module.exports = Response;
