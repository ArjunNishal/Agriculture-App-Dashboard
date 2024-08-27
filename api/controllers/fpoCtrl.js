const multer = require("multer");
const path = require("path");
const FPO = require("../models/Fposchema");
const Admin = require("../models/adminSchema");
const NewsGroup = require("../models/news-group-model");
const Radio_Record = require("../models/radioSchema");
const FIG_Detail = require("../models/FIGschema");
const Survey = require("../models/survey");
const Query = require("../models/querySchema");
const User = require("../models/userSchema");
const leader_Req_Detail = require("../models/LeaderReqDetail");
const Language = require("../models/languageSchema");
const Roles = require("../models/rolesSchema");
const { pagination } = require("./pagination");

const customFilename = (req, file, cb) => {
  const extension = path.extname(file.originalname);
  const currentDate = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `fpo-${currentDate}${extension}`;
  cb(null, filename);
};

// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads/fpo"));
  },
  filename: customFilename,
});

const uploadfpo = multer({ storage });

// Function to create or update an FPO
const createOrUpdateFPO = async (req, res) => {
  const {
    id,
    name,
    // registeredOn,
    promoter,
    sharePerMember,
    numberOfDirectors,
    totalFpoCapital,
    admin,
    villagesServed,
    productsarray,
  } = req.body;

  // Convert productsString into an array by splitting it using commas
  const productsarr = productsarray.split(",").map((product) => product.trim());

  console.log(req.body, "===========================");

  const adminfound = await Admin.findById(admin);
  if (!adminfound) {
    return res.status(500).send("Admin not found");
  }

  try {
    if (id) {
      // console.log(id, "id");
      const existingFPO = await FPO.findById(id);

      if (!existingFPO) {
        return res.status(404).json({ error: "FPO not found" });
      }

      const admin = await Admin.findById(existingFPO.admin);

      // Update existing FPO fields
      existingFPO.name = name;
      // existingFPO.registeredOn = registeredOn;
      existingFPO.promoter = promoter;
      existingFPO.sharePerMember = sharePerMember;
      existingFPO.numberOfDirectors = numberOfDirectors;
      existingFPO.totalFpoCapital = totalFpoCapital ? totalFpoCapital : 0;
      existingFPO.villagesServed = villagesServed ? villagesServed : 0;
      existingFPO.products = productsarr; // Assign converted products array
      existingFPO.productsarray = productsarray;

      // console.log(admin, admin.image);
      let imageuploaded;

      if (req.file) {
        console.log(req.file, req.body.image, "file ================");
        existingFPO.fpopic = req.file.key ? req.file.key : existingFPO.fpopic;
        existingFPO.theme.logo = req.file.key
          ? req.file.key
          : existingFPO.theme.logo;
        admin.image = req.file.key ? req.file.key : admin.image;
        imageuploaded = req.file.key ? req.file.key : admin.image;
        await admin.save();
      }

      // console.log(existingFPO, "existingFPO");
      await existingFPO.save();
      return res
        .status(200)
        .json({ msg: "FPO updated successfully", image: imageuploaded });
    } else {
      // Create a new FPO instance
      const newFPO = new FPO({
        name,
        // registeredOn,
        promoter,
        sharePerMember,
        numberOfDirectors,
        image: req.file.key,
        admin: admin,
        fpopic: req.file.key,
      });

      const token = jwt.sign(
        {
          id: adminfound._id,
          username: adminfound.username,
          mobileno: adminfound.mobileno,
          role: adminfound.role,
          email: adminfound.email,
          permissions: adminfound.permissions,
          fpo: adminfound?.fpo,
          image: adminfound?.image,
        },
        process.env.JWT_SECRET_KEY
      );

      const fposaved = await newFPO.save();
      if (fposaved) {
        // Update admin's fpo field
        adminfound.fpo = fposaved._id;
        await adminfound.save();
      }

      return res.status(200).json({ msg: "FPO created successfully" });
    }
  } catch (err) {
    console.log(err, "err---------");
    return res.status(500).json({ error: "Error saving FPO details" });
  }
};

// get all fpo's
const getAllFPOsWithAdmin = async (req, res) => {
  try {
    const limitQuery = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };

    const fpos = await pagination(
      FPO,
      FPO.find({}).populate("admin").sort({ createdAt: -1 }),
      limitQuery
    );
    console.log(fpos);
    // const fpos = await FPO.find({}).populate("admin").sort({ createdAt: -1 });
    if (!fpos) {
      return res.status(404).json({ error: "No FPOs found" });
    }

    res.status(200).send({ fpos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching FPO details" });
  }
};

const getAllFPOsWithUser = async (req, res) => {
  try {
    const fpos = await FPO.find({})
      .select("_id name") // Select only _id and name fields
      // .populate("admin")
      .sort({ registeredOn: -1 });
    console.log(fpos, "list");
    if (!fpos) {
      return res.status(404).json({ error: "No FPOs found" });
    }

    res.status(200).send({ fpos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching FPO details" });
  }
};

const editfpo = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    // registeredOn,
    totalFpoCapital,
    promoter,
    sharePerMember,
    numberOfDirectors,
    villagesServed,
    products,
    productsarray,
  } = req.body;

  try {
    const productsarr = productsarray
      ?.split(",")
      ?.map((product) => product.trim());
    const fpo = await FPO.findById(id);

    if (!fpo) {
      return res.status(404).json({ error: "FPO not found" });
    }

    // Update FPO details
    fpo.name = name;
    fpo.totalFpoCapital = totalFpoCapital ? totalFpoCapital : 0;
    // fpo.registeredOn = registeredOn;
    fpo.promoter = promoter;
    fpo.sharePerMember = sharePerMember;
    fpo.numberOfDirectors = numberOfDirectors;
    fpo.villagesServed = villagesServed ? villagesServed : 0;
    fpo.products = productsarr?.length > 0 ? productsarr : fpo.products;
    fpo.productsarray = productsarray ? productsarray : fpo.productsarray;

    const savedfpo = await fpo.save();

    res
      .status(200)
      .json({ msg: "FPO details updated successfully", fpo: savedfpo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error while updating FPO details" });
  }
};

const getFPOById = async (req, res) => {
  try {
    const fpoId = req.params.id;

    const leaderRoles = await Roles.find({
      role: { $in: ["leader", "leadercumcreator"] },
    });
    const fpomatch = await FPO.findOne({ admin: fpoId });

    const fpo = await FPO.findOne({ admin: fpoId }).populate("admin").populate({
      path: "theme.language",
      model: "Language",
    });

    if (!fpo) {
      return res.status(404).json({ error: "FPO not found" });
    }

    const userCount = await User.countDocuments({
      role: { $in: leaderRoles.map((role) => role._id) },
      fpo: fpomatch._id,
    });

    console.log(fpomatch._id, leaderRoles, userCount);
    res.status(200).json({ fpo, fpoleaders: userCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching FPO details" });
  }
};

const getFPOByIdforuser = async (req, res) => {
  try {
    const fpoId = req.params.id;
    const fpo = await FPO.findById(fpoId).populate("admin").populate({
      path: "theme.language",
      model: "Language",
    });
    console.log("fpo found", fpoId);
    if (!fpo) {
      return res.status(404).json({ error: "FPO not found" });
    }
    const leaderrole = await Roles.findOne({ role: "leader" });

    const fpoleaders = await User.countDocuments({
      role: leaderrole._id,
      fpo: fpoId,
    });

    const memberRole = await Roles.findOne({ role: "member" });

    const members = await User.countDocuments({
      role: memberRole._id,
      fpo: fpoId,
    });

    res.status(200).json({
      status: true,
      msg: "Successfull",
      data: { fpo, fig: fpoleaders, members },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      msg: "failed",
      error: "Error fetching FPO details",
    });
  }
};

const getFPOData = async (req, res) => {
  try {
    const fpoId = req.params.fpoId;
    // console.log(fpoId, "id of fpo***********");
    const fpo = await FPO.findById(fpoId).populate("admin");

    const memberrole = await Roles.findOne({ role: "member" });
    const leaderrole = await Roles.findOne({ role: "leader" });

    if (!fpo) {
      return res.status(500).send({ status: false, msg: "fpo not found" });
    }

    const newsGroups = await NewsGroup.find({ fpo: fpoId }).populate(
      "memberId"
    );
    const radios = await Radio_Record.find({ fpo: fpoId })
      .populate("radioCategory")
      .populate("fpo");
    const queries = await Query.find({ fpo: fpoId })
      .populate("member")
      .populate("fpo");

    const figs = await FIG_Detail.find({ fpo: fpoId }).populate("leaderId");
    const surveys = await Survey.find({ fpo: fpoId }).populate("createdBy");

    const members = await User.find({
      fpo: fpoId,
      role: memberrole._id,
    })
      .populate("fpo")
      .populate("role");

    const allusers = await User.find({ fpo: fpoId }).populate("role fpo");

    const fpoleaders = await User.countDocuments({
      role: leaderrole._id,
      fpo: fpoId,
    });

    const responseData = {
      status: true,
      msg: "",
      data: {
        newsGroups,
        radios,
        figs,
        surveys,
        queries,
        fpo,
        members,
        allusers,
        fig: fpoleaders,
      },
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching FPO data:", error);
    res.status(500).json({ error: "Error fetching FPO data" });
  }
};

const getFPOLanguages = async (req, res) => {
  console.log("hey enetered", req.params.id);
  // console.log("fpoid", req);

  try {
    // const { fpoid } = req.body;
    const fpoid = req.params.id;
    console.log("fpoid", fpoid);
    let fpo;
    let language;

    if (fpoid) {
      fpo = await FPO.findById(fpoid).populate({
        path: "theme.language",
        model: Language,
      });
      if (!fpo) {
        return res.status(404).json({ error: "FPO not found" });
      }
      language = fpo.theme.language.map((lang) => lang);
    } else {
      fpo = await Language.find();
      language = fpo.map((lang) => lang);
    }
    // Find the FPO by ID

    res.status(200).json({ language });
  } catch (error) {
    console.log("Error:", error);
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to fetch FPO languages" });
  }
};
const getFPOLanguages2 = async (req, res) => {
  // console.log("fpoid", req);

  try {
    // const { fpoid } = req.body;
    let fpo;
    let language;

    fpo = await Language.find();
    language = fpo.map((lang) => lang);
    // Find the FPO by ID

    res.status(200).json({ language });
  } catch (error) {
    console.log("Error:", error);
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to fetch FPO languages" });
  }
};

const getallmembersforfpo = async (req, res) => {
  try {
    const id = req.params.id;

    const memberrole = await Roles.findOne({ role: "member" });
    // const fig_leaders = await leader_Req_Detail
    //   .find({ fpo: id })
    //   .sort({ createdAt: -1 })
    //   .populate("memberId");

    const limitQuery = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };

    const fig_leaders = await pagination(
      User,
      User.find({
        fpo: id,
        role: memberrole._id,
      })
        .populate("fpo")
        .populate("role")
        .sort({ status: -1, createdAt: -1 }),
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

module.exports = {
  getFPOLanguages2,
  createOrUpdateFPO,
  uploadfpo,
  getAllFPOsWithAdmin,
  editfpo,
  getFPOById,
  getAllFPOsWithUser,
  getFPOByIdforuser,
  getFPOData,
  getFPOLanguages,
  getallmembersforfpo,
};
