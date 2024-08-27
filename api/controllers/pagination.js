const path = require("path");

const pagination = async (DB, DBQuery, limitQuery) => {
  const page = parseInt(limitQuery.page);
  const limit = parseInt(limitQuery.limit);

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = {};
  // console.log(DB, DBQuery, limitQuery);

  const totalRecord = await DB.countDocuments().exec();
  results.totalRecord = totalRecord;
  if (endIndex < totalRecord) {
    results.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit,
    };
  }
  // try {
  const len = await DBQuery.clone().exec();
  results.results = await DBQuery.limit(limit).skip(startIndex).exec();
  results.totalRecord = len.length;
  return results;

  // } catch (e) {
  //     res.status(500).json({ msg: e.message })
  // }
};

module.exports = { pagination };
