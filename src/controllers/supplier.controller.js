
const supplierModel = require("../models/supplier.model")

async function setSupplierInfo(req, res) {
    try {
        const { supplier } = req.body;
        const { userId } = req.user;

        const updated = await supplierModel.findOneAndUpdate(
            { userId },
            { $inc: { idCount: 1 } },
            { new: true, upsert: true }
        );

        const newItemId = updated.idCount;

        await supplierModel.findOneAndUpdate(
            { userId },
            {
                $addToSet: {
                    supplier: {
                        supplierId: newItemId,
                        name: supplier
                    }
                }
            },
            { new: true }
        );

        return res.json({
            status: true,
            message: "Supplier added successfully",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
}

async function getSupplierInfo(req, res) {
    try {
        const { userId } = req.user;

        const supplier = await supplierModel.findOne({
            userId
        }).select("-_id -supplier._id")

        if (!supplier) {
            return res.json({
                status: false,
                message: "Supplier does not exist, please create it"
            })
        }

        return res.json({
            status: true,
            message: "Supplier fetched successfully",
            data: supplier.supplier,
        })
    } catch (error) {
        return res.json({
            status: false,
            message: "Server error",
            error
        })
    }
}

async function updateSupplierName(req, res) {
    try {
        const { itemId } = req.params;
        const { newName } = req.body;
        const { userId } = req.user;

        const result = await supplierModel.findOneAndUpdate(
            { userId, "supplier.supplierId": itemId },
            {
                $set: { "supplier.$.name": newName }
            },
            { new: true }
        ).select("-_id -supplier._id");

        if (!result) {
            return res.json({
                status: false,
                message: "Supplier not found"
            });
        }

        return res.json({
            status: true,
            message: "Supplier updated successfully",
            data: result.supplier
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
}

async function deleteSupplierInfo(req, res) {
    try {
        const { itemId } = req.params;
        const { userId } = req.user;

        const result = await supplierModel.findOneAndUpdate(
            { userId },
            {
                $pull: { supplier: { supplierId: itemId } }
            },
            { new: true }
        ).select("-_id -supplier._id");

        if (!result) {
            return res.json({
                status: false,
                message: "Supplier not found"
            });
        }

        return res.json({
            status: true,
            message: "Supplier deleted successfully",
            data: result.supplier
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
}

module.exports = {
    setSupplierInfo,
    getSupplierInfo,
    updateSupplierName,
    deleteSupplierInfo
}