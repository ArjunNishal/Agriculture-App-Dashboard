const express = require("express");
const multer = require("multer");
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const multerS3 = require("multer-s3");
const path = require("path");

require("dotenv").config();

const BUCKET_NAME = process.env.BUCKET_NAME;
const REGION = process.env.REGION;
const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

const s3Client = new S3Client({
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
  region: REGION,
});

const uploadwithMulter = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldname: file.fieldname });
    },

    key: (req, file, cb) => {
      // Define the folder structure in S3 similar to local folder
      const folder = "uploads/profile/";
      cb(
        null,
        folder +
          file.fieldname +
          "-" +
          Date.now().toString() +
          path.extname(file.originalname)
      );
    },
  }),
});

const uploadfpoimage = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldname: file.fieldname });
    },

    key: (req, file, cb) => {
      // Define the folder structure in S3 similar to local folder
      const folder = "uploads/fpo/";
      cb(
        null,
        folder +
          file.fieldname +
          "-" +
          Date.now().toString() +
          path.extname(file.originalname)
      );
    },
  }),
});

const uploadNews = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldname: file.fieldname });
    },

    key: (req, file, cb) => {
      // Define the folder structure in S3 similar to local folder
      const folder = "uploads/news/";
      cb(
        null,
        folder +
          file.fieldname +
          "-" +
          Date.now().toString() +
          path.extname(file.originalname)
      );
    },
  }),
});

const uploadBanners = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldname: file.fieldname });
    },

    key: (req, file, cb) => {
      // Define the folder structure in S3 similar to local folder
      const folder = "uploads/banner/";
      cb(
        null,
        folder +
          file.fieldname +
          "-" +
          Date.now().toString() +
          path.extname(file.originalname)
      );
    },
  }),
});

const uploadwithMulterNotification = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldname: file.fieldname });
    },

    key: (req, file, cb) => {
      // Define the folder structure in S3 similar to local folder
      const folder = "uploads/notifications/";
      cb(
        null,
        folder +
          file.fieldname +
          "-" +
          Date.now().toString() +
          path.extname(file.originalname)
      );
    },
  }),
});

const uploadwithMulterRadio = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldname: file.fieldname });
    },

    key: (req, file, cb) => {
      // Define the folder structure in S3 similar to local folder
      const folder = "uploads/radio/";
      cb(
        null,
        folder +
          file.fieldname +
          "-" +
          Date.now().toString() +
          path.extname(file.originalname)
      );
    },
  }),
});

const uploadwithMulterFig = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldname: file.fieldname });
    },

    key: (req, file, cb) => {
      // Define the folder structure in S3 similar to local folder
      const folder = "uploads/fig/";
      cb(
        null,
        folder +
          file.fieldname +
          "-" +
          Date.now().toString() +
          path.extname(file.originalname)
      );
    },
  }),
});

const uploadwithMulterarray = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldname: file.fieldname });
    },
    key: (req, file, cb) => {
      // Define the folder structure in S3 similar to local folder
      const folder = "uploads/profile/";
      cb(
        null,
        folder +
          file.fieldname +
          "-" +
          Date.now().toString() +
          path.extname(file.originalname)
      );
    },
  }),
});

module.exports = {
  uploadwithMulter,
  uploadwithMulterarray,
  uploadfpoimage,
  uploadBanners,
  uploadNews,
  uploadwithMulterNotification,
  uploadwithMulterRadio,
  uploadwithMulterFig,
};
