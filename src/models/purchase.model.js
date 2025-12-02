const mongoose = require("mongoose");
const purchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true
    },
    purchaseId: { type: Number, unique: true },

    date: {
      type: Date,
      default: Date.now
    },

    supplier: {
      type: String,
      default: ""
    },

    supplierPhone: {
      type: Number,
      default: ""
    },

    invoiceNumber: {
      type: String,
      default: ""
    },

    category: {
      type: String,
      default: ""
    },

    productName: {
      type: String,
      default: ""
    },

    unitType: {
      type: String,
      default: ""
    },

    quantity: {
      type: Number,
      default: 0
    },

    price: {
      type: Number,
      default: 0
    },

    totalAmount: {
      type: Number,
      default: 0
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    dueAmount: {
      type: Number,
      default: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "bank-transfer", "other"],
      default: "cash"
    },

    notes: {
      type: String,
      default: ""
    },

    bill: {
      type: String,
      default: ""
    },
  },
  { timestamps: true }
);

const purchaseModel = mongoose.model("Purchase", purchaseSchema);

module.exports = purchaseModel;