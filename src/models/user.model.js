const mongoose = require('mongoose');
const mongooseSequence = require('mongoose-sequence')(mongoose);

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true, unique: true
    },
    userId: { type: Number, unique: true },
    email: {
        type: String,
        unique: true,
        required: true
    },
    otherEmail: {
        type: String,
        default: "",
    },
    contact: {
        type: Number,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    businessType: {
        type: String,
        enum: ["retailer", "wholesaler", ""],
    },
    businessName: {
        type: String,
        default: "",
    },
    ownerName: {
        type: String,
        default: "",
    },
    category: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: ""
    },
    pincode: {
        type: Number,
        default: null
    },
    language: {
        type: String,
        default: ""
    },
    currency: {
        type: String,
        default: ""
    },
    gstin: {
        type: String,
        default: ""
    },
    workingHours:{
        type: String,
        default: null
    },
    photo:{
        type: String,
        default: null
    },
    isProfileComplete: {
        type: Boolean,
        default: false
    }
});

userSchema.plugin(mongooseSequence, { inc_field: 'userId' });

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
