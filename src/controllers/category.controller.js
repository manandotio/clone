
const categoryModel = require("../models/category.model");

async function setCategoryName(req, res) {
    try {
        const { category } = req.body;
        const { userId } = req.user;

        const updated = await categoryModel.findOneAndUpdate(
            { userId },
            { $inc: { idCount: 1 } },
            { new: true, upsert: true }
        );

        const newItemId = updated.idCount;

        await categoryModel.findOneAndUpdate(
            { userId },
            {
                $addToSet: {
                    category: {
                            categoryId: newItemId,
                            name: category
                        }
                }
            },
            { new: true }
        );

        return res.json({
            status: true,
            message: "Category added successfully",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
}

async function getCategoryName(req, res) {
    try {
        const { userId } = req.user;

        const category = await categoryModel.findOne({
            userId
        }).select("-_id -category._id")

        if (!category) {
            return res.json({
                status: false,
                message: "Category does not exist, please create it"
            })
        }

        return res.json({
            status: true,
            message: "Category fetched successfully",
            data: category.category,
        })
    } catch (error) {
        return res.json({
            status: false,
            message: "Server error",
            error
        })
    }
}

async function updateCategoryName(req, res) {
    try {
        const { itemId } = req.params;
        const { newName } = req.body;
        const { userId } = req.user;

        const result = await categoryModel.findOneAndUpdate(
            { userId, "category.categoryId": itemId },
            {
                $set: { "category.$.name": newName }
            },
            { new: true }
        ).select("-_id -category._id");

        if (!result) {
            return res.json({
                status: false,
                message: "Category not found"
            });
        }

        return res.json({
            status: true,
            message: "Category updated successfully",
            data: result.category
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
}

async function deleteCategoryName(req, res) {
    try {
        const { itemId } = req.params;
        const { userId } = req.user;

        const result = await categoryModel.findOneAndUpdate(
            { userId },
            {
                $pull: { category: { categoryId: itemId } }
            },
            { new: true }
        ).select("-_id -category._id");

        if (!result) {
            return res.json({
                status: false,
                message: "Category not found"
            });
        }

        return res.json({
            status: true,
            message: "Category deleted successfully",
            data: result.category
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
    setCategoryName,
    getCategoryName,
    updateCategoryName,
    deleteCategoryName
}
