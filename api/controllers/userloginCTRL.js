const User = require("../models/userSchema");
const User_verification = require("../models/verify-Schema");
const { generateOTP } = require("./otpCtrl");
var request = require("request");
const jwt = require("jsonwebtoken");
const FS = require("fs");
const Minio = require("minio");
const path = require("path");
const leader_Req_Detail = require("../models/LeaderReqDetail");
const FIG_Detail = require("../models/FIGschema");
const multer = require("multer");
const Radio_Record = require("../models/radioSchema");
const Survey = require("../models/survey");
const News = require("../models/news_schema");
const FPO = require("../models/Fposchema");
const Roles = require("../models/rolesSchema");
const ContentCreator = require("../models/contentcreatorSchema");
const NewsGroup = require("../models/news-group-model");
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

const logoutapi = async (req, res) => {
  try {
    const { id } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res
        .status(500)
        .send({ status: false, msg: "user not found", data: {} });
    }

    user.firebaseToken = "";
    user.jwtToken = "";

    await user.save();

    res.status(200).send({ status: true, msg: "logged out successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ status: false, msg: "Some error occurred", data: error });
  }
};

const commonSendOtp = async (req, res) => {
  const { phone } = req.body;
  const method = req.params.method;
  var otp = generateOTP();
  var message = `Dear User your Code is: ${otp} Thank you MSMIND`;
  var apiKey = "2A330-4807A";
  var username = "SHOULD";
  var apiRequest = "Text";
  var senderId = "MSMlND";
  var apiRoute = "TRANS";
  var TEMPLATEID = "1507164378545227889";
  if (method == "login") {
    const member = await User.findOne({ phone: phone });
    console.log("login otp", member);

    if (!member)
      return res.status(500).json({
        status: false,
        msg: "Please register before login",
        data: {},
      });

    const newmember = await User.findOneAndUpdate(
      {
        phone: phone,
      },
      {
        otp: otp,
      },
      { new: true, upsert: true }
    );

    const fpo = await FPO.findById(member.fpo);
    // console.log(fpo, member.fpo);

    // var datass = `username=${username}&apikey=${apiKey}&apirequest=${apiRequest}&sender=${senderId}&mobile=${phone}&message=${message}&route=${apiRoute}&TemplateID=${TEMPLATEID}&format=JSON`;
    var url = `https://alots.in/sms-panel/api/http/index.php?username=SHOULD&apikey=2A330-4807A&apirequest=Text&sender=MSMlND&mobile=${phone}&message=Dear User your Password is: ${otp} Agripal Finance Friend Thank you MSMIND&route=TRANS&TemplateID=1507164378545227889&format=JSON`;
    // var mydatass = encodeURIComponent(datass);
    // var url = `https://alots.in/sms-panel/api/http/index.php?${datass}`;
    // console.log(url);
    url = url.replace(/ /g, "%20");

    console.log("url", url);

    request(url, function (error, response) {
      if (error) {
        console.log(error);
        return res.json(error);
      } else {
        console.log(response.body);
        // return resolve(response);
        res.json({
          status: true,
          msg: "Otp sent successfull",
          data: { otp: otp, fpodetails: fpo },
        });
      }
    });
    // res.json({
    //   status: true,
    //   msg: "Otp sent successfull",
    //   data: { otp: otp, fpodetails: fpo },
    // });
    // res.json({ Success: "Otp sent successfull", otp: "1234" })
  } else if (method == "register") {
    console.log("req.body", req.body);
    const { phone } = req.body;
    console.log("otp", otp);
    const member = await User.findOne({ phone: phone });
    if (member) {
      console.log("member", member, member?.otpVerified);
      if (member?.otpVerified == 0) {
        const newmember = await User.findOneAndUpdate(
          {
            phone: phone,
          },
          {
            otp: otp,
          },
          { new: true, upsert: true }
        );
        return res.json({
          status: true,
          msg: "Otp sent successfull",
          data: { otp: otp },
        });
      }

      return res
        .status(500)
        .json({ status: false, msg: "User Already registered", data: {} });
    }

    const newmember = await User.create({
      phone: phone,
      otp: otp,
    });
    console.log(newmember);

    // res.json({ Success: "Otp sent successfull", otp: "1234" })
    var url = `https://alots.in/sms-panel/api/http/index.php?username=SHOULD&apikey=2A330-4807A&apirequest=Text&sender=MSMlND&mobile=${phone}&message=Dear User your Password is: ${otp} Agripal Finance Friend Thank you MSMIND&route=TRANS&TemplateID=1507164378545227889&format=JSON`;
    // var datass = `username=${username}&apikey=${apiKey}&apirequest=${apiRequest}&sender=${senderId}&mobile=${phone}&message=${message}&route=${apiRoute}&TemplateID=${TEMPLATEID}&format=JSON`;
    // // var mydatass = encodeURIComponent(datass);
    // var url = `https://alots.in/sms-panel/api/http/index.php?${datass}`;
    // console.log(url);

    request(url, function (error, response) {
      if (error) {
        console.log(error);
        return res.json(error);
      } else {
        console.log(response.body);
        // return resolve(response);
        res.json({
          status: true,
          msg: "Otp sent successfull",
          data: { otp: otp },
        });
      }
    });
  } else if (method == "resend") {
    const member = await User.findOne({ phone: phone });
    console.log("login otp", otp);

    if (!member)
      return res.status(500).json({
        status: false,
        msg: "Your account doesn't exist",
        data: {},
      });

    const fpo = await FPO.findById(member.fpo);

    console.log(fpo);

    const newmember = await User.findOneAndUpdate(
      {
        phone: phone,
      },
      {
        otp: otp,
      },
      { new: true, upsert: true }
    );

    // var datass = `username=${username}&apikey=${apiKey}&apirequest=${apiRequest}&sender=${senderId}&mobile=${phone}&message=${message}&route=${apiRoute}&TemplateID=${TEMPLATEID}&format=JSON`;
    var url = `https://alots.in/sms-panel/api/http/index.php?username=SHOULD&apikey=2A330-4807A&apirequest=Text&sender=MSMlND&mobile=${phone}&message=Dear User your Password is: ${otp} Agripal Finance Friend Thank you MSMIND&route=TRANS&TemplateID=1507164378545227889&format=JSON`;
    // var mydatass = encodeURIComponent(datass);
    // var url = `https://alots.in/sms-panel/api/http/index.php?${datass}`;
    // console.log(url);
    url = url.replace(/ /g, "%20");

    console.log("url", url);

    request(url, function (error, response) {
      if (error) {
        console.log(error);
        return res.json(error);
      } else {
        console.log(response.body);
        // return resolve(response);
        res.json({
          status: true,
          msg: "Otp sent successfull",
          data: { otp: otp, fpodetails: fpo },
        });
      }
    });
    // res.json({
    //   status: true,
    //   msg: "Otp sent successfull",
    //   data: { otp: otp, fpodetails: fpo },
    // });
  } else {
    res.status(500).json({
      status: false,
      msg: "Please pass proper method of send-otp",
      data: {},
    });
  }
};

const CommonRegister = async (req, res) => {
  try {
    const {
      phone,
      code,
      firstname,
      lastname,
      firebaseToken,
      fpoid,
      role,
      language,
    } = req.body;

    const roleid = await Roles.findById(role);
    console.log("roleid", roleid);
    if (!roleid) {
      return res
        .status(500)
        .json({ status: false, msg: "Role not found", data: {} });
    }

    const getOTP = await User.findOne({ phone: phone });
    const fpomatch = await FPO.findById(fpoid);
    //verfiy code pending
    if (code != getOTP.otp) {
      // if (code != '1234') {
      return res
        .status(500)
        .json({ status: false, msg: "Incorrect Otp", data: {} });
    }
    if (!firebaseToken || firebaseToken == "") {
      return res.status(500).json({
        status: false,
        msg: "Please enter valid firebaseToken",
        data: {},
      });
    }
    if (!fpomatch) {
      return res
        .status(500)
        .json({ status: false, msg: "FPO not found", data: {} });
    }

    // const getMobileUser = await User.find({ phone: phone }).countDocuments().exec();

    // if (getMobileUser > 0) {
    //     return res.status(406).json({ msg: "Mobile number already registered" })
    // }

    const member = await User.findOneAndUpdate(
      {
        phone: phone,
      },
      {
        phone: phone,
        language: language,
        firstname: firstname,
        lastname: lastname,
        fpo: fpoid,
        role: role,
        otpVerified: 1,
        firebaseToken,
        creatorRequest: roleid?.role == "contentcreator" ? 1 : 0,
        leaderRequest: roleid?.role == "leader" ? 1 : 0,
      },
      { new: true, upsert: true }
    );

    fpomatch.members = fpomatch.members + 1;

    const token = jwt.sign(
      {
        id: member._id,
      },
      process.env.JWT_SECRET_KEY
    );

    getOTP.jwtToken = token;

    await getOTP.save();

    // res.status(200).json({Success: "Login successfull" });
    let contentCreator = {};
    let leaderdet = {};

    if (roleid.role === "contentcreator") {
      // Check if a ContentCreator document already exists for the member
      contentCreator = await ContentCreator.findOne({ creatorId: member._id });

      if (!contentCreator) {
        // Create a new ContentCreator document
        contentCreator = await ContentCreator.create({
          creatorId: member._id,
          fpo: fpoid,
          name: member.firstname,
        });
      }
    }
    if (roleid.role === "leader") {
      // Check if a ContentCreator document already exists for the member
      leaderdet = await leader_Req_Detail.findOne({ memberId: member._id });

      if (!leaderdet) {
        // Create a new leaderdet document
        leaderdet = await leader_Req_Detail.create({
          memberId: member._id,
          fpo: fpoid,
          name: `${member.firstname} ${member.lastname}`,
        });
      }
    }

    const user2 = await User.find({
      phone: phone,
    }).populate("role");

    res.status(200).json({
      status: true,
      msg: "Login successfull",
      data: {
        user: member,
        user2,
        roleinfo: roleid,
        token,
        fpodetails: fpomatch,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

const Common_Login = async (req, res) => {
  try {
    const { phone, code, firebaseToken } = req.body;
    // Direct member login with OTP without verify by admin

    const getOTP = await User.find({ phone: phone }).select("otp");
    const user2 = await User.find({ phone: phone }).populate("role");
    // const fpomatch = await FPO.findById(fpoid);

    if (code != getOTP[0].otp) {
      return res
        .status(406)
        .json({ status: false, msg: "Incorrect OTP", data: {} });
    }
    if (!firebaseToken || firebaseToken === "") {
      return res.status(406).json({
        status: false,
        msg: "Please enter valid firebaseToken",
        data: {},
      });
    }
    const user = await User.findOne({ phone: phone });

    console.log(user.fpo, user);

    const fpomatch = await FPO.findById(user.fpo);

    // if (!fpomatch) {
    //   return res.status(500).json({ msg: "FPO not found" });
    // }

    if (user && user.status == 0) {
      return res.status(406).json({
        status: false,
        msg: "You are not authorized to access",
        data: {},
      });
    }

    if (user) {
      //jwt sign here
      const token = jwt.sign(
        {
          id: user._id,
        },
        process.env.JWT_SECRET_KEY
      );

      user.jwtToken = token;
      user.firebaseToken = firebaseToken;
      await user.save();

      res.status(200).json({
        status: true,
        msg: "Login successful",
        data: { user: user, user2: user2, token, fpodetails: fpomatch },
      });
    } else {
      res.status(406).json({
        status: false,
        msg: "Please register before Login",
        data: {},
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: false,
      msg: "Please enter the phone number again",
      data: {},
    });
  }
};

const FIG_leader_Request_verificaiton = async (req, res) => {
  try {
    const { name, phone } = req.body;
    console.log(req.user, "user of req");

    const memberUpdate = await User.findByIdAndUpdate(
      { _id: req.user._id },
      {
        appliedLeader: 1,
      }
    );

    const newLeaderFIG = new leader_Req_Detail({
      phone,
      name,
      memberId: req.user._id,
      fpo: memberUpdate?.fpo,
    });
    await newLeaderFIG.save();

    res.json({ success: "Your request was submitted successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ msg: "An error Occured .Please fill form again " });
  }
};

const getroles = async (req, res) => {
  try {
    const roles = await Roles.find({
      _id: { $ne: "65aa61d48e701e3a7826fc82" },
    });
    res.status(200).send({ roles });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
};

// const getbanners = async (req, res) => {
//   try {
//     const { id } = req.body;

//     const fpo = await FPO.findById(id);

//     if (!fpo) {
//       return res.status(500).send({ status: false, msg: "FPO not found" });
//     }

//     const banners = fpo.theme.banner;

//     res.status(200).send({
//       status: true,
//       msg: "Banners fetched successfully",
//       data: banners,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ status: false, msg: "server error", error });
//   }
// };

const getrolesbyname = async (req, res) => {
  try {
    const roles = await Roles.findOne({
      role: req.params.name,
    });
    res.status(200).send({ roles });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
};

const getrolebyid = async (req, res) => {
  try {
    const roles = await Roles.findOne({ role: req.params.id });
    res.status(200).send({ roles });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
};

// home api
const homepagedetails = async (req, res) => {
  try {
    const userid = req.params.id;
    const user = await User.findById(userid).populate("fpo role");
    console.log(userid);
    const leaderrole = await Roles.findOne({ role: "leader" });

    if (!user) {
      return res.status(500).send({ msg: "No users found " });
    }
    const fpo = user.fpo;
    // find news for fpo
    const newsoffpo = await News.find({ fpo: user.fpo._id, status: 1 })
      .populate("postedUserId")
      .populate("newsGroup")
      .populate("fpo")
      .populate("postedUserId")
      .sort({ createdAt: -1 });

    const newsGroups = await NewsGroup.find({ fpo: user.fpo._id })
      .populate("memberId")
      .populate("fpo")
      .sort({ createdAt: -1 });
    const radios = await Radio_Record.find({ fpo: user.fpo._id }).populate(
      "radioCategory"
    );
    const fpoleaders = await User.countDocuments({
      role: leaderrole._id,
      fpo: fpo,
    });

    const banners = user.fpo.theme.banner;

    // const urls = {
    //   fpo: `${constants.frontUrl}uploads/fpo/`,
    //   banner: `${constants.frontUrl}uploads/banner/`,
    //   radio: `${constants.frontUrl}uploads/radio/`,
    //   fig: `${constants.frontUrl}uploads/fig/`,
    //   languages: `${constants.frontUrl}uploads/languages/`,
    //   news: `${constants.frontUrl}uploads/news/`,
    //   notifications: `${constants.frontUrl}uploads/notifications/`,
    //   profile: `${constants.frontUrl}uploads/profile/`,
    // };
    const urls = {
      fpo: `${constants.renderUrl2}`,
      banner: `${constants.renderUrl2}`,
      radio: `${constants.renderUrl2}`,
      fig: `${constants.renderUrl2}`,
      languages: `${constants.renderUrl2}`,
      news: `${constants.renderUrl2}`,
      notifications: `${constants.renderUrl2}`,
      profile: `${constants.renderUrl2}`,
    };
    // console.log(
    //   user.role._id === leaderrole._id,
    //   leaderrole._id,
    //   "===",
    //   user.role._id
    // );
    if (user.role._id === leaderrole._id) {
      const surveys = await Survey.find({ fpo: user.fpo._id }).populate(
        "createdBy"
      );
      res.status(200).send({
        status: true,
        msg: "Successfull",
        data: { user, fpo, surveys, urls, newsoffpo, radios, banners },
      });
    } else {
      res.status(200).send({
        status: true,
        msg: "Successfull",
        data: {
          user,
          fpo,
          newsoffpo,
          newsGroups,
          radios,
          banners,
          urls,
          fig: fpoleaders,
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
};

//  get all surveys for a fpo for user

const getsurveysforuser = async (req, res) => {
  try {
    // /send fpo id
    const id = req.params.id;
    const surveys = await Survey.find({ fpo: id }).populate("createdBy");
    res.status(200).send({ surveys });
  } catch (error) {
    console.log(error);
    res.status("500").send({ error });
  }
};

const editlanguage = async (req, res) => {
  try {
    // /send fpo id
    // const  = req.params.id;
    const { id, userid } = req.body;
    const language = await Language.findById(id);
    if (!language) {
      return res.status(500).send({ status: false, msg: "language not found" });
    }

    const user = await User.findById(userid);
    if (!user) {
      return res.status(500).send({ status: false, msg: "user not found" });
    }

    user.language = language._id;

    await user.save();

    res
      .status(200)
      .send({ status: true, msg: "language updated successfully" });
  } catch (error) {
    console.log(error);
    res.status("500").send({ status: false, msg: "server error", error });
  }
};

module.exports = {
  CommonRegister,
  commonSendOtp,
  Common_Login,
  FIG_leader_Request_verificaiton,
  upload,
  getroles,
  homepagedetails,
  getsurveysforuser,
  getrolebyid,
  getrolesbyname,
  logoutapi,
  editlanguage,
  // getbanners,
};
