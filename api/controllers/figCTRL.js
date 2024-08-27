const FIG_Detail = require("../models/FIGschema");
const leader_Req_Detail = require("../models/LeaderReqDetail");
const NewsGroup = require("../models/news-group-model");
const ContentCreator = require("../models/contentcreatorSchema");
const User = require("../models/userSchema");
const User_verification = require("../models/verify-Schema");

const multer = require("multer");
const Roles = require("../models/rolesSchema");
const LeaderandCreator = require("../models/leadercumcreatorschema");
const { sendFireBaseNOtificationFCM } = require("../fcmNotification");
const { pagination } = require("./pagination");

const { constants } = require("../constants");
const Language = require("../models/languageSchema");

var Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/fig");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({ storage: Storage });

// /creators cum leaders

const addContentCreatorcumleader = async (req, res) => {
  try {
    const { name, fpo, creatorId } = req.body;
    const getrole = await User.findById(creatorId).populate("role");

    const existingleadercumcreator = await LeaderandCreator.findOne({
      creatorId,
    });

    if (existingleadercumcreator) {
      if (getrole.Creator === 1 && getrole.Leader === 1) {
        return res.status(500).send({
          status: false,
          msg: "You are already a leader cum creator.",
        });
      }
    }

    const newContentCreator = new LeaderandCreator({
      name: `${getrole?.firstname} ${getrole?.lastname}`,
      fpo,
      creatorId,
      status: 0, // Status 0 for pending
    });

    console.log("getrole", getrole, "hduduud", getrole.role.role);

    let values;
    if (getrole.role?.role == "contentcreator") {
      values = { leaderRequest: 1 };
    } else {
      values = { creatorRequest: 1 };
    }

    const member = await User.findByIdAndUpdate(creatorId, values, {
      new: true,
      upsert: true,
    });

    const savedContentCreator = await newContentCreator.save();
    res.status(201).json({
      status: true,
      msg: "Request sent Successfully",
      data: savedContentCreator,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      status: false,
      msg: "failed to add creator/leader",
      error: "Failed to add Content Creator cum leader",
    });
  }
};

const editContentCreatorcumleaderStatus = async (req, res) => {
  try {
    const status = parseInt(req.params.status);
    const contentCreatorId = req.params.id;

    console.log(contentCreatorId, "contentCreatorId");
    const updatedContentCreator = await LeaderandCreator.findByIdAndUpdate(
      contentCreatorId,
      { status },
      { new: true }
    );

    if (!updatedContentCreator) {
      return res
        .status(404)
        .json({ error: "Content Creator/ Leader not found" });
    }

    const userId = updatedContentCreator.creatorId;

    const userfound = await User.findById(userId);

    if (!userfound) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the user in ContentCreators model
    const contentCreatorUser = await ContentCreator.findOne({
      creatorId: userId,
    });

    // Find the user in Leaders model
    const leaderUser = await leader_Req_Detail.findOne({ memberId: userId });

    console.log(status, contentCreatorId, userId, "============");

    let bodytext;

    // If the user is not found in ContentCreators model, add them
    if (!contentCreatorUser && status === 1) {
      const newUser = new ContentCreator({
        creatorId: userId /* other fields */,
        name: updatedContentCreator.name,
        fpo: updatedContentCreator.fpo,
        status: 1,
      });
      bodytext = "Leader and content creator profile activated!";
      await newUser.save();
    }

    // If the user is not found in Leaders model, add them
    if (!leaderUser && status === 1) {
      const newUser = new leader_Req_Detail({
        memberId: userId,
        name: updatedContentCreator.name,
        fpo: updatedContentCreator.fpo,
        phone: contentCreatorUser.phone,
        status: 1,
        approved: 1,
      });
      bodytext = "Leader and content creator profile activated!";
      await newUser.save();
    }

    console.log(status, "============");

    if (status === 1) {
      const rolec = await Roles.findOne({ role: "leadercumcreator" });
      // Update the role of the associated user to "leadercumcreator"
      await User.findByIdAndUpdate(userId, {
        role: rolec._id,
        Creator: 1,
        Leader: 1,
      });

      const updateUserAuth = await User.find({ _id: userId });
      updateUserAuth.forEach(async (ftoken) => {
        const language = await Language.findById(ftoken.language);
        const firebaseMessage = {
          title: `${
            language
              ? language?.file?.success_added_leadercumcreator
              : "Successfully added as Leader cum Creator"
          }`,
          body: `${
            language
              ? language?.file?.success_added_leadercumcreator_body
              : bodytext
          }`,
          // type: "leader-req",
          type: {
            _id: updateUserAuth._id,
            route: "leader-req",
          },
          action_type: "MAIN_ACTIVITY",
          // image: "https://picsum.photos/id/237/200/300",
        };
        const dataMsg = {
          title: `${
            language
              ? language?.file?.success_added_leadercumcreator
              : "Successfully added as Leader cum Creator"
          }`,
          body: `${
            language
              ? language?.file?.success_added_leadercumcreator_body
              : bodytext
          }`,
          type: {
            _id: updateUserAuth._id,
            route: "leader-req",
          },
          // type: "leader-req",
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
    } else if (status === 4) {
      const rolec = await Roles.findOne({ role: "member" });
      // Update the role of the associated user to "member"
      await User.findByIdAndUpdate(userId, {
        role: rolec._id,
        Creator: 0,
        Leader: 0,
      });
      await LeaderandCreator.findByIdAndDelete(contentCreatorId);
      await ContentCreator.findByIdAndDelete(contentCreatorUser._id);
      await leader_Req_Detail.findByIdAndDelete(leaderUser._id);
    } else if (status === 3) {
      const rolec = await Roles.findOne({ role: "leader" });
      console.log(rolec, "status === ", status);
      // Update the role of the associated user to "leader"
      await User.findByIdAndUpdate(userId, {
        role: rolec._id,
        Creator: 0,
        Leader: 1,
      });
      await LeaderandCreator.findByIdAndDelete(contentCreatorId);
      await ContentCreator.findByIdAndDelete(contentCreatorUser._id);
    } else if (status === 2) {
      const rolec = await Roles.findOne({ role: "contentcreator" });
      // Update the role of the associated user to "contentcreator"
      await User.findByIdAndUpdate(userId, {
        role: rolec._id,
        Creator: 1,
        Leader: 0,
      });
      await leader_Req_Detail.findByIdAndDelete(leaderUser._id);
      await LeaderandCreator.findByIdAndDelete(contentCreatorId);
    }

    res.status(200).json({
      status: true,
      msg: "Successfully updated creator cum leader",
      data: updatedContentCreator,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      status: false,
      msg: "failed to update creator/leader",
      error: "Failed to update Content Creator status",
    });
  }
};

const deleteContentCreatorcumleader = async (req, res) => {
  try {
    const contentCreatorId = req.params.id;

    // Find the content creator to get associated user ID
    const contentCreator = await LeaderandCreator.findById(contentCreatorId);

    if (!contentCreator) {
      return res
        .status(404)
        .json({ error: "Leader cum Content Creator not found" });
    }

    const userId = contentCreator.creatorId;

    const rolec = await Roles.findOne({ role: "member" });
    // Update the role of the associated user to "member"
    await User.findByIdAndUpdate(userId, {
      role: rolec._id,
      Creator: 0,
      Leader: 0,
    });

    // Delete the content creator
    const deletedContentCreator = await LeaderandCreator.findByIdAndDelete(
      contentCreatorId
    );

    if (!deletedContentCreator) {
      return res.status(404).json({ error: "Content Creator not found" });
    }

    res
      .status(200)
      .json({ status: true, msg: "Content Creator deleted successfully" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      status: false,
      msg: "failed to delete creator/leader",
      error: "Failed to delete creator/leader",
    });
  }
};

const getAllContentCreatorscumleader = async (req, res) => {
  try {
    const allCreators = await LeaderandCreator.find()
      .populate("creatorId")
      .populate("fpo");
    res.status(200).json({
      status: true,
      msg: "Content Creator fetched successfully",
      data: allCreators,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      status: false,
      msg: "Failed to fetch Content Creators",
      error: "Failed to fetch Content Creators",
    });
  }
};

const getContentCreatorscumleaderByFPO = async (req, res) => {
  try {
    const fpoId = req.params.fpoId; // Extract FPO ID from request parameters
    const limitQuery = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };

    const creatorsByFPO = await pagination(
      LeaderandCreator,
      LeaderandCreator.find({ fpo: fpoId })
        .populate("fpo")
        .populate("creatorId")
        .sort({ status: 1, createdAt: -1 }), // Sort by status ascending and createdAt descending
      limitQuery
    );

    // Fetch content creators based on FPO ID
    // const creatorsByFPO = await LeaderandCreator.find({ fpo: fpoId })
    //   .populate("fpo")
    //   .populate("creatorId")
    //   .sort({ status: 1 });

    res.status(200).json({ status: true, data: creatorsByFPO });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to fetch Content Creators" });
  }
};

// fig leader status
// accept/decline fig leader req
const updateFIG_leader = async (req, res) => {
  try {
    console.log(req.params.LeaderId, req.params.status);
    // 0 = unverified, 1 = verified, 2 = rejected
    const fig_leader = await leader_Req_Detail.findOneAndUpdate(
      { memberId: req.params.LeaderId },
      { status: req.params.status, approved: req.params.status }
    );
    const leaderid = fig_leader._id; // New leader ID of leader Data
    console.log(fig_leader);
    if (req.params.status == 2) {
      const roleid = await Roles.findOne({ role: "member" });

      const memberUpdate = await User.findByIdAndUpdate(
        { _id: req.params.LeaderId },
        {
          appliedLeader: 0,
          // Creator: 0,
          status: req.params.status,
          Leader: req.params.status,
          jwtToken: "",
          // role: roleid._id,
        }
      );
    }

    if (req.params.status == 0) {
      const roleid = await Roles.findOne({ role: "member" });

      const memberUpdate = await User.findByIdAndUpdate(
        { _id: req.params.LeaderId },
        {
          appliedLeader: 0,
          // Creator: 0,
          status: req.params.status,
          Leader: req.params.status,
          jwtToken: "",
          // role: roleid._id,
        }
      );
    }
    //     Creator

    const updateUserAuth = await User.find({
      _id: fig_leader.memberId,
    });

    let thumbnailUrl = `${constants.renderUrl}assets/img/logo.png`;
    let titleo;
    let bodytext;

    if (parseInt(req.params.status, 10) !== 1) {
      updateUserAuth.forEach(async (ftoken) => {
        const language = await Language.findById(ftoken.language);

        titleo = `${
          parseInt(req.params.status, 10) === 2
            ? `${
                language
                  ? language?.file?.accoun_status_blocked
                  : "Account Status Blocked"
              } `
            : parseInt(req.params.status, 10) === 0
            ? `${
                language
                  ? language?.file?.accoun_status_deactivated
                  : "Account Status Deactivated"
              } `
            : ""
        }`;
        bodytext = `${
          parseInt(req.params.status, 10) === 2
            ? `${
                language
                  ? language?.file?.leader_block
                  : "Your leader profile has been Blocked"
              }`
            : parseInt(req.params.status, 10) === 0
            ? `${
                language
                  ? language?.file?.leader_deactivated
                  : "Your leader profile has been Deactivated"
              }`
            : ""
        }.`;
        const firebaseMessage = {
          title: titleo,
          body: bodytext,
          // type: "leader-req",
          type: {
            _id: updateUserAuth._id,
            route: "leader-req",
          },
          action_type: "MAIN_ACTIVITY",
          imageUrl: thumbnailUrl,
          image: thumbnailUrl,
          // image: "https://picsum.photos/id/237/200/300",
        };
        const dataMsg = {
          title: titleo,
          body: bodytext,
          type: {
            _id: updateUserAuth._id,
            route: "leader-req",
          },
          imageUrl: thumbnailUrl,
          // type: "leader-req",
          action_type: "MAIN_ACTIVITY",
          image: thumbnailUrl,
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
    }
    // Leader

    if (req.params.status == 1) {
      const roleid = await Roles.findOne({ role: "leader" });

      const memberRoleUpdate = await User.findByIdAndUpdate(
        { _id: fig_leader.memberId },
        { role: roleid._id, Leader: 1, figPopup: 1, status: 1 },
        { returnDocument: "after" }
      );

      updateUserAuth.forEach(async (ftoken) => {
        const language = await Language.findById(ftoken.language);
        const firebaseMessage = {
          title: language ? language?.file?.congratulations : "Congratulations",
          body: language
            ? language?.file?.leader_activated_body
            : "Your leader profile has been activated...",
          // type: "",
          type: {
            _id: memberRoleUpdate._id,
            route: "leader-req",
          },

          action_type: "MAIN_ACTIVITY",
          // image: "https://picsum.photos/id/237/200/300",
        };
        const dataMsg = {
          title: language ? language?.file?.congratulations : "Congratulations",
          body: language
            ? language?.file?.leader_activated_body
            : "Your leader profile has been activated...",
          // type: "",
          type: {
            _id: memberRoleUpdate._id,
            route: "leader-req",
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
    }

    res.status(200).json({ Success: "Leader status updated" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating leader status" });
  }
};
// fig status
// block unblock FIG
const updateFIG_statusAdmin = async (req, res) => {
  try {
    // 0 = unverified, 1 = verified, 2 = rejected/block
    console.log(req.params);
    const figStatus = await FIG_Detail.findByIdAndUpdate(
      { _id: req.params.figId },
      {
        status: req.params.status,
      }
    );

    res.status(200).json({ Success: "FIG status updated", fig: figStatus });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating FIG status" });
  }
};
// get fig by id
const ListFIGById = async (req, res) => {
  try {
    const figList = await FIG_Detail.findById({ _id: req.params.id })
      .populate("leaderId")
      .populate("fpo");
    if (!figList) {
      return res.status(404).json("No FIG was found");
    }

    res.status(200).json(figList);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ msg: "An error Occured. Please Retry" });
  }
};
// get all fig
const ListAllFIGs = async (req, res) => {
  try {
    console.log("figList");
    const figList = await FIG_Detail.find().populate("leaderId");
    console.log(figList, "figList");
    if (figList.length === 0) {
      return res.status(404).json("No FIGs were found");
    }
    res.status(200).json(figList);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ msg: "An error occurred. Please retry" });
  }
};

const ListAllFIGsbyfpo = async (req, res) => {
  try {
    const id = req.params.id;
    // console.log("figList");
    const figList = await FIG_Detail.find({ fpo: id }).populate("leaderId");
    console.log(figList, "figList");
    if (figList.length === 0) {
      return res.status(404).json("No FIGs were found");
    }
    res.status(200).json(figList);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ msg: "An error occurred. Please retry" });
  }
};

// add new fig
const Add_New_FIG_Group = async (req, res) => {
  //validation for FIG leader
  try {
    console.log(req.user, req.body);
    const memberData = await User.findById({ _id: req.user._id }).populate(
      "role"
    );
    if (memberData.role.role !== "leader") {
      return res
        .status(500)
        .json({ msg: "Only verified Leaders can create FIG" });
    }

    const { name, location, latitude, longitude } = req.body;
    console.log("user found 1");
    let file;
    if (req.files) {
      file = req.files[0];
      console.log(req.files[0]);
      // const minioClient = new Minio.Client({
      //   endPoint: "objectstore.e2enetworks.net",
      //   useSSL: true,
      //   accessKey: "W8NB1D5QE228IJ0Q8NR9",
      //   secretKey: "M7S3YT7WGRKRJL1Z0U35RCIKIC46INTI3151PN7Z",
      // });

      // const objects = minioClient.fPutObject(
      //   "agripalcldstorage",
      //   "fig/" + file.filename,
      //   "fig/" + file.filename,
      //   function (e) {
      //     if (e) {
      //       console.log("error i got ", e);
      //       // console.log(fileName);
      //       FS.unlinkSync("fig/" + file.filename);
      //       return null;
      //     } else {
      //       console.log("Success");
      //       FS.unlinkSync("fig/" + file.filename);
      //       return true;
      //     }
      //   }
      // );
    }
    const Newfig = new FIG_Detail({
      name,
      location,
      leaderId: req.user._id,
      latitude,
      longitude,
      image: file ? file.key : null,
      fpo: memberData?.fpo.toString(),
    });

    await Newfig.save();
    console.log("user found 1");

    const FIGLeaderUpdate = await User.findByIdAndUpdate(
      { _id: req.user._id },
      {
        $push: {
          FIGOwned: Newfig._id,
        },
      }
    );

    console.log("user found 1");

    res.status(200).json({
      success: true,
      fig: Newfig,
      url: `https://agripalcldstorage.objectstore.e2enetworks.net/fig/`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      // fig: Newfig,
      error: error,
      // url: `https://agripalcldstorage.objectstore.e2enetworks.net/fig/`,
    });
  }
};
// update fig grp
const update_FIG_Group = async (req, res) => {
  const { name, location, latitude, longitude } = req.body;
  let file;
  if (req.files) {
    file = req.files[0];
    console.log(req.files[0]);
    // const minioClient = new Minio.Client({
    //   endPoint: "objectstore.e2enetworks.net",
    //   useSSL: true,
    //   accessKey: "W8NB1D5QE228IJ0Q8NR9",
    //   secretKey: "M7S3YT7WGRKRJL1Z0U35RCIKIC46INTI3151PN7Z",
    // });

    // const objects = minioClient.fPutObject(
    //   "agripalcldstorage",
    //   "fig/" + file.filename,
    //   "fig/" + file.filename,
    //   function (e) {
    //     if (e) {
    //       console.log("error i got ", e);
    //       // console.log(fileName);
    //       FS.unlinkSync("fig/" + file.filename);
    //       return null;
    //     } else {
    //       console.log("Success");
    //       FS.unlinkSync("fig/" + file.filename);
    //       return true;
    //     }
    //   }
    // );
  }
  const fig = await FIG_Detail.findById({ _id: req.params.id });
  const updatefig = await FIG_Detail.findByIdAndUpdate(
    { _id: req.params.id },
    {
      name,
      location,
      latitude,
      longitude,
      image: file ? file.key : fig.image,
    },
    { returnDocument: "after" }
  );

  res.json({
    success: " FIG was updated",
    fig: updatefig,
    url: `https://agripalcldstorage.objectstore.e2enetworks.net/fig/`,
  });
};

// fig leader reqs
const listAllFIG_leaderRequest = async (req, res) => {
  try {
    const fig_leaders = await leader_Req_Detail
      .find({
        $or: [{ status: 0 }, { status: 2 }],
      })
      .sort({ updatedAt: -1 })
      .populate("memberId");

    res.status(200).json(fig_leaders);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching FIG leader requests" });
  }
};

// for a single fpo
const listAllFIG_leaderRequestfpo = async (req, res) => {
  try {
    const id = req.params.id;
    const fig_leaders = await leader_Req_Detail
      .find({
        fpo: id,
        $or: [{ status: 0 }, { status: 2 }],
      })
      .sort({ updatedAt: -1 })
      .populate("memberId");

    res.status(200).json(fig_leaders);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching FIG leader requests" });
  }
};
// verified leader reqs
const listAll_verified_FIG_leader = async (req, res) => {
  try {
    const fig_leaders = await leader_Req_Detail
      .find({ $or: [{ status: 1 }] })
      .sort({ updatedAt: -1 })
      .populate("memberId")
      .populate("");

    res.status(200).json(fig_leaders);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching verified FIG leaders" });
  }
};
//verified leader for fpo
const listAll_verified_FIG_leader_fpo = async (req, res) => {
  try {
    const id = req.params.id;

    // const fig_leaders = await leader_Req_Detail
    //   .find({ fpo: id })
    //   .sort({ createdAt: -1 })
    //   .populate("memberId");

    const limitQuery = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };

    const fig_leaders = await pagination(
      leader_Req_Detail,
      leader_Req_Detail
        .find({ fpo: id })
        .sort({ status: 1, createdAt: -1 })
        .populate("memberId"),
      limitQuery
    );

    res.status(200).json(fig_leaders);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching verified FIG leaders" });
  }
};

const getFIGLeaderById = async (req, res) => {
  try {
    const figLeaderId = req.params.id; // Get the FIG leader's ID from the request parameters

    const figLeader = await User.findById(figLeaderId)
      .populate("FIGOwned")
      .populate("role");

    if (!figLeader) {
      return res.status(404).json({ error: "FIG leader not found" });
    }

    if (figLeader.role.role !== "leader") {
      return res.status(400).json({ error: "User is not a FIG leader" });
    }

    res.status(200).json(figLeader);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching FIG leader" });
  }
};

const addContentCreator = async (req, res) => {
  try {
    const { name, fpo, creatorId } = req.body;

    const newContentCreator = new ContentCreator({
      name,
      fpo,
      creatorId,
      status: 0, // Status 0 for pending
    });

    const savedContentCreator = await newContentCreator.save();
    res.status(201).json({
      status: true,
      msg: "request sent successfully",
      savedContentCreator,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      status: false,
      msg: "error occured",
      error: "Failed to add Content Creator",
    });
  }
};

const editContentCreatorStatus = async (req, res) => {
  try {
    const status = parseInt(req.params.status);
    const contentCreatorId = req.params.id;

    console.log(typeof status, "status **************************");

    const updatedContentCreator = await ContentCreator.findByIdAndUpdate(
      contentCreatorId,
      { status },
      { new: true }
    );

    console.log("updatedContentCreator", updatedContentCreator.creatorId);

    if (!updatedContentCreator) {
      return res.status(404).json({ error: "Content Creator not found" });
    }
    let thumbnailUrl = `${constants.renderUrl}assets/img/logo.png`;

    // If the status is changed to 1, update the role in the user table to "content creator"
    const userId = updatedContentCreator.creatorId.toString();
    if (status == 1) {
      const rolec = await Roles.findOne({ role: "contentcreator" });
      // Update the role of the associated user to "content creator"
      console.log("entered");
      await User.findByIdAndUpdate(userId, {
        role: rolec._id,
        Creator: 1,
        status: 1,
      });
      console.log("updated");
    }

    // If the status is changed to something other than 1, update the role in the user table to "member"
    if (status === 0 || status === 2) {
      const userId = updatedContentCreator.creatorId.toString();
      console.log(userId, "id ********");
      const rolec = await Roles.findOne({ role: "member" });
      // Update the role of the associated user to "member"
      await User.findByIdAndUpdate(userId, {
        // role: rolec._id,
        Creator: status,
        status: status === 2 ? 2 : 1,
        jwtToken: "",
      });
    }

    const updateUserAuth = await User.find({
      _id: userId,
    }).populate("language");

    updateUserAuth.forEach((ftoken) => {
      const firebaseMessage = {
        title: `${
          parseInt(req.params.status, 10) === 2
            ? `${
                ftoken.language
                  ? ftoken?.language?.file?.accoun_status_blocked
                  : "Account status Blocked"
              }`
            : parseInt(req.params.status, 10) === 0
            ? `${
                ftoken.language
                  ? ftoken?.language?.file?.accoun_status_blocked
                  : "Account status Deactivated"
              }`
            : parseInt(req.params.status, 10) === 1
            ? `${
                ftoken.language
                  ? ftoken?.language?.file?.congratulations
                  : "Congratulations"
              }`
            : ""
        }`,
        body: `${
          parseInt(req.params.status, 10) === 2
            ? `${
                ftoken.language
                  ? ftoken?.language?.file?.account_blocked
                  : "Your Account has been Blocked"
              }`
            : parseInt(req.params.status, 10) === 0
            ? `${
                ftoken.language
                  ? ftoken?.language?.file?.account_deactivated
                  : "Your Account has been Deactivated"
              }`
            : parseInt(req.params.status, 10) === 1
            ? `${
                ftoken.language
                  ? ftoken?.language?.file?.content_creator_accepted
                  : "Your Content Creator profile activated successfully,You can post news now!"
              }`
            : ""
        }.`,
        // type: "content-creator-req",
        type: {
          _id: updateUserAuth._id,
          route: "content-creator-req",
        },
        action_type: "MAIN_ACTIVITY",
        imageUrl: thumbnailUrl,
        image: thumbnailUrl,
        // image: "https://picsum.photos/id/237/200/300",
      };

      const dataMsg = {
        title: `${
          parseInt(req.params.status, 10) === 2
            ? `${
                ftoken.language
                  ? ftoken?.language?.file?.accoun_status_blocked
                  : "Account status Blocked"
              }`
            : parseInt(req.params.status, 10) === 0
            ? `${
                ftoken.language
                  ? ftoken?.language?.file?.accoun_status_blocked
                  : "Account status Deactivated"
              }`
            : parseInt(req.params.status, 10) === 1
            ? `${
                ftoken.language
                  ? ftoken?.language?.file?.congratulations
                  : "Congratulations"
              }`
            : ""
        }`,
        body: `${
          parseInt(req.params.status, 10) === 2
            ? `${
                ftoken.language
                  ? ftoken?.language?.file?.account_blocked
                  : "Your Account has been Blocked"
              }`
            : parseInt(req.params.status, 10) === 0
            ? `${
                ftoken.language
                  ? ftoken?.language?.file?.account_deactivated
                  : "Your Account has been Deactivated"
              }`
            : parseInt(req.params.status, 10) === 1
            ? `${
                ftoken.language
                  ? ftoken?.language?.file?.content_creator_accepted
                  : "Your Content Creator profile activated successfully,You can post news now!"
              }`
            : ""
        }.`,
        // type: "content-creator-req",
        type: {
          _id: updateUserAuth._id,
          route: "content-creator-req",
        },
        action_type: "MAIN_ACTIVITY",
        imageUrl: thumbnailUrl,
        image: thumbnailUrl,
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

    res.status(200).json({
      status: true,
      msg: "Successfully updated creator",
      updatedContentCreator,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      status: false,
      msg: "error occured",
      error: "Failed to update Content Creator status",
    });
  }
};

const deleteContentCreator = async (req, res) => {
  try {
    const contentCreatorId = req.params.id;

    // Find the content creator to get associated user ID
    const contentCreator = await ContentCreator.findById(contentCreatorId);

    if (!contentCreator) {
      return res.status(404).json({ error: "Content Creator not found" });
    }

    const userId = contentCreator.creatorId;

    const user = await User.findById(userId);
    console.log(user, "user////////");
    let rolec;

    if (user.Leader === 1) {
      rolec = await Roles.findOne({ role: "leader" });
    } else {
      rolec = await Roles.findOne({ role: "member" });
    }

    user.Creator = 0;
    user.role = rolec._id;
    user.jwtToken = "";

    await user.save();

    // const rolec = await Roles.findOne({ role: "member" });
    // Update the role of the associated user to "member"
    // await User.findByIdAndUpdate(userId, {
    //   role: rolec._id,
    //   Creator: 0,
    // });

    // Delete the content creator
    const deletedContentCreator = await ContentCreator.findByIdAndDelete(
      contentCreatorId
    );

    if (!deletedContentCreator) {
      return res.status(404).json({ error: "Content Creator not found" });
    }

    const docs = await LeaderandCreator.deleteMany({
      creatorId: contentCreator.creatorId,
    });

    res
      .status(200)
      .json({ status: true, msg: "Content Creator deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: false,
      msg: "Content Creator not deleted",
      error: "Failed to delete Content Creator",
    });
  }
};
const deleteLeader = async (req, res) => {
  try {
    const leaderId = req.params.id;

    // Find the content creator to get associated user ID
    const leader = await leader_Req_Detail.findById(leaderId);

    if (!leader) {
      return res.status(404).json({ error: "leader not found" });
    }
    console.log(leader, leader.memberId);

    const userId = leader.memberId;

    const user = await User.findById(userId);

    let rolec;

    if (user.Creator === 1) {
      rolec = await Roles.findOne({ role: "contentcreator" });
    } else {
      rolec = await Roles.findOne({ role: "member" });
    }

    user.Leader = 0;
    user.role = rolec._id;
    user.jwtToken = "";

    await user.save();
    // Update the role of the associated user to "member"
    // await User.findByIdAndUpdate(userId, {
    //   role: rolec._id,
    //   Leader: 0,
    // });

    // Delete the content creator
    const deletedleader = await leader_Req_Detail.findByIdAndDelete(leaderId);

    if (!deletedleader) {
      return res.status(404).json({ error: "leader not found" });
    }

    const createrId = user._id;

    console.log("MemberId String:", leader.memberId.toString());
    const docs = await LeaderandCreator.deleteMany({
      creatorId: leader.memberId,
    });
    console.log(createrId, "createrId");

    console.log(docs, "docs");

    res.status(200).json({ status: true, msg: "leader deleted successfully" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      status: false,
      msg: "leader not deleted",
      error: "Failed to delete leader",
    });
  }
};

const getAllContentCreators = async (req, res) => {
  try {
    const allCreators = await ContentCreator.find()
      .populate("creatorId")
      .populate("fpo");
    res.status(200).json({
      status: true,
      msg: "Content Creators found successfully",
      creatorsByFPO: allCreators,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      status: false,
      msg: "Content Creators not found",
      error: "Failed to fetch Content Creators",
    });
  }
};

const getContentCreatorsByFPO = async (req, res) => {
  try {
    const fpoId = req.params.fpoId; // Extract FPO ID from request parameters

    const limitQuery = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };

    const creatorsByFPO = await pagination(
      ContentCreator,
      ContentCreator.find({ fpo: fpoId })
        .populate("fpo")
        .populate("creatorId")
        .sort({ status: 1, createdAt: -1 }),
      limitQuery
    );

    // Fetch content creators based on FPO ID
    // const creatorsByFPO = await ContentCreator.find({ fpo: fpoId })
    //   .populate("fpo")
    //   .populate("creatorId");

    res
      .status(200)
      .json({ status: true, msg: "found creators", creatorsByFPO });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      status: false,
      msg: "error occured",
      error: "Failed to fetch Content Creators",
    });
  }
};

const updateUser_statusAdmin = async (req, res) => {
  try {
    // 0 = unverified, 1 = verified, 2 = rejected/block
    console.log(req.params);
    const figStatus = await User.findByIdAndUpdate(
      { _id: req.params.userid },
      {
        status: req.params.status,
        jwtToken: "",
      }
    );

    console.log(
      figStatus.firebaseToken,
      "status =================",
      typeof req.params.status,
      "figStatus========================="
    );

    const language = await Language.findById(figStatus.language);
    console.log(language);
    let title0 = `${
      parseInt(req.params.status, 10) === 2
        ? `${
            language
              ? language?.file?.accoun_status_blocked
              : "Account Status Blocked"
          }`
        : parseInt(req.params.status, 10) === 0
        ? `${
            language
              ? language?.file?.accoun_status_deactivated
              : "Account Status Deactivated"
          }`
        : parseInt(req.params.status, 10) === 1
        ? `${
            language
              ? language?.file?.accoun_status_activated
              : "Account Status activated"
          }`
        : "Changed"
    }`;
    let bodytext = `${
      parseInt(req.params.status, 10) === 2
        ? `${
            language
              ? language?.file?.blocked_successfully
              : "Blocked User Succesfully!!"
          }`
        : parseInt(req.params.status, 10) === 0
        ? `${
            language
              ? language?.file?.deactivated_successfully
              : "Deactivated User Succesfully!!"
          }`
        : parseInt(req.params.status, 10) === 1
        ? `${
            language
              ? language?.file?.activated_successfully
              : "Activated User Succesfully!!"
          }`
        : "Changed"
    }`;

    const firebaseMessage = {
      title: title0,
      body: bodytext,
      // type: "acc-status-change",
      type: {
        _id: figStatus._id,
        route: "acc-status-change",
      },
      action_type: "MAIN_ACTIVITY",
      // image: "https://picsum.photos/id/237/200/300",
    };

    const dataMsg = {
      title: title0,
      body: bodytext,
      // type: "acc-status-change",
      type: {
        _id: figStatus._id,
        route: "acc-status-change",
      },
      action_type: "MAIN_ACTIVITY",
      // image: "https://picsum.photos/id/237/200/300",
    };
    // const firetoken = [`${UserFtoken}`]

    sendFireBaseNOtificationFCM(
      [figStatus.firebaseToken],
      firebaseMessage,
      dataMsg
    );
    console.log(firebaseMessage, "firebaseMessage******************");
    res.status(200).json({ Success: "User status updated", User: figStatus });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating FIG status" });
  }
};

module.exports = {
  ListAllFIGs,
  ListFIGById,
  updateFIG_statusAdmin,
  updateFIG_leader,
  Add_New_FIG_Group,
  update_FIG_Group,
  listAllFIG_leaderRequest,
  listAll_verified_FIG_leader,
  getFIGLeaderById,
  upload,
  ListAllFIGsbyfpo,
  listAllFIG_leaderRequestfpo,
  listAll_verified_FIG_leader_fpo,
  addContentCreator,
  editContentCreatorStatus,
  deleteContentCreator,
  getAllContentCreators,
  getContentCreatorsByFPO,
  updateUser_statusAdmin,
  addContentCreatorcumleader,
  editContentCreatorcumleaderStatus,
  deleteContentCreatorcumleader,
  getAllContentCreatorscumleader,
  getContentCreatorscumleaderByFPO,
  deleteLeader,
};
