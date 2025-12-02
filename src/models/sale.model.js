const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true
    },
    saleId: { type: Number, unique: true },
    customerId : {type: Number, required : true},
    inventoryId: {type: Number, required: true},
    date: {
        type: Date,
        required: true,
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    customerPhone: {
        type: String,
        required: false,
    },
    productName: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    sellingPrice: {
        type: Number,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
    },
    finalTotal: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ["cash", "card", "upi", "bank"],
        required: true,
    },
    paidAmount: {
        type: Number,
        required: true,
    },
    pendingAmount: {
        type: Number,
        required: true,
    },
    notes: {
        type: String,
        default: "",
    },
    bill: {
        type: String,
        default: "",
    }
},{
    timestamps: true
});

const saleModel = mongoose.model("Sale", saleSchema);


module.exports = saleModel