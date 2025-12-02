
const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    idCount: { type: Number, default: 0 },
    unit: [
      {
        unitId: Number,
        name: String
      }
    ]
  }
);

const unitModel = mongoose.model("Unit", unitSchema);

module.exports = unitModel;
