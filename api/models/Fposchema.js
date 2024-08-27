const mongoose = require("mongoose");

const fpoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    members: {
      type: Number,
      default: 0,
    },
    registeredOn: {
      type: Date,
    },
    promoter: {
      type: String,
    },
    totalFpoCapital: {
      type: Number,
      default: 0,
    },
    sharePerMember: {
      type: Number,
    },
    villagesServed: {
      type: Number,
      default: 0,
    },
    products: {
      type: Array,
      default: [],
    },
    productsarray: {
      type: String,
      default: "",
    },
    numberOfDirectors: {
      type: Number,
    },
    totalFIGs: {
      type: Number,
    },
    fpopic: {
      type: String,
    },
    privacy: {
      type: String,
    },
    about: {
      type: String,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    theme: {
      themecolor1: {
        type: String,
        default: "#67D18B",
      },
      themecolor2: {
        type: String,
        default: "#5CBDAA",
      },
      backgroundColor1: {
        type: String,
        default: "#67D18B",
      },
      backgroundColor2: {
        type: String,
        default: "#5CBDAA",
      },
      iconsColor: {
        type: String,
        default: "#000000",
      },
      sectionscolor: {
        type: String,
        default: "#fffff",
      },
      logo: {
        type: String,
        default: "default/logo.png",
      },
      language: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Language",
        },
      ],
      banner: {
        banner1: {
          imageName: {
            type: String,
          },
        },
        banner2: {
          imageName: {
            type: String,
          },
        },
        banner3: {
          imageName: {
            type: String,
          },
        },
      },
      support: {
        whatsappNo: {
          type: String,
        },
        mobileNo: {
          type: String,
        },
        email: {
          type: String,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

const FPO = mongoose.model("FPO", fpoSchema);

module.exports = FPO;
