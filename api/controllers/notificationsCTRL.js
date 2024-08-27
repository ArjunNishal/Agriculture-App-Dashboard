// notificationController.js

const multer = require("multer");
const Notification = require("../models/Notifications");
const path = require("path");
const Admin = require("../models/adminSchema");
const User = require("../models/userSchema");
const { sendFireBaseNOtificationFCM } = require("../fcmNotification");
const { pagination } = require("./pagination");
const { renderUrl2 } = require("../constants");

var Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/notifications");
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

// Controller to add a new notification
const addNotification = async (req, res) => {
  try {
    const { title, description, type } = req.body;

    const user = await Admin.findById(req.user);

    let newNotification;

    let users;

    if (user.role === "superadmin") {
      newNotification = new Notification({
        title,
        description,
        image: req?.file?.key ? req?.file?.key : "",
        createdby: user._id,
        allfpos: true,
        type: type,
      });
      users = await User.find().select("firebaseToken");
    } else if (user.role === "fpoadmin") {
      newNotification = new Notification({
        title,
        description,
        image: req?.file?.key ? req?.file?.key : "",
        createdby: user._id,
        fpo: user.fpo,
        type: type,
      });
      users = await User.find({
        fpo: user.fpo,
      }).select("firebaseToken");
    }

    const savedNotification = await newNotification.save();

    let thumbnailUrl = null;

    thumbnailUrl = req?.file
      ? `${renderUrl2}${req?.file?.key}`
      : null;

    const firebaseMessage = {
      title: `${title}`,
      body: `${description}`,
      // type: "notification",
      type: {
        _id: savedNotification._id,
        route: "home",
      },
      action_type: "MAIN_ACTIVITY",
      imageUrl: thumbnailUrl,
      image: thumbnailUrl,
      // image: "https://picsum.photos/id/237/200/300",
    };
    const dataMsg = {
      title: `${title}`,
      body: `${description}`,
      // type: "notification",
      type: {
        _id: savedNotification._id,
        route: "home",
      },
      action_type: "MAIN_ACTIVITY",
      imageUrl: thumbnailUrl,
      image: thumbnailUrl,
      // image: "https://picsum.photos/id/237/200/300",
    };
    // const firetoken = [`${UserFtoken}`]
    users.forEach((ftoken) => {
      console.log(
        "ftoken.firebaseToken",
        ftoken.firebaseToken,
        ftoken,
        "======================================================================="
      );
      sendFireBaseNOtificationFCM(
        [ftoken.firebaseToken],
        firebaseMessage,
        dataMsg
      );
    });

    res.status(200).json({
      status: true,
      msg: "created successfully",
      data: savedNotification,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      msg: "failed",
      error: "Internal Server Error",
    });
  }
};

// Controller to get all notifications for an FPO
const getNotificationsForFPO = async (req, res) => {
  try {
    const { fpoId, adminid } = req.body;

    // console.log(adminid);

    let notifications;
    const limitQuery = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };

    if (adminid) {
      // notifications = await Notification.find({
      //   $or: [{ fpo: fpoId }],
      // })
      //   .populate("createdby")
      //   .sort({ createdAt: -1 });
      notifications = await pagination(
        Notification,
        Notification.find({
          $or: [{ fpo: fpoId }],
        })
          .populate("createdby")
          .sort({ createdAt: -1 }),
        limitQuery
      );
    } else {
      // notifications = await Notification.find({
      //   $or: [{ fpo: fpoId }, { allfpos: true }],
      // })
      //   .populate("createdby")
      //   .sort({ createdAt: -1 });
      notifications = await pagination(
        Notification,
        Notification.find({
          $or: [{ fpo: fpoId }, { allfpos: true }],
        })
          .populate("createdby")
          .sort({ createdAt: -1 }),
        limitQuery
      );
    }

    // const notifications = await Notification.find({
    //   $or: [{ fpo: fpoId }],
    // })

    res.status(200).json({
      status: true,
      msg: "Successfull",
      data: notifications,
      total_count: notifications.totalRecord,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      msg: "failed to get",
      error: "Internal Server Error",
    });
  }
};

// Controller to get all notifications
const getAllNotifications = async (req, res) => {
  try {
    const limitQuery = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };

    const notifications = await pagination(
      Notification,
      Notification.find().populate("createdby").sort({ createdAt: -1 }),
      limitQuery
    );

    // const notifications = await Notification.find()
    //   .populate("createdby")
    //   .sort({ createdAt: -1 });
    res
      .status(200)
      .json({ status: true, msg: "Successfull", data: notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      msg: "failed to get",
      error: "Internal Server Error",
    });
  }
};

module.exports = {
  addNotification,
  getNotificationsForFPO,
  getAllNotifications,
  upload,
};
