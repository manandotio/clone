const express = require("express");
const authMiddleware = require("../middleware/auth.middleware")
const categoryController = require("../controllers/category.controller")
const router = express.Router()


router.post("/set-category", authMiddleware.authUser, categoryController.setCategoryName)
router.get("/get-category", authMiddleware.authUser, categoryController.getCategoryName)
router.post("/update/:itemId", authMiddleware.authUser, categoryController.updateCategoryName)
router.delete("/delete/:itemId", authMiddleware.authUser, categoryController.deleteCategoryName)

module.exports = router
