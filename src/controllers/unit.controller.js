
const unitModel = require("../models/unit.model");

async function setUnitType(req, res) {
    try {
        const { unit } = req.body;
        const { userId } = req.user;

        const updated = await unitModel.findOneAndUpdate(
            { userId },
            { $inc: { idCount: 1 } },
            { new: true, upsert: true }
        );

        const newItemId = updated.idCount;

        await unitModel.findOneAndUpdate(
            { userId },
            {
                $addToSet: {
                    unit: {
                        unitId: newItemId,
                        name: unit
                    }
                }
            },
            { new: true }
        );

        return res.json({
            status: true,
            message: "Unit added successfully",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
}

async function getUnitType(req, res) {
    try {
        const { userId } = req.user;

        const unit = await unitModel.findOne({
            userId
        }).select("-_id -unit._id")

        if (!unit) {
            return res.json({
                status: false,
                message: "Unit does not exist, please create it"
            })
        }

        return res.json({
            status: true,
            message: "Unit fetched successfully",
            data: unit.unit,
        })
    } catch (error) {
        return res.json({
            status: false,
            message: "Server error",
            error
        })
    }
}

async function updateUnitType(req, res) {
    try {
        const { itemId } = req.params;
        const { newName } = req.body;
        const { userId } = req.user;

        const result = await unitModel.findOneAndUpdate(
            { userId, "unit.unitId": itemId },
            {
                $set: { "unit.$.name": newName }
            },
            { new: true }
        ).select("-_id -unit._id");

        if (!result) {
            return res.json({
                status: false,
                message: "Unit not found"
            });
        }

        return res.json({
            status: true,
            message: "Unit updated successfully",
            data: result.unit
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
}

async function deleteUnitType(req, res) {
    try {
        const { itemId } = req.params;
        const { userId } = req.user;

        const result = await unitModel.findOneAndUpdate(
            { userId },
            {
                $pull: { unit: { unitId: itemId } }
            },
            { new: true }
        ).select("-_id -unit._id");

        if (!result) {
            return res.json({
                status: false,
                message: "Unit not found"
            });
        }

        return res.json({
            status: true,
            message: "Unit deleted successfully",
            data: result.unit
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
    setUnitType,
    getUnitType,
    updateUnitType,
    deleteUnitType
}
