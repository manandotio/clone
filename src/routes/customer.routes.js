const express = require("express");
const authMiddleware = require("../middleware/auth.middleware")
const customerController = require("../controllers/customer.controller")
const router = express.Router()

router.post("/", authMiddleware.authUser, customerController.createCustomer)

router.get("/pending-payment", authMiddleware.authUser, customerController.pendingList)

router.get("/pending-payment/search", authMiddleware.authUser, customerController.searchPayments)

router.get("/cerdit", authMiddleware.authUser, customerController.creditAmountAndCount)

router.get("/pending-payment/filter", authMiddleware.authUser, customerController.filterPendingPayments)

router.get("/pending-payment/download", authMiddleware.authUser, customerController.downloadPendingPaymentsPDF)

module.exports= router