const express = require("express");
const authMiddleware = require("../middleware/auth.middleware")
const purchaseController = require("../controllers/purchase.controller")
const purchaseValidator = require("../validations/purchase.validation")
const validate = require("../validations/validate")
const upload = require("../middleware/upload.bill.middleware")
const router = express.Router()

router.post(
    "/set-purchase",
    upload.single("bill"),  
    purchaseValidator,   
    validate,
    authMiddleware.authUser,
    purchaseController.purchaseItem
);

router.get(
    "/",
    authMiddleware.authUser,
    purchaseController.getPurchaseRecordsByUser
)

router.post(
    "/update/:purchaseId",
    upload.single("bill"),
    authMiddleware.authUser,
    purchaseController.updatePurchaseRecordByUser
);


router.delete(
    "/delete/:purchaseId",
    authMiddleware.authUser,
    purchaseController.deletePurchaseByUser
);



module.exports = router