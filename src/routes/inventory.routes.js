const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware")
const inventoryController = require("../controllers/inventory.controller");


router.post(
    "/create-inventory",
    authMiddleware.authUser,
    inventoryController.createInventory
);

router.get(
    "/", 
    authMiddleware.authUser,
    inventoryController.getInventoryList
);

router.get(
    "/products",
    authMiddleware.authUser,
    inventoryController.getProductByName
);

router.post(
    "/update/:inventoryId",
    authMiddleware.authUser,
    inventoryController.updateInventory
)

router.delete(
    "/delete/:inventoryId",
    authMiddleware.authUser,
    inventoryController.deleteInventory
)

router.get(
    "/total-stock-value",
    authMiddleware.authUser,
    inventoryController.getTotalStockValue
)

router.get(
    "/low-stock-count",
    authMiddleware.authUser,
    inventoryController.getLowStockCount
)
module.exports = router;
