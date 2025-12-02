const productModel = require("../models/product.model");

async function setProductName(req, res) {
    try {
        const { product } = req.body;
        const { userId } = req.user;

        const updated = await productModel.findOneAndUpdate(
            { userId },
            { $inc: { idCount: 1 } },  
            { new: true, upsert: true }
        );

        const newItemId = updated.idCount;

        const productName = await productModel.findOneAndUpdate(
            { userId },
            {
                $addToSet: {
                    product: {
                        productId: newItemId,
                        name: product
                    }
                }
            },
            { new: true }
        );

        return res.json({
            status: true,
            message: "Product added successfully",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
}

async function getProductName(req, res) {
    try {
        const { userId } = req.user;

        const product = await productModel.findOne({
            userId
        }).select("-_id -product._id")

        if (!product) {
            return res.json({
                status: false,
                message: "product does not exist please create it"
            })
        }

        return res.json({
            status: true,
            message: "product fetched Successfully",
            data: product.product,
        })
    } catch (error) {
        return res.json({
            status: false,
            message: "Server error",
            error
        })
    }
}


async function deleteProductName(req, res) {
    try {
        const { itemId } = req.params;
        const { userId } = req.user;

        const result = await productModel.findOneAndUpdate(
            { userId },
            {
                $pull: { product: { productId: itemId } }  // delete by productId
            },
            { new: true }
        ).select("-_id -product._id");

        if (!result) {
            return res.json({
                status: false,
                message: "Product not found"
            });
        }

        return res.json({
            status: true,
            message: "Product deleted successfully",
            data: result.product
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Server error"
        });
    }
}


async function updateProductName(req, res) {
    try {
        const { itemId } = req.params;
        const { newName } = req.body;
        const { userId } = req.user;

        const result = await productModel.findOneAndUpdate(
            { userId, "product.productId": itemId },  
            {
                $set: { "product.$.name": newName }
            },
            { new: true }
        ).select("-_id -product._id");

        if (!result) {
            return res.json({
                status: false,
                message: "Product not found"
            });
        }

        return res.json({
            status: true,
            message: "Product updated successfully",
            data: result.product
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Server error"
        });
    }
}



module.exports = {
    setProductName,
    getProductName,
    updateProductName,
    deleteProductName
}