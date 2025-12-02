const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true
    },
    customerId: {
        type: Number,
        required: true,
    },
    customerName: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String,
        required: true
    },
    dueDate: {
        type: Number,
        default: 15
    },
    address: {
        type: String,
        default: ""
    },
    sales: [{
        totalAmount: {
            type: Number,
            default: 0
        },
        pendingAmount: {
            type: Number,
            default: 0
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        },
        saleId: {
            type: Number,
            default: null
        },
        status: {
            type: String,
            enum: ["pending", "cleared", ""],
            default: ""
        }
    }]

}, {
    timestamps: true
});

customerSchema.index({ customerName: 1 });
customerSchema.index({ customerPhone: 1 });
customerSchema.index({ status: 1 });


const customerModel = mongoose.model("customer", customerSchema);

module.exports = customerModel;
