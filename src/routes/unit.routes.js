const express = require("express");
const authMiddleware = require("../middleware/auth.middleware")
const unitController = require("../controllers/unit.controller")
const router = express.Router()


router.post("/set-unit", authMiddleware.authUser, unitController.setUnitType)
router.get("/get-unit", authMiddleware.authUser, unitController.getUnitType)
router.post("/update/:itemId", authMiddleware.authUser, unitController.updateUnitType)
router.delete("/delete/:itemId", authMiddleware.authUser, unitController.deleteUnitType)

module.exports = router
