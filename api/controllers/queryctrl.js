const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const Query = require("../models/querySchema");
const FPO = require("../models/Fposchema");
const { pagination } = require("./pagination");

const createQuery = async (req, res) => {
  try {
    const { name, message, phone, memberId, fpoId } = req.body;

    const newQuery = new Query({
      name,
      message,
      phone,
      member: memberId,
      fpo: fpoId,
      status: 1, // Default status is Active
    });

    const savedQuery = await newQuery.save();

    res.status(201).json({
      status: true,
      msg: "Query created successfully",
      data: savedQuery,
    });
  } catch (error) {
    console.error("Error creating query:", error.message);
    res.status(500).json({ error: "Error creating query" });
  }
};

const getAllQueries = async (req, res) => {
  try {
    const limitQuery = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };

    // const allQueries = await Query.find().populate("fpo").populate("member");

    const allQueries = await pagination(
      Query,
      Query.find().populate("fpo").populate("member").sort({ status: -1 }),
      limitQuery
    );
    res.status(200).json({
      status: true,
      msg: "successfull",
      data: allQueries,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to fetch queries" });
  }
};

const getQueriesByFPO = async (req, res) => {
  try {
    const fpoId = req.params.id;

    // Extract FPO ID from request parameters

    const limitQuery = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
    };
    const queriesByFPO = await pagination(
      Query,
      Query.find({ fpo: fpoId })
        .populate("fpo")
        .populate("member")
        .sort({ status: -1 }),
      limitQuery
    );
    // Fetch queries based on FPO ID
    // const queriesByFPO = await Query.find({ fpo: fpoId })
    //   .populate("fpo")
    //   .populate("member");

    res.status(200).json({
      status: true,
      msg: "successfull",
      data: queriesByFPO,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to fetch queries" });
  }
};

const changeQueryStatus = async (req, res) => {
  try {
    const queryId = req.params.queryId; // Extract Query ID from request parameters
    const { status } = req.body;

    // Update the status of the query
    const updatedQuery = await Query.findByIdAndUpdate(
      queryId,
      { status },
      { new: true }
    );

    res.status(200).json({
      status: true,
      msg: "Query status updated successfully",
      data: updatedQuery,
    });
  } catch (error) {
    console.error("Error updating query status:", error.message, error);
    res.status(500).json({ error: "Error updating query status" });
  }
};

const getPrivacyPolicy = async (req, res) => {
  try {
    const fpoId = req.params.fpoId;
    console.log(fpoId, "fpoId");

    const fpo = await FPO.findById(fpoId);

    if (!fpo) {
      return res.status(404).json({ error: "FPO not found" });
    }

    res.status(200).json({ privacyPolicy: fpo.privacy ? fpo.privacy : "" });
  } catch (error) {
    console.error("Error fetching privacy policy:", error);
    res.status(500).json({ error: "Error fetching privacy policy" });
  }
};

// Edit/Add privacy policy for an FPO
const editPrivacyPolicy = async (req, res) => {
  try {
    const fpoId = req.params.fpoId;
    const { privacyPolicy } = req.body;

    const fpo = await FPO.findById(fpoId);

    if (!fpo) {
      return res.status(404).json({ error: "FPO not found" });
    }

    fpo.privacy = privacyPolicy;
    await fpo.save();

    res.status(200).json({ msg: "Privacy policy updated successfully" });
  } catch (error) {
    console.error("Error updating privacy policy:", error.message);
    res.status(500).json({ error: "Error updating privacy policy" });
  }
};
// about

const getaboutus = async (req, res) => {
  try {
    const fpoId = req.params.fpoId;
    console.log(fpoId, "fpoId");
    const fpo = await FPO.findById(fpoId);

    if (!fpo) {
      return res.status(404).json({ error: "FPO not found" });
    }

    res.status(200).json({ aboutus: fpo.about ? fpo.about : "" });
  } catch (error) {
    console.error("Error fetching privacy policy:", error);
    res.status(500).json({ error: "Error fetching privacy policy" });
  }
};

// Edit/Add privacy policy for an FPO
const editaboutus = async (req, res) => {
  try {
    const fpoId = req.params.fpoId;
    const { aboutus } = req.body;

    const fpo = await FPO.findById(fpoId);

    if (!fpo) {
      return res.status(404).json({ error: "FPO not found" });
    }

    fpo.about = aboutus;
    await fpo.save();

    res.status(200).json({ msg: "Privacy policy updated successfully" });
  } catch (error) {
    console.error("Error updating privacy policy:", error.message);
    res.status(500).json({ error: "Error updating privacy policy" });
  }
};

module.exports = {
  createQuery,
  getAllQueries,
  getQueriesByFPO,
  changeQueryStatus,
  getPrivacyPolicy,
  editPrivacyPolicy,
  getaboutus,
  editaboutus,
};
