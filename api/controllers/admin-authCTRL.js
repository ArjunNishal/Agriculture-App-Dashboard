const FIG_Detail = require("../models/FIGschema");
const leader_Req_Detail = require("../models/LeaderReqDetail");
const Language = require("../models/languageSchema");
const NewsGroup = require("../models/news-group-model");
const User = require("../models/userSchema");
const User_verification = require("../models/verify-Schema");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const FPO = require("../models/Fposchema");
const Admin = require("../models/adminSchema");
const ContentCreator = require("../models/contentcreatorSchema");
const Episode = require("../models/episodeSchema");
const News = require("../models/news_schema");
const Query = require("../models/querySchema");
const RadioCat = require("../models/radioCATschema");
const Radio_Record = require("../models/radioSchema");
const Response = require("../models/responseSchema");
const Roles = require("../models/rolesSchema");
const Season = require("../models/seasonSchema");
const Survey = require("../models/survey");
const { default: mongoose } = require("mongoose");
const LeaderandCreator = require("../models/leadercumcreatorschema");

const search = async (req, res) => {
  const { query, model, title } = req.body;
  console.log(title);

  try {
    let result;

    if (model === "Notification") {
      result = await mongoose
        .model(model)
        .find(query)
        .populate("createdby fpo");
    } else if (model === "User") {
      result = await mongoose.model(model).find(query).populate("role fpo");
    } else if (model === "Survey") {
      console.log(title);
      const fpos = await FPO.find({ name: { $regex: title, $options: "i" } });
      const fpoIds = fpos.map((fpo) => fpo._id);

      query.$or.push({ fpo: { $in: fpoIds } });
      console.log(JSON.stringify(query), "fpo");

      result = await mongoose.model(model).find(query).populate("fpo");
    } else {
      result = await mongoose.model(model).find(query);
    }

    console.log(result, result.length, "result***********************");
    console.log(query);
    res.json({ msg: "success", success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
};

var Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/languages");
  },
  // destination: "news",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({ storage: Storage });

// add new language
const addlanguage = async (req, res) => {
  try {
    const { language, shortcode, data } = req.body;
    console.log(
      language,
      data,
      shortcode,
      req.body,
      "=========================================="
    );
    const existing = await Language.findOne({ language: language });
    if (existing) {
      return res.status(500).send({ Error: "Language already exists." });
    }
    const newlang = await Language.create({
      language: language,
      shortcode: shortcode,
      file: data,
    });

    res.status(200).send({ newlang, msg: "Language added successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ Error: "Error while updating admin details" });
  }
};

// get all languages
const getlanguages = async (req, res) => {
  try {
    const languages = await Language.find().sort({ createdAt: -1 });
    res.status(200).send({ languages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ Error: "Error while getting languages" });
  }
};

const updateLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const { language, shortcode, data } = req.body;

    const existing = await Language.findById(id);
    if (!existing) {
      return res.status(404).send({ Error: "Language not found." });
    }
    // if (req.files[0]) {
    //   fs.unlinkSync(`uploads/languages/${existing.file}`);
    //   existing.file = req.files[0].filename;
    // }

    existing.language = language;
    existing.shortcode = shortcode;
    existing.file = data;
    await existing.save();

    res.status(200).send({
      updatedLanguage: existing,
      msg: "Language name updated successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ Error: "Error while updating language name" });
  }
};

const deleteLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const existing = await Language.findById(id);
    if (!existing) {
      return res.status(404).send({ Error: "Language not found." });
    }
    // if (existing) {
    //   fs.unlinkSync(`uploads/languages/${existing.file}`);
    const deletel = await Language.findByIdAndDelete(id);
    // }

    res.status(200).send({ msg: "Language deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ Error: "Error while deleting language" });
  }
};

// theme settings

const Storagelogo = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/fpo");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const uploadfpologo = multer({ storage: Storagelogo });

const saveSettings = async (req, res) => {
  try {
    const { id } = req.params;

    const fpo = await FPO.findOne({ admin: id });

    const existinglogo = fpo.theme.logo;
    if (!fpo) {
      return res.status(404).json({ error: "FPO not found" });
    }
    const admin = await Admin.findById(id);

    // Extract data from request body
    const {
      themeColor1,
      themeColor2,
      iconsColor,
      supportWhatsapp,
      backgroundColor1,
      backgroundColor2,
      supportMobile,
      supportEmail,
      sectionscolor,
      selectedLanguage,
    } = req.body;

    // Update FPO theme settings
    fpo.theme = {
      themecolor1: themeColor1,
      themecolor2: themeColor2,
      backgroundColor1,
      backgroundColor2,
      iconsColor,
      sectionscolor,
      language: JSON.parse(selectedLanguage),
      support: {
        whatsappNo: supportWhatsapp,
        mobileNo: supportMobile,
        email: supportEmail,
      },
    };

    // Check if a logo file was uploaded
    if (req.file) {
      console.log(req.file, "file =================");
      // Save the filename in the FPO model
      fpo.theme.logo = req.file.key;
      admin.image = req.file.key;
      fpo.fpopic = req.file.key;
      if (existinglogo) {
        console.log(existinglogo, existinglogo !== "default/logo.png");
        // if (existinglogo !== "default/logo.png") {
        //   fs.unlinkSync(`uploads/fpo/${existinglogo}`);
        // }
      }
    } else {
      fpo.theme.logo = existinglogo;
    }

    await fpo.save();

    await admin.save();

    res.status(200).json({ msg: "Settings saved successfully" });
  } catch (error) {
    console.error("Error saving settings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// const uploadbanners = async (req, res) => {
//   try {
//     const fpoId = req.params.id;
//     console.log(fpoId, "id===============");
//     const banners = req.files.map((file) => ({ imageName: file.filename }));

//     // Update FPO document with uploaded banners
//     const updatedFPO = await FPO.findOneAndUpdate(
//       { admin: fpoId },
//       { "theme.banner": banners },
//       { new: true }
//     );

//     res.status(200).send({ updatedFPO });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// };
const uploadBanner = async (req, res) => {
  try {
    const fpoId = req.params.id;
    const bannerPosition = req.params.position; // 'banner1', 'banner2', or 'banner3'
    const fpo = await FPO.findOne({ admin: fpoId });
    console.log(
      fpo,
      fpoId,
      typeof bannerPosition,
      req.file.key,
      "===================="
    );
    if (!fpo) {
      return res.status(500).send({ msg: "fpo not found" });
    }

    if (bannerPosition === "1") {
      console.log(fpo.theme.banner.banner1.imageName);
      fpo.theme.banner.banner1.imageName = req.file.key;
    }
    if (bannerPosition === "2") {
      fpo.theme.banner.banner2.imageName = req.file.key;
    }
    if (bannerPosition === "3") {
      fpo.theme.banner.banner3.imageName = req.file.key;
    }

    const updatedFPO = await fpo.save();

    res.status(200).send({ updatedFPO });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const pendingreqs = async (req, res) => {
  try {
    const fpoid = req.params.fpo;

    const leaderreq = await leader_Req_Detail.find({ status: 0, fpo: fpoid });

    const creatorreq = await ContentCreator.find({ status: 0, fpo: fpoid });
    const leadcumcreator = await LeaderandCreator.find({
      status: 0,
      fpo: fpoid,
    });

    res.status(200).json({
      message: "FPO Admin deleted successfully",
      data: { leaderreq, creatorreq, leadcumcreator },
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to get FPO reqs" });
  }
};

module.exports = {
  addlanguage,
  upload,
  getlanguages,
  updateLanguage,
  deleteLanguage,
  saveSettings,
  uploadfpologo,
  uploadBanner,
  search,
  pendingreqs,
  // deleteFPOAdmin,
};
