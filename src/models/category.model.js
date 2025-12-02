
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    idCount: { type: Number, default: 0 },
    category: [
      {
        categoryId: Number,
        name: String
      }
    ]
  }
);

const categoryModel = mongoose.model("Category", categorySchema);

module.exports = categoryModel;
