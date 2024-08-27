const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const AdminLoginroutes = require("./routes/adminloginRoutes");
const surveyroutes = require("./routes/surveyRoutes");
const fporoutes = require("./routes/fpoRoutes");
const userlogin = require("./routes/userloginroutes");
const queryroutes = require("./routes/queryRoutes");
const notificationroutes = require("./routes/notificationsRoutes");

const radioRoutes = require("./routes/radioRoutes");
const adminauthroutes = require("./routes/admin-auth-Routes");
const newsRoutes = require("./routes/newsRoutes");
const path = require("path");

require("dotenv").config();
app.use(cors({ credentials: true, origin: "*" }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/uploads", express.static("./uploads"));

// ROUTES
app.use("/api/admin-log", AdminLoginroutes);
app.use("/api/survey", surveyroutes);
app.use("/api/fpo", fporoutes);
app.use("/api/user", userlogin);
app.use("/api/admin-auth", adminauthroutes);
app.use("/api/news", newsRoutes);
app.use("/api/radio", radioRoutes);
app.use("/api/query", queryroutes);
app.use("/api/notification", notificationroutes);

__dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
app.use(express.static(path.join(__dirname, "./build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});



//db connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("connected to mongo"))
  .catch((err) => console.log(err));

app.listen(process.env.PORT, () =>
  console.log(`App listening on port ${process.env.PORT}!`)
);
