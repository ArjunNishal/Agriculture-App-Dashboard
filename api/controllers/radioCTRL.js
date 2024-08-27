const RadioCat = require("../models/radioCATschema");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Radio_Record = require("../models/radioSchema");
const User_verification = require("../models/verify-Schema");
const Season = require("../models/seasonSchema");
const Episode = require("../models/episodeSchema");
const FPO = require("../models/Fposchema");
const { pagination } = require("./pagination");
const User = require("../models/userSchema");
const { sendFireBaseNOtificationFCM } = require("../fcmNotification");
const { constants } = require("buffer");
const { renderUrl, renderUrl2 } = require("../constants");
// const RadioCat = require("../models/radioCATschema");

var Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/radio");
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

const addNewCategory = async (req, res) => {
  try {
    const { category, fpoid } = req.body;
    console.log(req.files);
    let file;
    if (!req.files)
      return res.status(500).json({ msg: "Please add image to it" });
    if (req.files) {
      console.log(req.files);
      file = req.files[0];
      console.log("in here");

      console.log("file", file);
    }
    const if_already = await RadioCat.findOne({ category, fpo: fpoid });
    if (if_already)
      return res.status(406).json({ Error: "Category name already exists" });
    console.log("file.filename", file);
    const newCat = new RadioCat({
      category,
      image: file ? file.key : null,
      fpo: fpoid,
    });
    await newCat.save();

    res.status(200).json({
      Success: "New Category added",
      newCat,
      url: `https://agripalcldstorage.objectstore.e2enetworks.net/uploads/`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { category } = req.body;
    console.log(req.params.id);
    let file;

    if (!req.files) {
      return res.status(400).json({ msg: "Please add an image to it" });
    }

    if (req.files) {
      file = req.files[0];
    }

    const if_already = await RadioCat.findOne({ category });

    if (if_already && if_already._id !== req.params.id) {
      return res.status(406).json({ Error: "Category name already exists" });
    }

    const oldCat = await RadioCat.findById({ _id: req.params.id });

    // if ((!oldCat && file) || (if_already && file)) {
    //   fs.unlink(`uploads/radio/${file.key}`, (err) => {
    //     if (err) {
    //       console.error("Error deleting previous image:", err);
    //     }
    //   });
    // }
    // Delete the previous image if a new file is being uploaded
    // if (file && oldCat?.image) {
    //   fs.unlink(`uploads/radio/${oldCat.image}`, (err) => {
    //     if (err) {
    //       console.error("Error deleting previous image:", err);
    //     }
    //   });
    // }

    const UpdateCat = await RadioCat.findByIdAndUpdate(
      { _id: req.params.id },
      { category, image: file ? file.key : oldCat.image },
      {
        returnDocument: "after",
      }
    );
    if (!UpdateCat) {
      return res.status(500).send({ error: "Category not found" });
    }

    res.status(200).json({ Success: "Category Updated", UpdateCat });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

const UpdateCatStatus = async (req, res) => {
  try {
    console.log(req.params.id, req.params.status);
    const updateCat = await RadioCat.findByIdAndUpdate(
      { _id: req.params.id },
      {
        status: req.params.status,
      },
      {
        returnDocument: "after",
      }
    );

    if (!updateCat) {
      return res.status(404).json({ Error: "Category not found" });
    }

    res.status(200).json({ Success: "Category Status Updated", updateCat });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

// const deleteCategory = async (req, res) => {
//   try {
//     const deleteRadio = await Radio_Record.deleteMany({
//       radioCategory: req.params.catId,
//     });

//     const deleteseason = await Season.deleteMany({
//       radioCategory: req.params.catId,
//     });

//     const deleteRadioCat = await RadioCat.findByIdAndDelete({
//       _id: req.params.catId,
//     });

//     if (!deleteRadioCat) {
//       return res.status(404).json({ Error: "Category not found" });
//     }

//     // Delete the associated images from the 'uploads' folder
//     if (deleteRadioCat.image) {
//       fs.unlink(`uploads/radio/${deleteRadioCat.image}`, (err) => {
//         if (err) {
//           console.error("Error deleting radio cat image:", err);
//         }
//       });
//     }

//     if (deleteRadio.length > 0) {
//       for (const radio of deleteRadio) {
//         if (radio.image) {
//           fs.unlink(`uploads/radio/${radio.image}`, (err) => {
//             if (err) {
//               console.error("Error deleting radio image:", err);
//             }
//           });
//         }
//       }
//     }

//     if (deleteseason.length > 0) {
//       for (const season of deleteseason) {
//         if (season.image) {
//           fs.unlink(`uploads/radio/${season.image}`, (err) => {
//             if (err) {
//               console.error("Error deleting season image:", err);
//             }
//           });
//         }
//       }
//     }

//     res.status(200).json({ Success: "All data deleted", deleteRadio });
//   } catch (error) {
//     console.error("An error occurred:", error);
//     res.status(500).json({ Error: "Internal Server Error" });
//   }
// };

const deleteCategory = async (req, res) => {
  try {
    // Check if there are any associated radio records
    const radioCount = await Radio_Record.countDocuments({
      radioCategory: req.params.catId,
    });

    // Check if there are any associated seasons
    const seasonCount = await Season.countDocuments({
      radioCategory: req.params.catId,
    });

    // Check if there are any associated episodes
    const episodeCount = await Episode.countDocuments({
      radioCategory: req.params.catId,
    });

    // If any associated records exist, do not delete the category
    if (radioCount > 0 || seasonCount > 0 || episodeCount > 0) {
      return res.status(500).json({
        Error: "Category contains associated records and cannot be deleted",
      });
    }

    // If no associated records exist, proceed with deletion
    const deleteRadioCat = await RadioCat.findByIdAndDelete({
      _id: req.params.catId,
    });

    if (!deleteRadioCat) {
      return res.status(404).json({ Error: "Category not found" });
    }

    // Delete the associated images from the 'uploads' folder
    if (deleteRadioCat.image) {
      fs.unlink(`uploads/radio/${deleteRadioCat.image}`, (err) => {
        if (err) {
          console.error("Error deleting radio cat image:", err);
        }
      });
    }

    res.status(200).json({
      Success: "Category and associated data deleted",
      deleteRadioCat,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

const listAllAdminCategory = async (req, res) => {
  try {
    const limitQuery = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };

    const data = await pagination(
      RadioCat,
      RadioCat.find({}).sort({ createdAt: -1 }),
      limitQuery
    );
    // const data = await RadioCat.find({ status: 1 }).sort({ createdAt: -1 });

    const radioCategoriesWithCounts = await Promise.all(
      data.results.map(async (category) => {
        const radioRecordCount = await Radio_Record.countDocuments({
          radioCategory: category._id,
        });
        return { ...category.toObject(), radioRecordCount };
      })
    );
    console.log(radioCategoriesWithCounts);

    data.results = radioCategoriesWithCounts;

    res.status(200).json({
      radioCat: data,
      //   url: `https://agripalcldstorage.objectstore.e2enetworks.net/uploads/`,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

const listAlluserCategory = async (req, res) => {
  try {
    const limitQuery = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };

    const data = await pagination(
      RadioCat,
      RadioCat.find({ status: 1 }).sort({ createdAt: -1 }),
      limitQuery
    );
    // const data = await RadioCat.find({ status: 1 }).sort({ createdAt: -1 });

    res.status(200).json({
      radioCat: data,
      //   url: `https://agripalcldstorage.objectstore.e2enetworks.net/uploads/`,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

const listAllAdminCategories = async (req, res) => {
  try {
    // const limitQuery = {
    //   page: req.query.page || 1,
    //   limit: req.query.limit || 10,
    // };

    // const data = await pagination(
    //   RadioCat,
    //   RadioCat.find({ status: 1 }).sort({ createdAt: -1 }),
    //   limitQuery
    // );
    const data = await RadioCat.find({ status: 1 }).sort({ createdAt: -1 });

    res.status(200).json({
      radioCat: data,
      //   url: `https://agripalcldstorage.objectstore.e2enetworks.net/uploads/`,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};
// for fpo
const listAllAdminCategory_fpo = async (req, res) => {
  try {
    const id = req.params.id;
    // const data = await RadioCat.find({ fpo: id }).sort({ createdAt: -1 });
    const limitQuery = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };

    let data = await pagination(
      RadioCat,
      RadioCat.find({ fpo: id }).sort({ createdAt: -1 }),
      limitQuery
    );

    const radioCategoriesWithCounts = await Promise.all(
      data.results.map(async (category) => {
        const radioRecordCount = await Radio_Record.countDocuments({
          radioCategory: category._id,
        });
        return { ...category.toObject(), radioRecordCount };
      })
    );
    console.log(radioCategoriesWithCounts);

    data.results = radioCategoriesWithCounts;

    res.status(200).json({
      radioCat: data,
      //   url: `https://agripalcldstorage.objectstore.e2enetworks.net/uploads/`,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

const listAllAdminCategories_fpo = async (req, res) => {
  try {
    const id = req.query.fpoid;

    let data;

    if (id) {
      data = await RadioCat.find({ fpo: id }).sort({ createdAt: -1 });
    } else {
      data = await RadioCat.find().sort({ createdAt: -1 });
    }
    // console.log(id, "query.======");
    // const limitQuery = {
    //   page: req.query.page || 1,
    //   limit: req.query.limit || 10,
    // };

    // const data = await pagination(
    //   RadioCat,
    //   RadioCat.find({ fpo: id }).sort({ createdAt: -1 }),
    //   limitQuery
    // );

    res.status(200).json({
      radioCat: data,
      //   url: `https://agripalcldstorage.objectstore.e2enetworks.net/uploads/`,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

const listAllAdminCategories_fpo_user = async (req, res) => {
  try {
    const id = req.body.fpoid;
    console.log(id, req.body, "query.======");
    // const data = await RadioCat.find({ fpo: id }).sort({ createdAt: -1 });
    const limitQuery = {
      page: req.body.page || 1,
      limit: req.body.limit || 10,
    };

    const data = await pagination(
      RadioCat,
      RadioCat.find({ fpo: id, status: 1 }).sort({ createdAt: -1 }),
      limitQuery
    );

    const latestEpisode = await Episode.findOne({ fpo: id, status: 1 })
      .sort({ createdAt: -1 })
      .populate("season")
      .populate("radioCategory")
      .populate("radio");

    res.status(200).json({
      status: true,
      msg: " radio categories",
      data: { data, latestEpisode },
      total_count: data.totalRecord,
      //   url: `https://agripalcldstorage.objectstore.e2enetworks.net/uploads/`,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

const ListOneCategory = async (req, res) => {
  try {
    const data = await RadioCat.findById({ _id: req.params.id });

    if (!data) {
      return res.status(404).json({ Error: "Category not found" });
    }

    res.json(data);
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};
// ********************************************************************************************
// radio controllers
const addNewRadio = async (req, res) => {
  try {
    const { heading, host, radioCategory } = req.body;
    let file;
    const radcat = await RadioCat.findById(radioCategory).populate("fpo");
    if (!radcat) {
      return res.status(500).json({ msg: "Radio cat not found" });
    }
    if (!req.files) {
      return res.status(500).json({ msg: "Please add an image to it" });
    }

    if (req.files) {
      console.log(req.files);
      file = req.files[0];
      console.log("in here");
    }

    // Add your Minio or other file storage code here

    // Assuming Minio code is commented out

    // const objects = minioClient.fPutObject(
    //   "agripalcldstorage",
    //   "uploads/" + file.filename,
    //   "uploads/" + file.filename,
    //   function (e) {
    //     if (e) {
    //       console.log("error i got ", e);
    //       FS.unlinkSync("uploads/" + file.filename);
    //       return null;
    //     } else {
    //       console.log("Success");
    //       FS.unlinkSync("uploads/" + file.filename);
    //       return true;
    //     }
    //   }
    // );

    const newRadio = new Radio_Record({
      heading,
      image: file ? file.key : null,
      host,
      radioCategory,
      fpo: radcat.fpo._id,
    });
    // sendFireBaseNOtificationFCM(firebaseToken, firebaseMessage, dataMsg);

    const savedradio = await newRadio.save();

    res.status(200).json({ Success: "New data added", newRadio: savedradio });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

const updateRadio = async (req, res) => {
  try {
    console.log(req.body);
    const { heading, image, host, radioCategory } = req.body;
    let file;

    if (!req.files) {
      return res.status(400).json({ msg: "Please add an image to it" });
    }

    if (req.files) {
      file = req.files[0];
    }

    const Radiodata = await Radio_Record.findById({ _id: req.params.id });
    // if (!Radiodata) {
    //   fs.unlink(`uploads/radio/${file.key}`, (err) => {
    //     if (err) {
    //       console.error("Error deleting radio cat image:", err);
    //     }
    //   });
    //   return res.status(200).send("radio not found");
    // }
    // if (Radiodata && file) {
    //   fs.unlink(`uploads/radio/${Radiodata.key}`, (err) => {
    //     if (err) {
    //       console.error("Error deleting radio cat image:", err);
    //     }
    //   });
    // }
    const updateRadio = await Radio_Record.findByIdAndUpdate(
      { _id: req.params.id },
      {
        heading,
        image: file ? file.key : Radiodata.image,
        host,
        radioCategory:
          radioCategory !== "" ? radioCategory : Radiodata.radioCategory,
      },
      {
        returnDocument: "after",
      }
    );

    res.status(200).json({ Success: "Data updated", updateRadio });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

const UpdateRadioStatus = async (req, res) => {
  try {
    console.log(req.params.id, req.params.status);

    const updateRadio = await Radio_Record.findByIdAndUpdate(
      { _id: req.params.id },
      {
        status: req.params.status,
      },
      {
        returnDocument: "after",
      }
    );

    if (!updateRadio) {
      return res.status(404).json({ Error: "Radio not found" });
    }

    res.status(200).json({ Success: "Radio Status Updated", updateRadio });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

const getAllAdminRadio = async (req, res) => {
  try {
    const limitQuery = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };
    const data = await pagination(
      Radio_Record,
      Radio_Record.find({
        radioCategory: req.params.catId,
      })
        .sort({
          createdBy: -1,
        })
        .populate("fpo"),
      limitQuery
    );

    const radioCategoriesWithCounts = await Promise.all(
      data.results.map(async (category) => {
        const seasonRecordCount = await Season.countDocuments({
          radio: category._id,
        });
        return { ...category.toObject(), seasonRecordCount };
      })
    );
    console.log(radioCategoriesWithCounts);

    data.results = radioCategoriesWithCounts;

    // const data = await Radio_Record.find({
    //   radioCategory: req.params.catId,
    // })
    //   .sort({
    //     createdBy: -1,
    //   })
    //   .populate("fpo");
    res.status(200).json({
      radio: data,
      url: `https://agripalcldstorage.objectstore.e2enetworks.net/uploads/`,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

const getAllAdminRadiolist = async (req, res) => {
  try {
    const data = await Radio_Record.find({
      radioCategory: req.params.catId,
    })
      .sort({
        createdBy: -1,
      })
      .populate("fpo");
    res.status(200).json({
      radio: data,
      url: `https://agripalcldstorage.objectstore.e2enetworks.net/uploads/`,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

const getRadioById = async (req, res) => {
  try {
    const data = await Radio_Record.findById({ _id: req.params.id })
      .populate("radioCategory")
      .populate("season");
    if (!data) {
      return res.status(404).json({ Error: "Radio not found" });
    }
    res.json(data);
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

const getseasonbyradio = async (req, res) => {
  try {
    console.log(req.params.sid, "id==========================");
    const data = await Season.find({ radio: req.params.sid })
      .populate("radioCategory")
      .populate("fpo")
      .populate("radio");
    if (!data) {
      return res.status(404).json({ Error: "Radio not found" });
    }
    res.status(200).json({ radio: data });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

// const deleteRadio = async (req, res) => {
//   try {
//     const deleteData = await Radio_Record.findByIdAndDelete({
//       _id: req.params.id,
//     });

//     if (!deleteData) {
//       return res.status(404).json({ Error: "Radio not found" });
//     }

//     // Delete the associated image from the 'uploads' folder
//     if (deleteData.image) {
//       fs.unlink(`uploads/radio/${deleteData.image}`, (err) => {
//         if (err) {
//           console.error("Error deleting radio image:", err);
//         }
//       });
//     }

//     res.json({ Success: "Data deleted", deleteData });
//   } catch (error) {
//     console.error("An error occurred:", error);
//     res.status(500).json({ Error: "Internal Server Error" });
//   }
// };

const deleteRadio = async (req, res) => {
  try {
    // Check if there are any associated seasons
    const seasonCount = await Season.countDocuments({
      radio: req.params.id,
    });

    // Check if there are any associated episodes
    const episodeCount = await Episode.countDocuments({
      radio: req.params.id,
    });

    // If any associated seasons or episodes exist, do not delete the radio
    if (seasonCount > 0 || episodeCount > 0) {
      return res.status(400).json({
        Error:
          "Radio contains associated seasons or episodes and cannot be deleted",
      });
    }

    // If no associated seasons or episodes exist, proceed with deletion
    const deleteData = await Radio_Record.findByIdAndDelete({
      _id: req.params.id,
    });

    if (!deleteData) {
      return res.status(404).json({ Error: "Radio not found" });
    }

    // Delete the associated image from the 'uploads' folder
    if (deleteData.image) {
      fs.unlink(`uploads/radio/${deleteData.image}`, (err) => {
        if (err) {
          console.error("Error deleting radio image:", err);
        }
      });
    }

    res.json({ Success: "Data deleted", deleteData });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

const addSeason = async (req, res) => {
  try {
    const { heading, radioCategory, radio } = req.body;
    console.log(req.body);
    let file;
    const radcat = await RadioCat.findById(radioCategory).populate("fpo");
    if (!radcat) {
      return res.status(500).json({ msg: "Radio cat not found" });
    }
    const radiomatch = await Radio_Record.findById(radio).populate("fpo");
    if (!radiomatch) {
      return res.status(500).json({ msg: "Radio cat not found" });
    }
    // if (!req.files) {
    //   return res.status(500).json({ msg: "Please add an image to it" });
    // }
    // if (req.files) {
    //   console.log(req.files);
    //   file = req.files[0];
    //   console.log("in here");
    // }

    const newSeason = new Season({
      season: heading,
      // image: file ? file.filename : null,
      radioCategory,
      radio,
      fpo: radcat.fpo._id,
    });

    await newSeason.save();

    res.status(200).json({ Success: "New data added", newSeason });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

// Get all seasons
const getAllSeasons = async (req, res) => {
  try {
    let data = await Season.find()
      .sort({
        createdBy: -1,
      })
      .populate("fpo")
      .populate("radioCategory");

    const radioCategoriesWithCounts = await Promise.all(
      data.map(async (category) => {
        const episodeRecordCount = await Episode.countDocuments({
          season: category._id,
        });
        return { ...category.toObject(), episodeRecordCount };
      })
    );
    console.log(radioCategoriesWithCounts);

    data = radioCategoriesWithCounts;

    res.status(200).json({
      seasons: data,
      // url: `https://agripalcldstorage.objectstore.e2enetworks.net/uploads/`,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

// Get seasons by radio
const getSeasonsByFPO = async (req, res) => {
  try {
    let seasons = await Season.find({ fpo: req.params.fpoId })
      .populate("fpo")
      .populate("radio")
      .populate("radioCategory");

    const radioCategoriesWithCounts = await Promise.all(
      seasons.map(async (category) => {
        const episodeRecordCount = await Episode.countDocuments({
          season: category._id,
        });
        return { ...category.toObject(), episodeRecordCount };
      })
    );
    console.log(radioCategoriesWithCounts);

    seasons = radioCategoriesWithCounts;

    res.status(200).json({ seasons });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};
const getSeasonsByradio = async (req, res) => {
  try {
    const limitQuery = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };
    const seasons = await pagination(
      Season,
      Season.find({ radio: req.params.rid })
        .populate("fpo")
        .populate("radio")
        .populate("radioCategory"),
      limitQuery
    );

    const radioCategoriesWithCounts = await Promise.all(
      seasons.results.map(async (category) => {
        const episodeRecordCount = await Episode.countDocuments({
          season: category._id,
        });
        return { ...category.toObject(), episodeRecordCount };
      })
    );
    console.log(radioCategoriesWithCounts);

    seasons.results = radioCategoriesWithCounts;

    // const seasons = await Season.find({ radio: req.params.rid })
    //   .populate("fpo")
    //   .populate("radio")
    //   .populate("radioCategory");
    res.status(200).json({ seasons });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

const getSeasonsByradiolist = async (req, res) => {
  try {
    // const limitQuery = {
    //   page: req.query.page || 1,
    //   limit: req.query.limit || 10,
    // };
    // const seasons = await pagination(
    //   Season,
    //   Season.find({ radio: req.params.rid })
    //     .populate("fpo")
    //     .populate("radio")
    //     .populate("radioCategory"),
    //   limitQuery
    // );

    const seasons = await Season.find({ radio: req.params.rid })
      .populate("fpo")
      .populate("radio")
      .populate("radioCategory");
    res.status(200).json({ seasons });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

// Edit season details
const editSeason = async (req, res) => {
  try {
    const { heading, image, radioCategory, radio } = req.body;
    let file;

    // if (!req.files) {
    //   return res.status(400).json({ msg: "Please add an image to it" });
    // }

    // if (req.files) {
    //   file = req.files[0];
    // }

    const Seasondata = await Season.findById({ _id: req.params.id });
    console.log("Seasondata", Seasondata, "=============");
    // if (!Seasondata && req.files.length > 0) {
    //   fs.unlink(`uploads/radio/${file.filename}`, (err) => {
    //     if (err) {
    //       console.error("Error deleting radio cat image:", err);
    //     }
    //   });
    //   return res.status(200).send("radio not found");
    // }
    // if (Seasondata && file) {
    //   fs.unlink(`uploads/radio/${Seasondata.image}`, (err) => {
    //     if (err) {
    //       console.error("Error deleting radio cat image:", err);
    //     }
    //   });
    // }
    const updateSeason = await Season.findByIdAndUpdate(
      { _id: req.params.id },
      {
        season: heading,
        // image: file ? file.filename : Seasondata.image,
        radioCategory:
          radioCategory !== "" ? radioCategory : Seasondata.radioCategory,
        radio: radio !== "" ? radio : Seasondata.radio,
      },
      {
        returnDocument: "after",
      }
    );
    res.status(200).json({ Success: "Data updated", updateSeason });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

// Edit status of the season only
const editSeasonStatus = async (req, res) => {
  try {
    console.log(req.params.id, req.params.status);

    const updateSeason = await Season.findByIdAndUpdate(
      { _id: req.params.id },
      {
        status: req.params.status,
      },
      {
        returnDocument: "after",
      }
    );

    if (!updateSeason) {
      return res.status(404).json({ Error: "Radio not found" });
    }

    res.status(200).json({ Success: "Radio Status Updated", updateSeason });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};
const editepisodeStatus = async (req, res) => {
  try {
    console.log(req.params.id, req.params.status);

    const updateSeason = await Episode.findByIdAndUpdate(
      { _id: req.params.id },
      {
        status: req.params.status,
      },
      {
        returnDocument: "after",
      }
    );

    if (!updateSeason) {
      return res.status(404).json({ Error: "Radio not found" });
    }

    res.status(200).json({ Success: "Radio Status Updated", updateSeason });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

// const deleteseason = async (req, res) => {
//   try {
//     const deleteData = await Season.findByIdAndDelete({
//       _id: req.params.id,
//     });

//     if (!deleteData) {
//       return res.status(404).json({ Error: "Radio not found" });
//     }

//     // Delete the associated image from the 'uploads' folder
//     if (deleteData.image) {
//       fs.unlink(`uploads/radio/${deleteData.image}`, (err) => {
//         if (err) {
//           console.error("Error deleting radio image:", err);
//         }
//       });
//     }

//     res.json({ Success: "Data deleted", deleteData });
//   } catch (error) {
//     console.error("An error occurred:", error);
//     res.status(500).json({ Error: "Internal Server Error" });
//   }
// };

const deleteseason = async (req, res) => {
  try {
    // Check if there are any associated episodes
    const episodeCount = await Episode.countDocuments({
      season: req.params.id,
    });

    // If any associated episodes exist, do not delete the season
    if (episodeCount > 0) {
      return res.status(400).json({
        Error: "Season contains associated episodes and cannot be deleted",
      });
    }

    // If no associated episodes exist, proceed with deletion
    const deleteData = await Season.findByIdAndDelete({
      _id: req.params.id,
    });

    if (!deleteData) {
      return res.status(404).json({ Error: "Season not found" });
    }

    // Delete the associated image from the 'uploads' folder
    if (deleteData.image) {
      fs.unlink(`uploads/radio/${deleteData.image}`, (err) => {
        if (err) {
          console.error("Error deleting season image:", err);
        }
      });
    }

    res.json({ Success: "Data deleted", deleteData });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

//  episode
const addNewepisode = async (req, res) => {
  try {
    const {
      heading,
      season,
      seasonEpisode,
      recording,
      radio,
      radioCategory,
      duration,
    } = req.body;
    let file;
    const radcat = await RadioCat.findById(radioCategory).populate("fpo");
    if (!radcat) {
      return res.status(500).json({ msg: "Radio cat not found" });
    }
    const seasonm = await Season.findById(season).populate("fpo");
    if (!seasonm) {
      return res.status(500).json({ msg: "season not found" });
    }
    if (!req.files) {
      return res.status(500).json({ msg: "Please add an image to it" });
    }

    if (req.files) {
      console.log(req.files);
      file = req.files[0];
      console.log("in here episode");
    }

    // Add your Minio or other file storage code here

    // Assuming Minio code is commented out

    // const objects = minioClient.fPutObject(
    //   "agripalcldstorage",
    //   "uploads/" + file.filename,
    //   "uploads/" + file.filename,
    //   function (e) {
    //     if (e) {
    //       console.log("error i got ", e);
    //       FS.unlinkSync("uploads/" + file.filename);
    //       return null;
    //     } else {
    //       console.log("Success");
    //       FS.unlinkSync("uploads/" + file.filename);
    //       return true;
    //     }
    //   }
    // );

    const newRadio = new Episode({
      title: heading,
      image: file ? file.key : null,
      seasonEpisode,
      season,
      radioCategory,
      radio,
      recording,
      duration,
      fpo: radcat.fpo._id,
    });
    // sendFireBaseNOtificationFCM(firebaseToken, firebaseMessage, dataMsg);

    const savedepisode = await newRadio.save();
    console.log(savedepisode, "savedepisode");

    const imageUrl = file ? `${renderUrl2}${file.key}` : null;
    console.log(imageUrl, "imageUrl");

    // send firebase notification

    const updateUserAuth = await User.find({
      fpo: radcat.fpo._id,
    }).populate("language");

    updateUserAuth.forEach((ftoken) => {
      const firebaseMessage = {
        title: heading,
        body: `${
          ftoken?.language
            ? ftoken?.language?.file?.episode_added
            : "Episode added successfully!"
        }`,
        // type: "add-episode",
        type: {
          _id: newRadio._id,
          route: "add-episode",
        },
        action_type: "MAIN_ACTIVITY",
        // *************************************************************************
        // NOTE : If imageUrl not works , try the code below
        // *************************************************************************
        imageUrl: imageUrl,
        image: imageUrl,
      };
      const dataMsg = {
        title: heading,
        body: `${
          ftoken?.language
            ? ftoken?.language?.file?.episode_added
            : "Episode added successfully!"
        }`,
        // type: "add-episode",
        type: {
          _id: newRadio._id,
          route: "add-episode",
        },
        action_type: "MAIN_ACTIVITY",
        imageUrl: imageUrl,
        image: imageUrl,
      };

      console.log(dataMsg, "dataMsg");
      // const firetoken = [`${UserFtoken}`]
      // console.log("ftoken.firebaseToken", ftoken.firebaseToken);
      sendFireBaseNOtificationFCM(
        [ftoken.firebaseToken],
        firebaseMessage,
        dataMsg
      );
    });

    res.status(200).json({ Success: "New data added", newRadio: savedepisode });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

const getepisodebyseason = async (req, res) => {
  try {
    const limitQuery = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };
    const episodes = await pagination(
      Episode,
      Episode.find({ season: req.params.sid })
        .populate("fpo")
        .populate("radio")
        .populate("season")
        .populate("radioCategory"),
      limitQuery
    );
    // const episodes = await Episode.find({ season: req.params.sid })
    //   .populate("fpo")
    //   .populate("radio")
    //   .populate("season")
    //   .populate("radioCategory");
    res.status(200).json({ episodes });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

const updateEpisode = async (req, res) => {
  try {
    console.log(req.body);
    const {
      heading,
      image,
      season,
      radio,
      recording,
      radioCategory,
      seasonEpisode,
      duration,
    } = req.body;
    let file;

    if (!req.files) {
      return res.status(400).json({ msg: "Please add an image to it" });
    }

    if (req.files) {
      file = req.files[0];
    }

    const Radiodata = await Episode.findById({ _id: req.params.id });
    // if (!Radiodata && req.files.length > 0) {
    //   fs.unlink(`uploads/radio/${file.filename}`, (err) => {
    //     if (err) {
    //       console.error("Error deleting radio cat image:", err);
    //     }
    //   });
    //   return res.status(200).send("radio not found");
    // }
    // if (Radiodata && file) {
    //   fs.unlink(`uploads/radio/${Radiodata.image}`, (err) => {
    //     if (err) {
    //       console.error("Error deleting radio cat image:", err);
    //     }
    //   });
    // }
    const updateRadio = await Episode.findByIdAndUpdate(
      { _id: req.params.id },
      {
        title: heading,
        image: file ? file.key : Radiodata.image,
        recording,
        season,
        duration,
        radioCategory:
          radioCategory !== "" ? radioCategory : Radiodata.radioCategory,
        radio: radio !== "" ? radio : Radiodata.radio,
        seasonEpisode,
      },
      {
        returnDocument: "after",
      }
    );

    res.status(200).json({ Success: "Data updated", updateRadio });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

const deleteepisode = async (req, res) => {
  try {
    const deleteData = await Episode.findByIdAndDelete({
      _id: req.params.id,
    });

    if (!deleteData) {
      return res.status(404).json({ Error: "Radio not found" });
    }

    // Delete the associated image from the 'uploads' folder
    if (deleteData.image) {
      fs.unlink(`uploads/radio/${deleteData.image}`, (err) => {
        if (err) {
          console.error("Error deleting radio image:", err);
        }
      });
    }

    res.json({ Success: "Data deleted", deleteData });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

const getepisodebyID = async (req, res) => {
  try {
    const episodes = await Episode.findById(req.params.eid)
      .populate("fpo")
      .populate("radio")
      .populate("season")
      .populate("radioCategory");
    res.status(200).json({ episodes });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

const getFPOData = async (req, res) => {
  try {
    const fpoId = req.body.radiocatid;
    const Radiocat = await RadioCat.findById(fpoId);

    if (!Radiocat) {
      return res.status(404).json({ msg: "Radio Cat not found" });
    }

    const limitQuery = {
      page: req.body.page || 1,
      limit: req.body.limit || 10,
    };
    console.log(
      fpoId,
      Radiocat,
      limitQuery,
      "***********************************"
    );

    const radios = await pagination(
      Radio_Record,
      Radio_Record.find({ radioCategory: fpoId, status: 1 }),
      limitQuery
    );

    const count = await Radio_Record.countDocuments({
      radioCategory: fpoId,
      status: 1,
    });

    console.log(radios, "adios/////////////////");
    // const radios = await Radio_Record.find({ fpo: fpoId });
    const result = [];

    for (const radio of radios.results) {
      const radioObj = radio.toObject();

      const seasons = await Season.find({ radio: radio._id, status: 1 });
      const seasonArray = [];

      for (const season of seasons) {
        const seasonObj = season.toObject();

        const episodes = await Episode.find({
          season: season._id,
          radio: radio._id,
          status: 1,
        });
        seasonObj.episodes = episodes;
        seasonArray.push(seasonObj);
      }

      radioObj.seasons = seasonArray;
      result.push(radioObj);
    }
    const latestEpisode = await Episode.findOne({
      radioCategory: fpoId,
      status: 1,
    })
      .sort({ createdAt: -1 })
      .populate("season")
      .populate("radioCategory")
      .populate("radio");

    res.status(200).json({
      status: true,
      msg: "",
      data: { result, latestEpisode },
      total_count: count,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

const getRadioData = async (req, res) => {
  try {
    const radioId = req.body.radioid;

    const radio = await Radio_Record.findById(radioId);

    if (!radio) {
      return res.status(404).json({ msg: "Radio not found" });
    }

    const limitQuery = {
      page: req.body.page || 1,
      limit: req.body.limit || 10,
    };

    const seasons = await pagination(
      Season,
      Season.find({ radio: radioId, status: 1 }),
      limitQuery
    );

    const count = await Season.countDocuments({ radio: radioId, status: 1 });

    console.log(seasons, "seasons***********");
    // const seasons = await Season.find({ radio: radioId });
    const result = [];

    for (const season of seasons.results) {
      const seasonObj = season.toObject();

      const episodes = await Episode.find({
        season: season._id,
        radio: radioId,
        status: 1,
      });
      seasonObj.episodes = episodes;
      result.push(seasonObj);
    }
    res
      .status(200)
      .json({ status: true, msg: "", total_count: count, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = {
  addNewCategory,
  upload,
  updateCategory,
  UpdateCatStatus,
  deleteCategory,
  listAllAdminCategory,
  ListOneCategory,
  addNewRadio,
  updateRadio,
  UpdateRadioStatus,
  getAllAdminRadio,
  getRadioById,
  deleteRadio,
  listAllAdminCategory_fpo,
  addSeason,
  getAllSeasons,
  getSeasonsByFPO,
  editSeason,
  editSeasonStatus,
  getseasonbyradio,
  deleteseason,
  getSeasonsByradio,
  addNewepisode,
  getepisodebyseason,
  updateEpisode,
  editepisodeStatus,
  deleteepisode,
  getepisodebyID,
  getFPOData,
  getRadioData,
  listAllAdminCategories,
  listAllAdminCategories_fpo,
  listAlluserCategory,
  getSeasonsByradiolist,
  getAllAdminRadiolist,
  listAllAdminCategories_fpo_user,
};
