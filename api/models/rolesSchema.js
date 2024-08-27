const mongoose = require("mongoose");
const rolesSchema = new mongoose.Schema({
  role: { type: String },
});
const Roles = mongoose.model("Roles", rolesSchema);
module.exports = Roles;
