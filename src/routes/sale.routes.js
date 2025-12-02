const express = require("express");
const authMiddleware = require("../middleware/auth.middleware")
const saleController = require("../controllers/sale.controller")
const saleValidator = require("../validations/sale.validation")
const validate = require("../validations/validate")
const upload = require("../middleware/upload.bill.middleware")
const router = express.Router()

router.post(
    "/set-sale",
    upload.single("bill"),
    saleValidator,
    validate,
    authMiddleware.authUser,
    saleController.saleItem
);

router.get(
    "/get-sales",
    authMiddleware.authUser,
    saleController.getSaleRecordByUser
)

router.post(
    "/update/:saleId",
    upload.single("bill"),
    authMiddleware.authUser,
    saleController.updateSaleRecordByUser
)

router.delete(
    "/delete/:saleId",
    authMiddleware.authUser,
    saleController.deleteSaleRecordByUser
)

module.exports = router