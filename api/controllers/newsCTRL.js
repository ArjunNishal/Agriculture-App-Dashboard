const FIG_Detail = require("../models/FIGschema");
const NewsGroup = require("../models/news-group-model");
const User = require("../models/userSchema");

const multer = require("multer");
const path = require("path");
const User_verification = require("../models/verify-Schema");
const News = require("../models/news_schema");
const Creator = require("../models/contentcreatorSchema");
const LeadercumCreator = require("../models/leadercumcreatorschema");

var Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/news");
  },
  // destination: "news",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({ storage: Storage });

const ReqNewsGroups = async (req, res) => {
  console.log("entered");
  try {
    const { title, description } = req.body;

    // Validate the length of 'name'
    if (title.length > 30) {
      return res.status(400).json({
        status: false,
        data: [],
        msg: "Name must be 30 characters or less",
      });
    }

    // Validate the length of 'description'
    if (description.length > 60) {
      return res.status(400).json({
        status: false,
        data: [],
        msg: "Description must be 60 characters or less",
      });
    }
    console.log(req.user, "======= this is leader user");
    const figLeaderVerification = await Creator.findOne({
      creatorId: req.user._id.toString(),
    });
    const figLeaderVerification2 = await LeadercumCreator.findOne({
      creatorId: req.user._id.toString(),
    });

    if (
      !Object.keys(figLeaderVerification).length > 0 &&
      !Object.keys(figLeaderVerification2).length > 0
    ) {
      return res.status(500).json({
        status: false,
        data: [],
        msg: "FIG leader not found or not allowed to create a new news group",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(500)
        .send("User not found or not allowed to create a new news group");
    }

    const fpo = await FPO.findById(user.fpo);

    if (!fpo) {
      return res
        .status(500)
        .json({ status: false, data: [], msg: "FPO not found" });
    }

    const newsGroup = new NewsGroup({
      name: title,
      fpo: figLeaderVerification?.fpo.toString(),
      description,
      memberId: req.user._id,
      status: 1,
      approved: 1,
    });

    const updateUser = await User.findByIdAndUpdate(
      { _id: req.user._id },
      {
        appliedNewsGroup: 0,
      }
    );

    const savedng = await newsGroup.save();
    console.log(savedng._id.toString(), "savedng");

    const updateUserAuth = await User.find({
      fpo: figLeaderVerification?.fpo,
    }).populate("language");

    updateUserAuth.forEach((ftoken) => {
      const firebaseMessage = {
        title: `${title}`,
        body: ftoken?.language
          ? ftoken?.language?.file?.news_grp_added
          : "A new group has been created by content creator",
        // type: "news-cat-created",
        type: {
          _id: savedng._id,
          route: "news-cat-created",
        },
        action_type: "MAIN_ACTIVITY",
        // image: "https://picsum.photos/id/237/200/300",
      };
      const dataMsg = {
        title: `${title}`,
        body: ftoken?.language
          ? ftoken?.language?.file?.news_grp_added
          : "A new group has been created by content creator",
        // type: "news-cat-created",
        type: {
          _id: savedng._id,
          route: "news-cat-created",
        },
        action_type: "MAIN_ACTIVITY",
        // image: "https://picsum.photos/id/237/200/300",
      };
      // const firetoken = [`${UserFtoken}`]
      // console.log("ftoken.firebaseToken", ftoken.firebaseToken);
      sendFireBaseNOtificationFCM(
        [ftoken.firebaseToken],
        firebaseMessage,
        dataMsg
      );
    });

    const newng = await NewsGroup.findById(savedng?._id.toString()).populate(
      "fpo"
    );

    res.status(200).send({ status: true, msg: "success ", data: newng });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, data: [], msg: error.message });
  }
};

const updateNewsGroup = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { groupId } = req.body;

    // Validate the length of 'name'
    if (title.length > 30) {
      return res
        .status(400)
        .json({ error: "Name must be 30 characters or less" });
    }

    // Validate the length of 'description'
    if (description.length > 60) {
      return res
        .status(400)
        .json({ error: "Description must be 60 characters or less" });
    }

    console.log("yhhh", req.user);

    const figLeaderVerification = await Creator.findOne({
      creatorId: req.user._id.toString(),
    });

    const figLeaderVerification2 = await LeadercumCreator.findOne({
      creatorId: req.user._id.toString(),
    });

    console.log(!figLeaderVerification && !figLeaderVerification2);

    if (!figLeaderVerification && !figLeaderVerification2) {
      return res.status(500).json({
        status: false,
        data: [],
        msg: "FIG leader not found or not allowed to update news group",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(500).json({
        status: false,
        data: [],
        msg: "FIG leader not found or not allowed to update news group",
      });
    }

    const fpo = await FPO.findById(user.fpo);

    if (!fpo) {
      return res
        .status(500)
        .json({ status: false, data: [], msg: "FPO not found" });
    }

    const updatedNewsGroup = await NewsGroup.findByIdAndUpdate(
      groupId,
      {
        name: title,
        description,
      },
      { new: true }
    ).populate("fpo");

    res
      .status(200)
      .json({ status: true, msg: "success ", data: updatedNewsGroup });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: false, data: [], msg: "Internal Server Error" });
  }
};

const deleteNewsGroup = async (req, res) => {
  try {
    const { groupId } = req.body;

    const figLeaderVerification = await Creator.findOne({
      creatorId: req.user._id.toString(),
    });

    const figLeaderVerification2 = await LeadercumCreator.findOne({
      creatorId: req.user._id.toString(),
    });

    if (!figLeaderVerification && !figLeaderVerification2) {
      return res.status(500).json({
        status: false,
        data: [],
        msg: "User not found or not allowed to delete news group",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(500).json({
        status: false,
        data: [],
        msg: "User not found or not allowed to delete news group",
      });
    }

    const fpo = await FPO.findById(user.fpo);

    if (!fpo) {
      return res
        .status(500)
        .json({ status: false, data: [], msg: "FPO not found" });
    }

    const deletedNewsGroup = await NewsGroup.findByIdAndDelete(
      groupId
    ).populate("fpo");

    if (!deletedNewsGroup) {
      return res
        .status(404)
        .json({ status: false, data: [], msg: "News group not found" });
    }
    res
      .status(200)
      .json({ status: true, msg: "success ", data: deletedNewsGroup });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: false, data: [], msg: "Internal Server Error" });
  }
};

const addNews = async (req, res) => {
  // status: req.params.status
  try {
    // console.log("Hi", req.body);
    // console.log(req.files);
    // console.log("req.user", req.user);

    const { title, description, ngId } = req.body;
    const newsGroupId = ngId;
    const newsGroupDetail = await NewsGroup.findById({ _id: newsGroupId });

    if (!newsGroupDetail || newsGroupDetail.status !== 1) {
      return res
        .status(406)
        .json({ msg: "Something went wrong while accessing the Group" });
    }
    // console.log("req.user.memberId", req.user.memberId)
    // console.log("req.user.memberIdstg", req.user.memberId.toString())
    // console.log("req.user.memberIdstg", (req.user.memberId).toString())
    // console.log(req.user.memberId);
    const figLeaderVerification = await Creator.findOne({
      creatorId: req.user._id.toString(),
    });
    console.log("figLeaderVerification", figLeaderVerification);
    var uploadedFiles = [];
    let thumbnailUrl = null;
    if (!req.files || !req.files[0]) {
      res
        .status(400)
        .json({ status: false, data: [], msg: "File is required." });
      return;
    }

    let selectedimage = null;

    if (req.files) {
      // var filename;
      for (i = 0; i < req.files.length; i++) {
        if (req.files[i].fieldname === "image") {
          uploadedFiles.push({
            mediaType: "image",
            media: req.files[i].key,
          });
          if (selectedimage === null) {
            selectedimage = req.files[i].key;
          }
          thumbnailUrl = `${renderUrl2}${req.files[i].key}`;
        } else if (req.files[i].fieldname === "thumbnail") {
          uploadedFiles.push({
            mediaType: "thumbnail",
            media: req.files[i].key,
          });
          thumbnailUrl = `${renderUrl2}${req.files[i].key}`;
        } else if (req.files[i].fieldname === "video") {
          uploadedFiles.push({
            mediaType: "video",
            media: req.files[i].key,
          });
          // thumbnailUrl = `${renderUrl2}${req.files[i].key}`;
        }
      }
    }

    let postedBy = req.user.firstname;

    // console.log(figLeaderVerification);
    console.log(thumbnailUrl, "<<<<<<<<<<<<<<<<<<<<<< thumbnailUrl");
    const newsData = {
      title: req.body.title,
      // news_type: news_type,
      description: req.body.description,
      postedBy: postedBy,
      fpo: newsGroupDetail.fpo,
      postedUserId: req.user._id,
      newsGroup: newsGroupDetail._id,
      status: figLeaderVerification ? 1 : 0,
      images: uploadedFiles,
    };

    const insetNewsData = await News.create(newsData);
    console.log(insetNewsData._id);
    const newnews = await News.findById(insetNewsData._id.toString()).populate(
      "fpo"
    );
    console.log("newng", newnews);

    const updateUserAuth = await User.find({
      fpo: newsGroupDetail.fpo,
    }).populate("language");

    console.log(updateUserAuth, "updateUserAuth");

    updateUserAuth.forEach((ftoken) => {
      const firebaseMessage = {
        title: `${
          ftoken?.language
            ? ftoken?.language?.file?.news_added
            : "New news added"
        }`,
        body: `${
          ftoken?.language
            ? ftoken?.language?.file?.news_added_1
            : "A news has been posted in the"
        } "${newsGroupDetail.name}/${req.body.title}" ${
          ftoken?.language
            ? ftoken?.language?.file?.news_added_2
            : "by content creator"
        } `,
        // type: "news-cat-created",
        type: {
          _id: newnews._id,
          route: "news-cat-created",
        },
        action_type: "MAIN_ACTIVITY",
        imageUrl: thumbnailUrl,
        image: thumbnailUrl,
        // *************************************************************************
        // NOTE : If imageUrl not works , try the code below
        // *************************************************************************

        // android: {
        //   notification: {
        //     imageUrl: thumbnailUrl,
        //   },
        // },
        // apns: {
        //   payload: {
        //     aps: {
        //       "mutable-content": 1,
        //     },
        //   },
        //   fcm_options: {
        //     image: thumbnailUrl,
        //   },
        // },
        // webpush: {
        //   headers: {
        //     image: thumbnailUrl,
        //   },
        // },
      };
      const dataMsg = {
        title: `${
          ftoken?.language
            ? ftoken?.language?.file?.news_added
            : "New news added"
        }`,
        body: `${
          ftoken?.language
            ? ftoken?.language?.file?.news_added_1
            : "A news has been posted in the"
        } "${newsGroupDetail.name}/${req.body.title}" ${
          ftoken?.language
            ? ftoken?.language?.file?.news_added_2
            : "by content creator"
        } `,
        // type: "news-cat-created",
        type: {
          _id: newnews._id,
          route: "news-cat-created",
        },
        action_type: "MAIN_ACTIVITY",
        imageUrl: thumbnailUrl,
        image: thumbnailUrl,
        // *************************************************************************
        // NOTE : If imageUrl not works , try the code below
        // *************************************************************************

        // android: {
        //   notification: {
        //     imageUrl: thumbnailUrl,
        //   },
        // },
        // apns: {
        //   payload: {
        //     aps: {
        //       "mutable-content": 1,
        //     },
        //   },
        //   fcm_options: {
        //     image: thumbnailUrl,
        //   },
        // },
        // webpush: {
        //   headers: {
        //     image: thumbnailUrl,
        //   },
        // },
      };
      // const firetoken = [`${UserFtoken}`]
      // console.log("ftoken.firebaseToken", ftoken.firebaseToken);
      sendFireBaseNOtificationFCM(
        [ftoken.firebaseToken],
        firebaseMessage,
        dataMsg
      );
    });

    console.log(updateUserAuth, "users");

    res.status(200).json({
      status: true,
      msg: "Uploaded Successfully",
      data: newnews,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: false, data: [], msg: error });
  }
};

const fs = require("fs");
const FPO = require("../models/Fposchema");
const { pagination } = require("./pagination");
const { sendFireBaseNOtificationFCM } = require("../fcmNotification");
const { renderUrl, renderUrl2 } = require("../constants");

const deleteNews = async (req, res) => {
  try {
    console.log("started");
    const newsId = req.body.newsid;

    const news = await News.findById(newsId);
    if (!news) {
      return res
        .status(404)
        .json({ status: false, data: [], msg: "News not found" });
    }

    // Delete media files from the static folder
    for (const media of news.images) {
      const filePath = `uploads/news/${media.media}`;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if (news.thumbnail) {
      const thumbnailPath = `uploads/news/${news.thumbnail}`;
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }

    // Delete the news entry from the database
    const deletedNews = await News.findByIdAndDelete(newsId).populate("fpo");
    res.status(200).json({
      status: true,
      msg: "News Deleted successfully",
      deletedNews,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      data: [],
      msg: "An error occurred while deleting news",
    });
  }
};

const updateNews = async (req, res) => {
  try {
    const { title, description, newsid } = req.body;
    var newfiles = [];
    var uploadedFiles = [];
    const existingNews = await News.findById(newsid);

    uploadedFiles = existingNews.images;

    if (req.files) {
      for (i = 0; i < req.files.length; i++) {
        if (req.files[i].fieldname === "image") {
          uploadedFiles.push({
            mediaType: "image",
            media: req.files[i].key,
          });
          newfiles.push({
            mediaType: "image",
            media: req.files[i].key,
          });
        } else if (req.files[i].fieldname === "thumbnail") {
          uploadedFiles.push({
            mediaType: "thumbnail",
            media: req.files[i].key,
          });
          newfiles.push({
            mediaType: "thumbnail",
            media: req.files[i].key,
          });
        } else if (req.files[i].fieldname === "video") {
          uploadedFiles.push({
            mediaType: "video",
            media: req.files[i].key,
          });
          newfiles.push({
            mediaType: "video",
            media: req.files[i].key,
          });
        }
      }
    }
    if (!existingNews) {
      // for (const media of newfiles) {
      // const filePath = `uploads/news/${media.media}`;
      // if (fs.existsSync(filePath)) {
      //   fs.unlinkSync(filePath);
      // }
      // }
      // for (const media of uploadedFiles) {
      //   fs.unlinkSync(`uploads/news/${media.media}`);
      // }
      return res
        .status(404)
        .json({ status: false, data: [], msg: "News not found" });
    }

    // Delete the previous images
    // for (const media of existingNews.images) {
    //   // fs.unlinkSync(`uploads/news/${media.media}`);
    //   for (const media of existingNews.images) {
    //     const filePath = `uploads/news/${media.media}`;
    //     if (fs.existsSync(filePath)) {
    //       fs.unlinkSync(filePath);
    //     }
    //   }
    // }
    // if (existingNews.thumbnail) {
    //   const thumbnailPath = `uploads/news/${existingNews.thumbnail}`;
    //   if (fs.existsSync(thumbnailPath)) {
    //     fs.unlinkSync(thumbnailPath);
    //   }
    // }

    // Update news with new images
    const postnews = await News.findByIdAndUpdate(
      { _id: newsid },
      {
        // news_type,
        title,
        description,
        images: uploadedFiles,
      }
    ).populate("fpo");

    await postnews.save();
    res
      .status(200)
      .json({ status: true, msg: "News was Updated", data: postnews });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      data: [],
      msg: "An error occurred while updating news",
    });
  }
};

const updateNewsStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const updateNews = await News.findByIdAndUpdate(
      { _id: id },
      {
        status: req.params.status,
      }
    );
    res.status(200).json({
      status: true,
      data: updateNews,
      msg: "The news status was updated",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating news status" });
  }
};

const LikenReport = async (req, res) => {
  try {
    const { newsid, tag, user, reason } = req.body;

    if (tag == "like") {
      let newsLikes = await News.findById(newsid).select("likeCount likedBy");
      let newsLikers = newsLikes.likedBy;
      newsLikers.push({ _id: user });
      const updateNews = await News.findByIdAndUpdate(
        { _id: newsid },
        {
          likeCount: newsLikes.likeCount + 1,
          likedBy: newsLikers,
        }
      );
      res.status(200).json({
        status: true,
        data: updateNews,
        msg: "The news status was updated",
      });
    }
    if (tag == "report") {
      let newsReports = await News.findById(newsid).select(
        "reportCount reportedBy"
      );
      let newsReporters = newsReports.reportedBy;
      newsReporters.push({ _id: user, reason });
      const updateNews1 = await News.findByIdAndUpdate(
        { _id: newsid },
        {
          reportCount: newsReports.reportCount + 1,
          reportedBy: newsReporters,
        }
      );
      res.status(200).json({
        status: true,
        data: updateNews1,
        msg: "The news status was updated",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      msg: "An error occurred while updating news status",
      data: [],
    });
  }
};

const listAllNewsGroup = async (req, res) => {
  try {
    console.log("started");
    const limitQuery = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };

    const newsGroups = await pagination(
      NewsGroup,
      NewsGroup.find()
        .populate("memberId")
        .populate("fpo")
        .sort({ createdAt: -1 }),
      limitQuery
    );
    console.log(newsGroups, "newsGroups");
    // const newsGroups = await NewsGroup.find({ status: 1 })
    //   .populate("memberId")
    //   .sort({ createdAt: -1 });
    res.status(200).json({
      status: true,
      data: newsGroups,
      total_count: newsGroups.totalRecord,
      msg: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, data: [], msg: error });
  }
};
// for fpo
const listAllNewsGroup_fpo = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    // const newsGroups = await NewsGroup.find({ fpo: id })
    //   .populate("memberId")
    //   .populate("fpo")
    //   .sort({ createdAt: -1 });
    const limitQuery = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };

    const newsGroups = await pagination(
      NewsGroup,
      NewsGroup.find({ fpo: id })
        .populate("memberId")
        .populate("fpo")
        .sort({ createdAt: -1 }),
      limitQuery
    );
    res.status(200).json({
      status: true,
      data: newsGroups,
      msg: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, data: [], msg: error });
  }
};

const listAllNewsGroup_fpouser = async (req, res) => {
  try {
    const id = req.body.id;
    console.log(id);
    const newsGroups = await NewsGroup.find({ fpo: id, status: 1 })
      .populate("memberId")
      .populate("fpo")
      .sort({ createdAt: -1 });

    const count = await NewsGroup.countDocuments({ fpo: id, status: 1 });

    console.log(newsGroups);
    res.status(200).json({
      status: true,
      data: { results: newsGroups },
      total_count: count,
      msg: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, data: [], msg: error });
  }
};

const updateNG_status = async (req, res) => {
  try {
    // 0 = unverified, 1 = verified, 2 = rejected
    const newsGroup = await NewsGroup.findByIdAndUpdate(
      { _id: req.params.ngId },
      { status: req.params.status, approved: req.params.status },
      { returnDocument: "after" }
    );

    if (req.params.status == 1) {
      const memberId = newsGroup.memberId;
      const memberDetailUpdate = await User.findByIdAndUpdate(
        { _id: memberId },
        {
          $addToSet: {
            newsGroup: newsGroup._id,
          },
          NgPopup: 1,
        },
        { returnDocument: "after" }
      );
      // You can add the code for sending notifications here if needed.

      return res.status(200).json({
        status: true,
        msg: "Successfully Verified News group",
        data: newsGroup,
      });
    } else if (req.params.status == 0) {
      // You can handle the case when status is 0 here.
    }

    res.status(200).json({
      status: true,
      msg: "Successfully updated status News group",
      data: newsGroup,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating News group status" });
  }
};

//List verified
const listAll_verifiedNG = async (req, res) => {
  try {
    const ng_group = await NewsGroup.find({ status: 1 })
      .sort({ createdAt: -1 })
      .populate("memberId");

    res.status(200).json({ status: true, data: ng_group, msg: "success" });
  } catch (error) {
    res.status(500).json({ status: false, data: [], msg: error });
  }
};

const listAllNews = async (req, res) => {
  try {
    let groupId = req.params.groupId;
    let memberId = req.query.member;
    let latestNews, viwedNews;

    const limitQuery = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };

    const AllNews = await pagination(
      News,
      News.find({ newsGroup: groupId }).populate("newsGroup").sort({
        createdAt: -1,
      }),
      limitQuery
    );

    // const AllNews = await News.find({ newsGroup: groupId })
    //   .populate("newsGroup")
    //   .sort({
    //     createdAt: -1,
    //   });
    res.status(200).json({
      status: true,
      msg: "success",
      data: { latestNews, viwedNews, AllNews },
    });
  } catch (error) {
    console.error("An error occurred while fetching news:", error);
    res.status(500).json({
      status: false,
      data: [],
      msg: "An error occurred while fetching news",
    });
  }
};

const listAllNewsuser = async (req, res) => {
  const { fpo } = req.body;
  try {
    const limitQuery = {
      page: req.body.page || 1,
      limit: req.body.limit || 10,
    };

    const AllNews = await pagination(
      News,
      News.find({ fpo: fpo, status: 1 }).populate("newsGroup fpo").sort({
        createdAt: -1,
      }),
      limitQuery
    );

    // const AllNews = await News.find().populate("newsGroup").sort({
    //   createdAt: -1,
    // });
    res.status(200).json({
      status: true,
      msg: "success ",
      data: AllNews,
      total_count: AllNews.totalRecord,
    });
  } catch (error) {
    console.error("An error occurred while fetching news:", error);
    res.status(500).json({
      status: false,
      data: [],
      msg: "An error occurred while fetching news",
    });
  }
};

const listAll_unverifiedNG = async (req, res) => {
  try {
    const ng_groups = await NewsGroup.find({ status: { $ne: 1 } })
      .sort({ createdAt: -1 })
      .populate("memberId");

    res.status(200).json({ status: true, msg: "success", data: ng_groups });
  } catch (error) {
    console.error(
      "An error occurred while fetching unverified news groups:",
      error
    );
    res.status(500).json({
      status: false,
      data: [],
      msg: "An error occurred while fetching unverified news groups",
    });
  }
};
// for a fpo
const listAll_unverifiedNG_fpo = async (req, res) => {
  try {
    const id = req.params.id;
    const ng_groups = await NewsGroup.find({ fpo: id, status: { $ne: 1 } })
      .sort({ createdAt: -1 })
      .populate("memberId");

    res.status(200).json({ status: true, msg: "success", data: ng_groups });
  } catch (error) {
    console.error(
      "An error occurred while fetching unverified news groups:",
      error
    );
    res.status(500).json({
      status: false,
      data: [],
      msg: "An error occurred while fetching unverified news groups",
    });
  }
};

// get single news
const listOneNews = async (req, res) => {
  try {
    let id = req.params.id;
    let memberId = req.query.member;

    console.log(id, memberId);
    const listNews = await News.findById({ _id: id, status: 1 }).populate(
      "seenBy newsGroup fpo reportedBy._id"
    );

    if (memberId) {
      const updateSeenNews = await News.findByIdAndUpdate(
        { _id: id },
        {
          $addToSet: { seenBy: memberId },
        }
      );
    }

    res.status(200).json({ status: true, msg: "success", data: listNews });
  } catch (error) {
    console.error("An error occurred while fetching the news:", error);
    res.status(500).json({
      status: false,
      data: [],
      msg: "An error occurred while fetching the news",
    });
  }
};

const getnewsdataforuser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch user details to get associated FPO
    const user = await User.findById(userId).populate("fpo");

    if (!user || !user.fpo) {
      return res
        .status(404)
        .json({ error: "User or associated FPO not found" });
    }

    const limitQuery = {
      page: req.body.page || 1,
      limit: req.body.limit || 10,
    };

    const newsGroups = await pagination(
      NewsGroup,
      NewsGroup.find({ fpo: user.fpo, status: 1 }).populate("fpo"),
      limitQuery
    );

    const count = await NewsGroup.countDocuments({ fpo: user.fpo, status: 1 });

    // Fetch news groups associated with the user's FPO
    // const newsGroups = await NewsGroup.find({ fpo: user.fpo }).populate("fpo");
    console.log(newsGroups, "newsgrps");
    // Construct the response object
    const responseData = {
      status: true,
      msg: "",
      news_data: [],
      total_count: count,
    };

    // Iterate through each news group
    for (const newsGroup of newsGroups.results) {
      // Fetch all news for the current news group
      const newsList = await News.find({ newsGroup: newsGroup._id });

      // Construct data for the current news group
      const newsGroupData = {
        id: newsGroup._id,
        title: newsGroup.name, // Assuming name field represents the title
        created_at: newsGroup.createdAt, // Assuming createdAt field represents the creation timestamp
        news_list: newsList.map((news) => ({
          id: news._id,
          media: news.images.map((image) => ({
            type: image.mediaType, // Assuming mediaType field represents the type (image or video)
            url: image.media,
          })),
        })),
      };

      // Add the current news group data to the response
      responseData.news_data.push(newsGroupData);
    }

    res.status(200).json({ status: true, msg: "success", data: responseData });
  } catch (error) {
    console.error("Error fetching user news groups:", error);
    res.status(500).json({
      status: false,
      data: [],
      msg: "Error fetching user news groups",
    });
  }
};

const seenby = async (req, res) => {
  try {
    // const {} = req.params;
    const { newsId, userId } = req.body;

    // Find the news by its ID
    const news = await News.findById(newsId);

    if (!news) {
      return res.status(404).json({ status: false, msg: "News not found" });
    }

    // Add the user ID to the seenBy array if it's not already included
    if (!news.seenBy.includes(userId)) {
      news.seenBy.push(userId);
      await news.save();
    }

    return res.status(200).json({ status: true, msg: "User marked as seen" });
  } catch (error) {
    console.error("Error marking user as seen:", error);
    return res
      .status(500)
      .json({ status: false, msg: "Internal server error" });
  }
};

module.exports = {
  ReqNewsGroups,
  addNews,
  upload,
  deleteNews,
  updateNews,
  updateNewsStatus,
  listAllNewsGroup,
  updateNG_status,
  listAll_verifiedNG,
  listAllNews,
  listAll_unverifiedNG,
  listOneNews,
  listAll_unverifiedNG_fpo,
  listAllNewsGroup_fpo,
  getnewsdataforuser,
  updateNewsGroup,
  deleteNewsGroup,
  listAllNewsuser,
  LikenReport,
  listAllNewsGroup_fpouser,
  seenby,
};
