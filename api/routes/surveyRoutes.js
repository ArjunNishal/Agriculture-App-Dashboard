const express = require("express");
const router = express.Router();
const surveycontroller = require("../controllers/surveyCTRL");
const authenticate = require("../middlewares/auth");
const Mem_auth = require("../middlewares/Mem_auth");

router.post("/createsurvey", authenticate, surveycontroller.createSurvey);
// edit survey
router.post("/edit/:id", authenticate, surveycontroller.editSurvey);
// gget all surveys
router.get("/surveylist", authenticate, surveycontroller.getSurveyList);
// get all surveys of a fpo
router.get(
  "/fposurvey/:id",
  authenticate,
  surveycontroller.getSurveysByCreatedBy
);
// get a survey
router.get("/getsurvey/:id", authenticate, surveycontroller.getSurveyById);

router.get("/user/getsurvey/:id", Mem_auth, surveycontroller.getSurveyById);

router.post("/activate/:id", authenticate, surveycontroller.statusofsurvey);

router.post("/survey_collection", Mem_auth, surveycontroller.saveresponse);

router.post("/fpoServey", Mem_auth, surveycontroller.getsurveydata);

router.get("/sendSurveyNotifications", surveycontroller.sendnotificationdaily);

router.get(
  "/responses/:id",
  authenticate,
  surveycontroller.getResponsesBySurveyId
);

module.exports = router;
