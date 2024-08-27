const express = require("express");
const router = express.Router();
const userctrl = require("../controllers/userloginCTRL");
const figctrl = require("../controllers/figCTRL");
const User_auth = require("../middlewares/User_auth");
const fpocontroller = require("../controllers/fpoCtrl");
const Leader_auth = require("../middlewares/Leader_auth");
const authenticate = require("../middlewares/auth");
const Mem_auth = require("../middlewares/Mem_auth");
const { uploadwithMulterFig } = require("../s3upload");

router.post("/sendotp/:method", userctrl.commonSendOtp);
router.post("/register", userctrl.CommonRegister);
router.post("/login", userctrl.Common_Login);
// send leader req
router.post("/leader-req", User_auth, userctrl.FIG_leader_Request_verificaiton);

// add new fig group
router.post(
  "/leader-fig-new",
  Leader_auth,
  // figctrl.upload.any(),
  uploadwithMulterFig.any(),
  figctrl.Add_New_FIG_Group
);

// update fig grp
router.patch(
  "/leader-fig-update/:id",
  Leader_auth,
  // figctrl.upload.any(),
  uploadwithMulterFig.any(),
  figctrl.update_FIG_Group
);
//
// router.post("/getbanners", userctrl.getbanners);

router.get("/getroles", userctrl.getroles);
router.get("/getrolebyname/:name", authenticate, userctrl.getrolesbyname);
router.get("/getrole/:id", authenticate, userctrl.getrolebyid);

router.get("/home/:id", Mem_auth, userctrl.homepagedetails);
router.get("/getallsurveysforfpo/:id", Mem_auth, userctrl.getsurveysforuser);

router.get("/language/:id", Mem_auth, fpocontroller.getFPOLanguages);
router.get("/language", fpocontroller.getFPOLanguages2);

router.post("/logout", userctrl.logoutapi);

router.post("/update-language", Mem_auth, userctrl.editlanguage);

module.exports = router;
