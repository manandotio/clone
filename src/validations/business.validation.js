const { body } = require("express-validator");

const otherDetails = [
    body("contact")
        .optional()
        .isNumeric()
        .withMessage("Contact Number must contain only numbers")
        .isLength({ min: 10, max: 10 })
        .withMessage("Contact Number  must be exactly 10 digits"),
    body("otherEmail")
        .optional()
        .isEmail()
        .withMessage("Not a valid email Address")
];


const businessRegistrationValidator = [
    body("businessName")
        .trim()
        .notEmpty().withMessage("Business name is required.")
        .isLength({ min: 2 }).withMessage("Business name must be at least 2 characters."),

    body("ownerName")
        .trim()
        .notEmpty().withMessage("Owner name is required.")
        .isLength({ min: 2 }).withMessage("Owner name must be at least 2 characters."),

    body("businessType")
        .notEmpty().withMessage("Business type is required.")
        .isIn(["wholesaler", "retailer"])
        .withMessage("Invalid business type."),

    body("category")
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage("Category must be at least 2 characters."),

    body("address")
        .optional()
        .trim()
        .isLength({ min: 5 }).withMessage("Address must be minimum 5 characters."),

    body("city")
        .optional()
        .trim()
        .isAlpha("en-IN", { ignore: " " })
        .withMessage("City must contain only letters."),

    body("pincode")
        .optional()
        .isNumeric().withMessage("Pincode must be numeric.")
        .isLength({ min: 6, max: 6 }).withMessage("Pincode must be exactly 6 digits."),

    body("language")
        .notEmpty().withMessage("Language is required.")
        .isIn(["English", "Hindi", "Gujarati", "Marathi", "Tamil", "Telugu"])
        .withMessage("Invalid language selection."),

    body("currency")
        .notEmpty().withMessage("Currency is required.")
        .isIn(["INR", "USD", "EUR"])
        .withMessage("Invalid currency selection."),

    body("gstin")
        .optional()
        .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
        .withMessage("Invalid GSTIN format.")
];

module.exports = businessRegistrationValidator;


module.exports = {
    otherDetails,
    businessRegistrationValidator
}
