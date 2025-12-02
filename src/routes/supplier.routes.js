const express = require("express");
const authMiddleware = require("../middleware/auth.middleware")
const supplierController = require("../controllers/supplier.controller")
const router = express.Router()


router.post("/set-supplier", authMiddleware.authUser, supplierController.setSupplierInfo)
router.get("/get-supplier", authMiddleware.authUser, supplierController.getSupplierInfo)
router.post("/update/:itemId", authMiddleware.authUser, supplierController.updateSupplierName)
router.delete("/delete/:itemId", authMiddleware.authUser, supplierController.deleteSupplierInfo)

module.exports= router