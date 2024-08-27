const jwt = require("jsonwebtoken");
// const User = require("../models/userSchema");
const User_verification = require("../models/verify-Schema");
const User = require("../models/userSchema");
const Admin = require("../models/adminSchema");
const FPO = require("../models/Fposchema");
const app_auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  // console.log(token, "token");

  if (!token) {
    return res
      .status(401)
      .json({ error: "Access token is missing or invalid" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id).populate("role");

    let userdetails;

    // console.log(user, "user");
    if (!user) {
      const adminuser = await Admin.findById(decoded.id);
      if (!user && !adminuser) {
        return res.status(403).send({ status: false, msg: "user not found " });
      }

      if (adminuser.isBlocked === true) {
        return res.status(403).json({
          error: "Your profile is blocked or deactivated",
        });
      }
      userdetails = adminuser;

      //   return res.status(403).json({ error: "You do not have User privileges" });
    }

    if (user) {
      if (token !== user.jwtToken) {
        return res.status(403).json({
          error: "Invalid Token",
          msg: "Invalid Token",
        });
      }
      if (user.status !== 1) {
        return res.status(403).json({
          error: "Your profile is blocked or deactivated",
        });
      }
      userdetails = user;
      const fpostatus = await FPO.findById(user.fpo);
      console.log(fpostatus, "fpostatus ==================================");

      if (fpostatus.isBlocked) {
        return res
          .status(403)
          .send({ status: false, msg: "Your FPO is Blocked" });
      }
    }
    req.user = userdetails;
    req.token = token;
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ error: "Access token is missing or invalid" });
  }
};

module.exports = app_auth;

// /user/allfpo
// /getroles
// survey/survey_collection
// survey/fpoServey
// news/news_group_list/: id
// fpo//fpoProfile/: id
// query/addquery
// radio/radio-topics
// /training_series_episode
// /user/get-all-news-cat-fpo
// /get-news/65c71c35df08673ffe6e1422
// /language/:id
// /leader-creators/add
// /like-report
// /user/get-all-news-cat-fpo
// /fponotifications
// /user/all-radioCats
