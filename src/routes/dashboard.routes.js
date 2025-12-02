const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware")
const dashboardController = require("../controllers/dashboard.controller");

router.get("/", authMiddleware.authUser, dashboardController.getDashboardData);
router.get("/export-pdf", authMiddleware.authUser, dashboardController.exportDashboardPDF);


module.exports = router;
