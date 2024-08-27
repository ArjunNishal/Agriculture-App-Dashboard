const jwt = require("jsonwebtoken");
// const User = require("../models/userSchema");
const User_verification = require("../models/verify-Schema");
const User = require("../models/userSchema");
const FPO = require("../models/Fposchema");
const Creator_auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "Access token is missing or invalid" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id).populate("role");
    // console.log(
    //   // user,
    //   user.role,
    //   user.role.role === "contentcreator",
    //   "========================="
    // );
    if (
      !user ||
      (user.role.role !== "contentcreator" &&
        user.role.role !== "leadercumcreator")
    ) {
      return res
        .status(403)
        .json({ status: false, error: "You do not have creator privileges" });
    }

    if (user.status !== 1) {
      return res.status(403).json({
        status: false,
        error: "Your profile is blocked or deactivated",
      });
    }

    if (token !== user.jwtToken) {
      return res
        .status(403)
        .json({ status: false, error: "Invalid Token", msg: "Invalid Token" });
    }

    const fpostatus = await FPO.findById(user.fpo);
    console.log(fpostatus, "fpostatus ==================================");

    if (fpostatus.isBlocked) {
      return res
        .status(403)
        .send({ status: false, msg: "Your FPO is Blocked" });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ error: "Access token is missing or invalid" });
  }
};

module.exports = Creator_auth;
