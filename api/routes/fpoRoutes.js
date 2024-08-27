const express = require("express");
const router = express.Router();
const fpocontroller = require("../controllers/fpoCtrl");
const authenticate = require("../middlewares/auth");
const User_auth = require("../middlewares/User_auth");
const app_auth = require("../middlewares/appauth");
const Mem_auth = require("../middlewares/Mem_auth");
const { uploadfpoimage } = require("../s3upload");
router.post(
  "/addfpo",
  authenticate,
  // fpocontroller.uploadfpo.single("image"),
  uploadfpoimage.single("image"),
  fpocontroller.createOrUpdateFPO
);

router.put(
  "/updatefpo/:id",
  authenticate,
  uploadfpoimage.single("image"),
  fpocontroller.createOrUpdateFPO
);
router.get("/allfpo", authenticate, fpocontroller.getAllFPOsWithAdmin);
// /all fpo list for user with only id and name
router.get("/user/allfpo", fpocontroller.getAllFPOsWithUser);

router.put("/edit/:id", authenticate, fpocontroller.editfpo);

// fpo profile
router.get("/getmyfpo/:id", authenticate, fpocontroller.getFPOById);
// for user
router.get("/fpoProfile/:id", Mem_auth, fpocontroller.getFPOByIdforuser);

router.get("/fpodata/:fpoId", authenticate, fpocontroller.getFPOData);

router.get("/fpomembers/:id", authenticate, fpocontroller.getallmembersforfpo);

// getallmembersforfpo

module.exports = router;
