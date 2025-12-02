const { body } = require("express-validator");

const purchaseValidator = [
    body("date")
        .notEmpty()
        .withMessage("Date is required"),

    body("supplier")
        .notEmpty()
        .withMessage("Supplier name is required"),

    body("supplierPhone")
        .optional()
        .isNumeric()
        .withMessage("Supplier phone must contain only numbers")
        .isLength({ min: 10, max: 10 })
        .withMessage("Supplier phone must be exactly 10 digits"),

    body("category")
        .notEmpty()
        .withMessage("Category is required")
        .isString()
        .withMessage("Category value must be a string"),

    body("productName")
        .notEmpty()
        .withMessage("Product name is required")
        .isString()
        .withMessage("Producty Name must be a string"),

    body("unitType")
        .notEmpty()
        .withMessage("Unit type is required"),

    body("quantity")
        .notEmpty()
        .withMessage("Quantity is required")
        .isInt({ min: 1 })
        .withMessage("Quantity must be at least 1"),

    body("price")
        .notEmpty()
        .withMessage("Price is required")
        .isFloat({ min: 0 })
        .withMessage("Price must be a valid number"),

    body("totalAmount")
        .notEmpty()
        .withMessage("Total amount is required")
        .isFloat({ min: 0 })
        .withMessage("Total amount must be a valid number"),

    body("paidAmount")
        .notEmpty()
        .withMessage("Paid amount is required")
        .isFloat({ min: 0 })
        .withMessage("Paid amount must be a valid number"),

    body("dueAmount")
        .notEmpty()
        .withMessage("Due amount is required")
        .isFloat({ min: 0 })
        .withMessage("Due amount must be a valid number"),

    body("paymentMethod")
        .notEmpty()
        .withMessage("Payment method is required")
        .isIn(["cash", "card", "upi", "bank-transfer"])
        .withMessage("Invalid payment method"),

    body("notes")
        .optional()
        .isString()
        .withMessage("Notes must be a string"),
];

module.exports = purchaseValidator;
