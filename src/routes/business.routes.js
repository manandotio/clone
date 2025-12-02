const express = require("express");
const authMiddleware = require("../middleware/auth.middleware")
const businessController = require("../controllers/business.controller");
const uploadUser = require("../middleware/upload.user.middleware");
const validation = require("../validations/business.validation");
const validate = require("../validations/validate")

const router = express.Router()

router.post("/register",authMiddleware.authUser, businessController.registerBusiness)

router.post(
    "/other-details",
    uploadUser.single("photo"),
    validation.otherDetails,
    validate,
    authMiddleware.authUser,
    businessController.additionalBusinessInfo
)

module.exports= router