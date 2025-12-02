const express = require("express");
const authMiddleware = require("../middleware/auth.middleware")
const productController = require("../controllers/product.controller")
const router = express.Router()

router.post("/set-product", authMiddleware.authUser, productController.setProductName)
router.get("/get-product", authMiddleware.authUser, productController.getProductName)
router.post("/update/:itemId", authMiddleware.authUser, productController.updateProductName)
router.delete("/delete/:itemId", authMiddleware.authUser, productController.deleteProductName)

module.exports= router