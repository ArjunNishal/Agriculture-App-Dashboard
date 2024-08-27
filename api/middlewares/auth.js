const jwt = require("jsonwebtoken");
const Admin = require("../models/adminSchema");
const FPO = require("../models/Fposchema");
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  // console.log(token, req.headers, "token auth page");
  if (!token) {
    return res
      .status(401)
      .json({ error: "Access token is missing or invalid" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // console.log(decoded, "decoded");
    const user = await Admin.findById(decoded.id);
    if (!user) {
      return res.status(403).json({
        error: "You do not have admin privileges or admin not exists",
      });
    }

    if (user.isBlocked === true) {
      return res.status(403).json({
        error: "Your profile is blocked or deactivated",
      });
    }

    // console.log(user, "user");

    req.user = decoded.id;
    req.detail = decoded;
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ error: "Access token is missing or invalid" });
  }
};

module.exports = authenticate;
