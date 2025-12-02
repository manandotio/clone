
const mongoose = require("mongoose")

const supplierSchema = mongoose.Schema({
  userId: { type: String, required: true },
  idCount: { type: Number, default: 0 },
  supplier: [
    {
      supplierId: Number,
      name: String
    }
  ]
})

const supplierModel = mongoose.model("supplier", supplierSchema)

module.exports = supplierModel