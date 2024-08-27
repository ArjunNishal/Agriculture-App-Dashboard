const router = require("express").Router();
const multer = require("multer");
const newsCTRL = require("../controllers/newsCTRL");
const figcontroller = require("../controllers/figCTRL");
const adminctrl = require("../controllers/admin-authCTRL");
const authenticate = require("../middlewares/auth");
const path = require("path");
const Mem_auth = require("../middlewares/Mem_auth");
const { uploadfpoimage, uploadBanners } = require("../s3upload");

router.patch(
  "/update-newsGroup-status/:ngId/:status",
  authenticate,
  newsCTRL.updateNG_status
);

router.patch(
  "/update-FIGLeader/:LeaderId/:status",
  authenticate,
  figcontroller.updateFIG_leader
);

router.patch(
  "/update-user/:userid/:status",
  authenticate,
  figcontroller.updateUser_statusAdmin
);

router.patch(
  "/update-fig-status/:figId/:status",
  authenticate,
  figcontroller.updateFIG_statusAdmin
);

//FIG Routes
// all fig list
router.get("/admin-all-fig", authenticate, figcontroller.ListAllFIGs);

router.get(
  "/admin-all-fig-fpo/:id",
  authenticate,
  figcontroller.ListAllFIGsbyfpo
);
// single fig by id
router.get("/admin-fig/:id", authenticate, figcontroller.ListFIGById);

// all fig leader reqs
router.get(
  "/get-Unverified-FIGLeader",
  authenticate,
  figcontroller.listAllFIG_leaderRequest
);
// all fig leader reqs for a fpo
router.get(
  "/get-Unverified-FIGLeader/:id",
  authenticate,
  figcontroller.listAllFIG_leaderRequestfpo
);

// fig leader by id
router.get("/get-FIGLeader/:id", authenticate, figcontroller.getFIGLeaderById);
// all fig leaders
router.get(
  "/get-FIGLeaders",
  authenticate,
  figcontroller.listAll_verified_FIG_leader
);
// ge fig leader for fpo
router.get(
  "/get-FIGLeaders/:id",
  authenticate,
  figcontroller.listAll_verified_FIG_leader_fpo
);

router.post("/admin/addlanguage", authenticate, adminctrl.addlanguage);
router.get("/getlanguages", authenticate, adminctrl.getlanguages);

// Update language name by ID
router.put(
  "/updatelanguage/:id",
  authenticate,
  adminctrl.upload.any(),
  adminctrl.updateLanguage
);

// Delete language by ID
router.delete("/deletelanguage/:id", authenticate, adminctrl.deleteLanguage);

router.post(
  "/savethemsettings/:id",
  authenticate,
  // adminctrl.uploadfpologo.single("logo"),
  uploadfpoimage.single("logo"),
  adminctrl.saveSettings
);

// upload banners
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/banner"); // Folder where the banners will be stored
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });
// router.post(
//   "/uploadbanners/:id",
//   upload.array("banners", 3),
//   adminctrl.uploadbanners
// );

router.post(
  "/uploadBanner/:id/:position",
  authenticate,
  // upload.single("banner"),
  uploadBanners.single("banner"),
  adminctrl.uploadBanner
);

router.get(
  "/content-creators/fpo/:fpoId",
  authenticate,
  figcontroller.getContentCreatorsByFPO
);
router.post("/content-creators/add", Mem_auth, figcontroller.addContentCreator);

// Edit Content Creator Status
router.put(
  "/content-creator/edit/:id/:status",
  authenticate,
  figcontroller.editContentCreatorStatus
);

// Delete Content Creator
router.delete(
  "/content-creator/delete/:id",
  authenticate,
  figcontroller.deleteContentCreator
);

router.delete("/leader/delete/:id", authenticate, figcontroller.deleteLeader);

// Get All Content Creators
router.get(
  "/content-creators/all",
  authenticate,
  figcontroller.getAllContentCreators
);

router.get(
  "/leader-creators/fpo/:fpoId",
  authenticate,
  figcontroller.getContentCreatorscumleaderByFPO
);
router.post(
  "/leader-creators/add",
  Mem_auth,
  figcontroller.addContentCreatorcumleader
);

// Edit Content Creator Status
router.put(
  "/leader-creator/edit/:id/:status",
  authenticate,
  figcontroller.editContentCreatorcumleaderStatus
);

// Delete Content Creator
router.delete(
  "/leader-creator/delete/:id",
  authenticate,
  figcontroller.deleteContentCreatorcumleader
);

// Get All Content Creators
router.get(
  "/leader-creators/all",
  authenticate,
  figcontroller.getAllContentCreatorscumleader
);

// router.get("/admin/get-Unverified-newsGroup", authenticate, listAll_unverifiedNG);
// router.get("/admin/news-group/:id", authenticate, listOneNG);
// router.get("/admin/get-verified-newsGroup", authenticate, listAll_verifiedNG);

router.post("/search", authenticate, adminctrl.search);

router.get("/getpendingreqs/:fpo", authenticate, adminctrl.pendingreqs);

module.exports = router;
