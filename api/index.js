const serverless = require("serverless-http");
const connectDB = require("../src/db/db");
const app = require("../src/app");

let cachedHandler = null;

module.exports = async (req, res) => {
  // Connect to MongoDB once (cached)
  await connectDB();

  if (!cachedHandler) {
    cachedHandler = serverless(app);
  }

  return cachedHandler(req, res);
};
