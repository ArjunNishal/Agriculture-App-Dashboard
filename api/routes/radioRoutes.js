const router = require("express").Router();
const authenticate = require("../middlewares/auth");
const radioctrl = require("../controllers/radioCTRL");
const Mem_auth = require("../middlewares/Mem_auth");
const { uploadwithMulterRadio } = require("../s3upload");

// router.get("/admin/radio-cat/filter", authenticate, SearchRadioCatFilter);
// router.get("/admin/radio/filter", authenticate, SearchRadioFilter)

//Radio Category
router.post(
  "/admin/add-new-radioCat",
  authenticate,
  // radioctrl.upload.any(),
  uploadwithMulterRadio.any(),
  radioctrl.addNewCategory
);
router.patch(
  "/admin/update-radioCat/:id",
  authenticate,
  // radioctrl.upload.any(),
  uploadwithMulterRadio.any(),
  radioctrl.updateCategory
);
//update details
router.patch(
  "/admin/update-radioCat-status/:id/:status",
  authenticate,
  // radioctrl.upload.any(),
  // uploadwithMulterRadio.any(),
  radioctrl.UpdateCatStatus
); // update status
router.delete(
  "/admin/delete-radioCat/:catId",
  authenticate,
  radioctrl.deleteCategory
);
router.get("/admin/all-radioCat", authenticate, radioctrl.listAllAdminCategory);

router.get(
  "/admin/all-radioCats",
  authenticate,
  radioctrl.listAllAdminCategories_fpo
);

// forfpo
router.get(
  "/admin/all-radioCat/:id",
  authenticate,
  radioctrl.listAllAdminCategory_fpo
);

router.get(
  "/admin/all-radioCats",
  authenticate,
  radioctrl.listAllAdminCategories_fpo
);

router.post(
  "/user/all-radioCats",
  Mem_auth,
  radioctrl.listAllAdminCategories_fpo_user
);

router.get(
  "/admin/radio-category/:id",
  authenticate,
  radioctrl.ListOneCategory
);

router.get("/admin/episode/:eid", authenticate, radioctrl.getepisodebyID);

// router.post("/admin/file-uploads", user_auth, upload.any(), addNewFiles);

// *************************************
// Radio
router.post(
  "/admin/add-new-radio",
  authenticate,
  // radioctrl.upload.any(),
  uploadwithMulterRadio.any(),
  radioctrl.addNewRadio
);
router.post(
  "/admin/add-new-episode",
  authenticate,
  // radioctrl.upload.any(),
  uploadwithMulterRadio.any(),
  radioctrl.addNewepisode
);

router.patch(
  "/admin/update-radio/:id",
  authenticate,
  // radioctrl.upload.any(),
  uploadwithMulterRadio.any(),
  radioctrl.updateRadio
);
router.patch(
  "/admin/update-episode/:id",
  authenticate,
  // radioctrl.upload.any(),
  uploadwithMulterRadio.any(),
  radioctrl.updateEpisode
);
//update details
router.patch(
  "/admin/update-radio-status/:id/:status",
  authenticate,
  // radioctrl.upload.any(),
  // uploadwithMulterRadio.any(),
  radioctrl.UpdateRadioStatus
); // update status
router.get("/admin/all-radio/:catId", authenticate, radioctrl.getAllAdminRadio);
router.get(
  "/admin/all-radios/:catId",
  authenticate,
  radioctrl.getAllAdminRadiolist
);
// getradios for a season
router.get(
  "/admin/all-radio-season/:sid",
  authenticate,
  radioctrl.getseasonbyradio
);
router.get("/admin/radio/:id", radioctrl.getRadioById);
router.delete("/admin/delete-radio/:id", authenticate, radioctrl.deleteRadio);
router.delete("/admin/delete-season/:id", authenticate, radioctrl.deleteseason);
router.delete(
  "/admin/delete-episode/:id",
  authenticate,
  radioctrl.deleteepisode
);

//Non-auth

router.get("/all-radioCat", radioctrl.listAlluserCategory);
router.get("/all-radio/:catId", authenticate, radioctrl.getAllAdminRadio);
router.get("/radio/:id", radioctrl.getRadioById);

// season
router.post(
  "/season/add",
  authenticate,
  // radioctrl.upload.any(),
  // uploadwithMulterRadio.any(),
  radioctrl.addSeason
);
router.get("/season/admin/all", authenticate, radioctrl.getAllSeasons);
router.get("/season/fpo/:fpoId", authenticate, radioctrl.getSeasonsByFPO);
router.get("/season/radio/:rid", authenticate, radioctrl.getSeasonsByradio);
router.get(
  "/seasons/radio/:rid",
  authenticate,
  radioctrl.getSeasonsByradiolist
);
router.get("/episode/season/:sid", authenticate, radioctrl.getepisodebyseason);
router.post("/radio-topics", Mem_auth, radioctrl.getFPOData);
router.post("/training_series_episode", Mem_auth, radioctrl.getRadioData);
router.patch(
  "/season/edit/:id",
  authenticate,
  // radioctrl.upload.any(),
  // uploadwithMulterRadio.any(),
  radioctrl.editSeason
);
router.patch(
  "/season/edit/status/:id/:status",
  authenticate,
  radioctrl.editSeasonStatus
);
router.patch(
  "/episode/edit/status/:id/:status",
  authenticate,
  radioctrl.editepisodeStatus
);

module.exports = router;
