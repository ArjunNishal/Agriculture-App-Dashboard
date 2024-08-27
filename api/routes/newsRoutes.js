const express = require("express");
const router = express.Router();
const newscontroller = require("../controllers/newsCTRL");
const User_auth = require("../middlewares/User_auth");
const Leader_auth = require("../middlewares/Leader_auth");
const Creator_auth = require("../middlewares/Creator_auth");
const authenticate = require("../middlewares/auth");
const Mem_auth = require("../middlewares/Mem_auth");
const app_auth = require("../middlewares/appauth");
const { uploadNews } = require("../s3upload");

router.post(
  "/new-newsgroup-request",
  Creator_auth,
  newscontroller.ReqNewsGroups
);

router.post(
  "/add-news",
  Creator_auth,
  // newscontroller.upload.any(),
  uploadNews.any(),
  newscontroller.addNews
);

router.delete("/delete-news", Creator_auth, newscontroller.deleteNews);

router.post("/admin/delete-news", authenticate, newscontroller.deleteNews);

router.patch("/updateNewscat", Creator_auth, newscontroller.updateNewsGroup);

router.patch("/like-report", Mem_auth, newscontroller.LikenReport);

router.delete("/deleteNewscat", Creator_auth, newscontroller.deleteNewsGroup);

router.patch(
  "/update-news",
  Creator_auth,
  // newscontroller.upload.any(),
  uploadNews.any(),
  newscontroller.updateNews
);

router.patch(
  "/update-news-status/:id/:status",
  Creator_auth,
  newscontroller.updateNewsStatus
);

router.patch(
  "/admin/update-news-status/:id/:status",
  authenticate,
  newscontroller.updateNewsStatus
);

// all new grps
// get news for a grp
router.get(
  "/admin/get-all-news/:groupId",
  authenticate,
  newscontroller.listAllNews
);

router.post("/user/get-all-news", Mem_auth, newscontroller.listAllNewsuser);

// get all NG
router.get(
  "/admin/get-all-news-cat",
  authenticate,
  newscontroller.listAllNewsGroup
);
router.post(
  "/user/get-all-news-cat",
  Mem_auth,
  newscontroller.listAllNewsGroup
);
// get NG for fpo
router.get(
  "/admin/get-all-news-cat/:id",
  authenticate,
  newscontroller.listAllNewsGroup_fpo
);

// get all news cat for fpo for user
router.post(
  "/user/get-all-news-cat-fpo",
  Mem_auth,
  newscontroller.listAllNewsGroup_fpouser
);

// get all news reqs
router.get(
  "/get-unverifiedNG",
  authenticate,
  newscontroller.listAll_unverifiedNG
);
// get ng reqs for a fpo
router.get(
  "/get-unverifiedNG/:id",
  authenticate,
  newscontroller.listAll_unverifiedNG_fpo
);
// get single news
router.get("/get-news/:id", app_auth, newscontroller.listOneNews);

router.post(
  "/news_group_list/:userId",
  Mem_auth,
  newscontroller.getnewsdataforuser
);

router.post("/seenby", Mem_auth, newscontroller.seenby);

// seenby

module.exports = router;
