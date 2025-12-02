const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    userId: { type: String, required: true },

    idCount: { type: Number, default: 0 },

    product: [
        {
            productId: Number,
            name: String
        }
    ]
});


const productModel = mongoose.model("product", productSchema)

module.exports = productModel;