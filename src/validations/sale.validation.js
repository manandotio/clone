const { body } = require("express-validator");

const saleValidator = [
    body("date")
        .notEmpty()
        .withMessage("Date is required"),

    body("customerName")
        .notEmpty()
        .withMessage("Customer name is required")
        .isString()
        .withMessage("Customer Name must be a string"),

    body("customerPhone")
        .optional()
        .isNumeric()
        .withMessage("Supplier phone must contain only numbers")
        .isLength({ min: 10, max: 10 })
        .withMessage("Supplier phone must be exactly 10 digits"),

    body("productName")
        .notEmpty()
        .withMessage("Product name is required")
        .isString()
        .withMessage("Product Name must be a string"),

    body("quantity")
        .notEmpty()
        .withMessage("Quantity is required")
        .isInt({ min: 1 })
        .withMessage("Quantity must be at least 1"),

    body("sellingPrice")
        .notEmpty()
        .withMessage("Selling price is required")
        .isFloat({ min: 1 })
        .withMessage("Selling price must be valid"),

    body("totalAmount")
        .notEmpty()
        .withMessage("Total amount is required")
        .isFloat({ min: 0 })
        .withMessage("Total amount must be valid"),

    body("discount")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Discount must be valid"),

    body("finalTotal")
        .notEmpty()
        .withMessage("Final total is required")
        .isFloat({ min: 0 })
        .withMessage("Final total must be valid"),

    body("paymentMethod")
        .notEmpty()
        .withMessage("Payment method is required")
        .isIn(["cash", "card", "upi", "bank-transfer"])
        .withMessage("Invalid payment method"),

    body("paidAmount")
        .notEmpty()
        .withMessage("Paid amount is required")
        .isFloat({ min: 0 })
        .withMessage("Paid amount must be valid"),

    body("pendingAmount")
        .notEmpty()
        .withMessage("Pending amount is required")
        .isFloat({ min: 0 })
        .withMessage("Pending amount must be valid"),

    body("notes")
        .optional()
        .isString()
        .withMessage("Notes must be a string"),

    body("bill")
        .optional()
        .isString()
        .withMessage("Bill must be a string"),
];

module.exports = saleValidator;
