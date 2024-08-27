const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    globalsurvey: {
      type: Boolean,
      default: false,
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        questionType: {
          type: String,
          default: "singlechoice",
        },
        options: [String],
      },
    ],
    fpo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FPO",
    },
    responses: {
      type: Number,
    },
    submittedby: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    figRes: [{ type: String }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Survey = mongoose.model("Survey", surveySchema);
module.exports = Survey;
