const Admin = require("../models/adminSchema");
const Survey = require("../models/survey");
const Response = require("../models/responseSchema");
const User = require("../models/userSchema");
const { pagination } = require("./pagination");
const Roles = require("../models/rolesSchema");
const { sendFireBaseNOtificationFCM } = require("../fcmNotification");
const cron = require("node-cron");

// create new survey
const createSurvey = async (req, res) => {
  const { title, questions, adminid } = req.body;
  console.log(req.body);
  try {
    const admin = await Admin.findById(adminid).populate("fpo");
    if (!admin) {
      return res.status(500).send({ msg: "Admin not found" });
    }

    const leaderrolename = await Roles.findOne({
      role: "leader",
    });

    const leadercumcreatorrolename = await Roles.findOne({
      role: "leadercumcreator",
    });

    let newSurvey;
    let leaderrole;

    if (admin.role === "superadmin") {
      newSurvey = new Survey({
        title,
        questions,
        responses: 0,
        createdBy: adminid,
        globalsurvey: true,
      });
      leaderrole = await User.find({
        $or: [
          { role: leaderrolename._id },
          { role: leadercumcreatorrolename._id },
        ],
      }).populate("language");
    } else {
      newSurvey = new Survey({
        title,
        questions,
        responses: 0,
        createdBy: adminid,
        fpo: admin.fpo._id,
      });
      leaderrole = await User.find({
        $and: [
          {
            $or: [
              { role: leaderrolename._id },
              { role: leadercumcreatorrolename._id },
            ],
          },
          {
            fpo: admin.fpo._id,
          },
        ],
      }).populate("language");
    }

    const savedSurvey = await newSurvey.save();

    // const updateUserAuth = await User.find({
    //   _id: fig_leader.memberId,
    // }).select("firebaseToken");

    leaderrole.forEach((ftoken) => {
      const firebaseMessage = {
        title: `${newSurvey.title}`,
        body: `${
          ftoken?.language
            ? ftoken?.language?.file?.please_fill_survey
            : "Please fill"
        } ${newSurvey.title} ${
          ftoken.language
            ? ftoken?.language?.file?.survey_req_better
            : "survey to know your requirements better."
        }`,
        // type: "survey-created",
        type: {
          _id: savedSurvey._id,
          route: "survey-created",
        },
        action_type: "MAIN_ACTIVITY",
        // image: "https://picsum.photos/id/237/200/300",
      };
      const dataMsg = {
        title: `${newSurvey.title}`,
        body: `${
          ftoken?.language
            ? ftoken?.language?.file?.please_fill_survey
            : "Please fill"
        } ${newSurvey.title} ${
          ftoken?.language
            ? ftoken?.language?.file?.survey_req_better
            : "survey to know your requirements better."
        }`,
        // type: "survey-created",
        type: {
          _id: savedSurvey._id,
          route: "survey-created",
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
    res.status(200).send(savedSurvey);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create the survey" });
  }
};

const sendnotificationdaily = async () => {
  try {
    // Find all surveys
    const surveys = await Survey.find();

    const leaderole = await Roles.find({
      $or: [{ role: "leader" }, { role: "leadercumcreator" }],
    }).select("_id");

    const rolesleader = leaderole.map((el) => el._id);

    console.log(leaderole, "leaderole");

    // Loop through each survey and send notifications to users who haven't filled it
    for (const survey of surveys) {
      let usersNotSubmitted;

      if (survey.globalsurvey === true) {
        usersNotSubmitted = await User.find({
          // fpo: survey.fpo,
          role: { $in: rolesleader },
          _id: { $nin: survey.submittedby },
        }).select("firebaseToken");
      } else {
        usersNotSubmitted = await User.find({
          fpo: survey.fpo,
          role: { $in: rolesleader },
          _id: { $nin: survey.submittedby },
        }).select("firebaseToken");
      }

      console.log(
        usersNotSubmitted,
        survey.title,
        survey.globalsurvey,
        "usersNotSubmitted"
      );

      // Send notifications to users who have not submitted the survey
      usersNotSubmitted.forEach((user) => {
        const firebaseMessage = {
          title: `${survey.title}`,
          body: `${
            user?.language
              ? user?.language?.file?.please_complete_survey_1
              : "Please complete"
          } ${survey?.title} ${
            user?.language
              ? user?.language?.file?.please_complete_survey_2
              : "survey."
          }`,
          // body: `Please complete "${survey.title}" survey.`,
          // type: "survey-reminder",
          type: {
            _id: survey._id,
            route: "survey-reminder",
          },
          action_type: "MAIN_ACTIVITY",
        };

        const dataMsg = {
          title: `${survey.title}`,
          body: `${
            user?.language
              ? user?.language?.file?.please_complete_survey_1
              : "Please complete"
          } ${survey.title} ${
            user?.language
              ? user?.language?.file?.please_complete_survey_2
              : "survey."
          }`,
          // type: "survey-reminder",
          type: {
            _id: survey._id,
            route: "survey-reminder",
          },
          action_type: "MAIN_ACTIVITY",
        };

        sendFireBaseNOtificationFCM(
          [user.firebaseToken],
          firebaseMessage,
          dataMsg
        );
      });
    }

    console.log("Survey notifications sent successfully");
  } catch (error) {
    console.error("Error sending survey notifications:", error);
  }
};

const editSurvey = async (req, res) => {
  const { title, questions } = req.body;
  const surveyId = req.params.id;

  try {
    const updatedSurvey = await Survey.findByIdAndUpdate(
      surveyId,
      {
        title,
        questions,
      },
      { new: true }
    );

    if (!updatedSurvey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    const leaderole = await Roles.find({
      $or: [{ role: "leader" }, { role: "leadercumcreator" }],
    }).select("_id");

    const rolesleader = leaderole.map((el) => el._id);

    let userstosend;

    if (updatedSurvey.globalsurvey === true) {
      userstosend = await User.find({
        // fpo: updatedSurvey.fpo,
        role: { $in: rolesleader },
      });
    } else {
      userstosend = await User.find({
        fpo: updatedSurvey.fpo,
        role: { $in: rolesleader },
      });
    }

    userstosend.forEach((ftoken) => {
      const firebaseMessage = {
        title: `${updatedSurvey.title}`,
        body: `${
          ftoken?.language
            ? ftoken?.language?.file?.please_fill_survey
            : "Please fill"
        } ${updatedSurvey.title} ${
          ftoken?.language
            ? ftoken?.language?.file?.survey_req_better
            : "survey to know your requirements better."
        }`,
        // type: "survey-created",
        type: {
          _id: updatedSurvey._id,
          route: "survey-created",
        },
        action_type: "MAIN_ACTIVITY",
        // image: "https://picsum.photos/id/237/200/300",
      };
      const dataMsg = {
        title: `${updatedSurvey.title}`,
        body: `${
          ftoken?.language
            ? ftoken?.language?.file?.please_fill_survey
            : "Please fill"
        } ${updatedSurvey.title} ${
          ftoken?.language
            ? ftoken?.language?.file?.survey_req_better
            : "survey to know your requirements better."
        }`,
        // type: "survey-created",
        type: {
          _id: updatedSurvey._id,
          route: "survey-created",
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

    res.status(200).json(updatedSurvey);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to edit the survey", error2: error });
  }
};

// get survey list
const getSurveyList = async (req, res) => {
  try {
    const limitQuery = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };
    const Surveys = await pagination(
      Survey,
      Survey.find()
        .populate("createdBy", "-password")
        .populate("fpo")
        .sort({ createdAt: -1 }),
      limitQuery
    );
    // const Surveys = await Survey.find()
    //   .populate("createdBy", "-password")
    //   .populate("fpo");
    res.status(200).send({ Surveys });
  } catch (error) {
    res.status(500).json({ Error: "Error while fetching admin list" });
  }
};

const getSurveysByCreatedBy = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);

    const limitQuery = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };
    const Surveys = await pagination(
      Survey,
      Survey.find({
        $or: [{ createdBy: id }],
      })
        .populate("createdBy", "-password")
        .populate("fpo")
        .sort({ createdAt: -1 }),
      limitQuery
    );

    // const Surveys = await Survey.find({
    //   $or: [{ createdBy: id }, { globalsurvey: true }],
    // })
    //   .populate("createdBy", "-password")
    //   .populate("fpo")
    //   .sort({ createdAt: -1 });
    console.log(Surveys);
    res.status(200).send({ Surveys });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error while fetching surveys by createdBy" });
  }
};

const statusofsurvey = async (req, res) => {
  try {
    const { id } = req.params;
    const { activate } = req.body;

    const survey = await Survey.findOneAndUpdate(
      { _id: id },
      { status: activate },
      { new: true }
    );

    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    res.status(200).send(survey);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getSurveyById = async (req, res) => {
  try {
    const surveyId = req.params.id; // Get the survey ID from the request parameters
    console.log(surveyId);
    const survey = await Survey.findById(surveyId).populate("fpo").populate({
      path: "submittedby",
      model: "User",
    });

    if (!survey) {
      return res
        .status(404)
        .json({ status: false, msg: "Survey not found", data: [] });
    }

    res.status(200).json({ status: true, msg: "success", data: survey });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch the survey" });
  }
};

const saveresponse = async (req, res) => {
  try {
    const { submittedByUserId, filledfor, surveyId, response } = req.body;

    // Check if the user has already submitted the survey
    const survey = await Survey.findById(surveyId);

    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }
    const user = await User.findById(submittedByUserId).populate("role");

    if (!user) {
      return res
        .status(500)
        .send({ error: "user not found who is filling the form" });
    }

    if (
      user.role.role !== "leader" &&
      user.role.role !== "member" &&
      user.role.role !== "leadercumcreator"
    ) {
      return res
        .status(500)
        .send({ error: "You are not allowed to fll the Survey" });
    }

    const filledforuser = await User.findById(filledfor);

    if (!filledforuser && filledfor) {
      return res
        .status(500)
        .send({ error: "user not found for which you are filling form" });
    }
    console.log(user.role.role);
    if (user.role.role !== "leader" && user.role.role !== "leadercumcreator") {
      if (survey.submittedby.includes(submittedByUserId)) {
        return res
          .status(400)
          .json({ error: "User already responded to this survey" });
      }
    }

    // Update the Survey model with the new response
    survey.responses += 1;
    survey.submittedby.push(submittedByUserId);

    await survey.save();

    // Save the response in the Response model
    const surveyResponse = new Response({
      submittedByUserId,
      surveyId,
      response,
      filledfor: filledfor ? filledfor : null,
    });

    const savedresponse = await surveyResponse.save();

    if (filledforuser) {
      filledforuser?.surveyResponses.push({
        survey: surveyId,
        response: savedresponse._id,
      });

      await filledforuser.save();
    }

    res
      .status(201)
      .json({ status: true, msg: "Survey response saved successfully" });
  } catch (error) {
    console.error("Error saving survey response:", error);
    res.status(500).json({ error: "Error saving survey response" });
  }
};

const getsurveydata = async (req, res) => {
  try {
    const userId = req.body.userId;
    const fpoId = req.body.fpoId;

    // Fetch user details
    const user = await User.findById(userId).populate("surveyResponses");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const limitQuery = {
      page: req.body.page || 1,
      limit: req.body.limit || 10,
    };

    const allSurveys = await pagination(
      Survey,
      Survey.find({
        $or: [{ fpo: fpoId }, { globalsurvey: true }],
        status: true,
      })
        .populate("fpo")
        .sort({ createdAt: -1 }),
      limitQuery
    );

    const count = await Survey.countDocuments({
      $or: [{ fpo: fpoId }, { globalsurvey: true }],
      status: true,
    });

    // Construct the response object
    const responseData = {
      status: true,
      msg: "all survey data",
      data: {
        allSurveys: allSurveys.results,
        filledSurveys: [],
        unfilledSurveys: [],
      },
      total_count: allSurveys.totalRecord,
    };

    // Populate allSurveys field with details of all surveys
    console.log("hello");
    allSurveys.results.forEach((survey) => {
      console.log("Inside the loop");
      const userResponse = user.surveyResponses.find((response) => {
        console.log(
          survey._id.toString() === response.survey.toString(),
          survey._id.toString(),
          "===",
          response.survey.toString(),
          typeof response.survey,
          typeof survey._id
        );
        return response.survey.toString() === survey._id.toString();
      });
      console.log("After finding userResponse");
      const surveyData = {
        surveyId: survey._id,
        title: survey.title,
        responses: userResponse ? userResponse.response : null,
      };

      if (userResponse) {
        responseData.data.filledSurveys.push(surveyData);
      } else {
        responseData.data.unfilledSurveys.push(surveyData);
      }
    });

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching user surveys:", error.message);
    res.status(500).json({ error: "Error fetching user surveys" });
  }
};

const getResponsesBySurveyId = async (req, res) => {
  //   submittedByUserId
  // surveyId
  try {
    const surveyId = req.params.id;
    const responses = await Response.find({ surveyId })
      .populate("submittedByUserId")
      .populate("filledfor")
      .populate("surveyId")
      .sort({ createdAt: -1 });

    if (!responses || responses.length === 0) {
      return res
        .status(404)
        .json({ error: "Responses not found for the given survey ID" });
    }

    res.status(200).json(responses);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to fetch responses" });
  }
};

cron.schedule("0 9 * * *", () => {
  console.log("Running the survey notification job...");
  sendnotificationdaily();
});

// cron.schedule("*/10 * * * * *", () => {
//   console.log("Running the survey notification job every 10 seconds...");
//   sendnotificationdaily();
// });

module.exports = {
  createSurvey,
  getSurveyList,
  statusofsurvey,
  getSurveysByCreatedBy,
  getSurveyById,
  editSurvey,
  saveresponse,
  getsurveydata,
  getResponsesBySurveyId,
  sendnotificationdaily,
};
