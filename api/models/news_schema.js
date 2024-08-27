const mongoose = require("mongoose");
const News_schema = new mongoose.Schema(
  {
    news_type: { type: String }, //FPO ,NGO ,FIG
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    thumbnail: { type: String },
    images: [
      {
        mediaType: { type: String },
        media: { type: String },
      },
    ],
    fpo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FPO",
    },
    title: { type: String },
    description: { type: String },
    postedBy: { type: String },
    postedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    newsGroup: { type: mongoose.Schema.Types.ObjectId, ref: "NewsGroup" },
    status: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
    reportedBy: [
      {
        reason: { type: String },
        _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    likeCount: { type: Number, default: 0 },
    likedBy: [],
  },
  {
    timestamps: true,
  }
);

News_schema.index({ createdAt: 1 }, { expireAfterSeconds: 432000 });

const News = mongoose.model("News", News_schema);
module.exports = News;
