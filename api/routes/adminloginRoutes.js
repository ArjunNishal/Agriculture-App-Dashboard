const express = require("express");
const router = express.Router();
const admincontroller = require("../controllers/adminloginCTRL");
const authenticate = require("../middlewares/auth");
const { uploadwithMulter } = require("../s3upload");

router.post(
  "/addAdmin",
  authenticate,
  admincontroller.uploadfpo.fields([
    { name: "logo", maxCount: 1 },
    // { name: "banner1", maxCount: 1 },
    // { name: "banner2", maxCount: 1 },
    // { name: "banner3", maxCount: 1 },
  ]),
  admincontroller.addAdmin
);
router.post("/login-admin", admincontroller.AdminLogin);
router.get("/adminslist", authenticate, admincontroller.getAdminList);
router.get("/adminbyid/:id", authenticate, admincontroller.getAdminById);

router.post(
  "/updatepermissions/:adminId",
  authenticate,
  admincontroller.updatepermissions
);

// Block an admin
router.put("/block", authenticate, admincontroller.blockOrUnblockAdmin);
// edit admin
router.put("/edit/:adminId", authenticate, admincontroller.editAdminDetails);

// forgot password
// send reset pass link to mail =================================================
router.post("/resetpassword", authenticate, admincontroller.forgotpassword);

// reset passsword =================================================================
router.put(
  "/resetpassword/:id/:token",
  authenticate,
  admincontroller.resetpass
);

router.post("/unauth/resetpassword", admincontroller.forgotpassword);

// reset passsword =================================================================
router.put("/unauth/resetpassword/:id/:token", admincontroller.resetpass);

router.put("/edit-profile/:id", authenticate, admincontroller.updateProfile);

router.post(
  "/upload-image/:id",
  authenticate,
  // admincontroller.uploadprofile.single("profile"),
  uploadwithMulter.single("profile"),
  admincontroller.uploadProfileImage
);

module.exports = router;
