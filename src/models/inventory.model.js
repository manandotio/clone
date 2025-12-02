const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    inventoryId: {
      type: Number,
      required: true,
      unique: true
    },

    userId: {
      type: Number,
      required: true
    },

    productName: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      default: "",
    },

    unitType: {
      type: String,
      default: "", 
    },

    purchaseValue:{
      type: Number,
      default:0
    },

    saleValue:{
      type: Number,
      default: 0
    },
    
    quantityAlert:{
      type: Number,
      default:5
    },

    lastPurchaseDate: {
      type: Date,
      default: null
    },

    totalStockValue: {
      type: Number,
      default: 0, 
    },
  },
  { timestamps: true }
);

const inventoryModel = mongoose.model("Inventory", inventorySchema);

module.exports = inventoryModel;
