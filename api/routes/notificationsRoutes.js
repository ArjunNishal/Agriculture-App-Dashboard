const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationsCTRL");
const authenticate = require("../middlewares/auth");
const app_auth = require("../middlewares/appauth");
const { uploadwithMulterNotification } = require("../s3upload");

// Route to add a new notification
router.post(
  "/addnew",
  authenticate,
  // notificationController.upload.single("image"),
  uploadwithMulterNotification.single("image"),
  notificationController.addNotification
);

// Route to get all notifications for an FPO
router.post(
  "/fponotifications",
  app_auth,
  notificationController.getNotificationsForFPO
);

// Route to get all notifications
router.post(
  "/allnotifications",
  authenticate,
  notificationController.getAllNotifications
);

module.exports = router;
