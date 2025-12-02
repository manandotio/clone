const inventoryModel = require("../models/inventory.model");


async function createInventory(req, res) {
  try {
    const { userId } = req.user;

    const {
      productName,
      category,
      unitType,
      purchaseValue,
      saleValue,
      totalStockValue,
      notes
    } = req.body;

    if (!productName || !unitType || !category) {
      return res.status(400).json({
        status: false,
        message: "productName, unitType, and category are required."
      });
    }

    const existing = await inventoryModel.findOne({
      userId,
      productName,
      unitType,
      category
    });

    if (existing) {
      return res.status(400).json({
        status: false,
        message: "This inventory item already exists for the user."
      });
    }

    const lastInventory = await inventoryModel
      .findOne({ userId })
      .sort({ inventoryId: -1 })
      .lean();

    const inventoryId = lastInventory ? lastInventory.inventoryId + 1 : 1;

    const newInventory = await inventoryModel.create({
      inventoryId,
      userId,
      productName,
      category,
      unitType,
      purchaseValue,
      saleValue,
      totalStockValue: totalStockValue || 0,
      lastPurchaseDate: Date.now(),
      notes

    });

    return res.status(201).json({
      status: true,
      message: "Inventory created successfully.",
      data: newInventory
    });

  } catch (error) {
    console.error("Create inventory error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message
    });
  }
}

async function getInventoryList(req, res) {
  try {
    const { userId } = req.user;

    const inventory = await inventoryModel.find({ userId }).select("-_id -__v").sort({ updatedAt: -1 }) ;

    return res.json({
      success: true,
      message: "inventory fetched successfully",
      data: inventory
    });

  } catch (err) {
    console.log(err);
    return res.json({
      success: false,
      message: "Server error"
    });
  }
}

async function getProductByName(req, res) {
  const { userId } = req.user;

  const products = await inventoryModel.find({ userId }).select("productName category unitType supplier inventoryId");

  return res.json({
    status: true,
    message: "products fetched successfully.",
    data: products
  })

}

async function updateInventory(req, res) {
  try {
    const { userId } = req.user;
    const { inventoryId } = req.params;

    if (!inventoryId) {
      return res.status(400).json({
        status: false,
        message: "inventoryId is required in params."
      });
    }

    const allowedFields = [
      "productName",
      "category",
      "unitType",
      "supplier",
      "totalStockValue",
      "lastPurchaseDate"
    ];

    const updateData = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const existingInventory = await inventoryModel.findOne({
      userId,
      inventoryId
    });

    if (!existingInventory) {
      return res.status(404).json({
        status: false,
        message: "Inventory item not found."
      });
    }

    const newProductName = updateData.productName || existingInventory.productName;
    const newSupplier = updateData.supplier || existingInventory.supplier;
    const newUnitType = updateData.unitType || existingInventory.unitType;

    const duplicate = await inventoryModel.findOne({
      userId,
      productName: newProductName,
      supplier: newSupplier,
      unitType: newUnitType,
      inventoryId: { $ne: inventoryId }
    });

    if (duplicate) {
      return res.status(400).json({
        status: false,
        message: "Another inventory item with same productName, supplier, and unitType already exists."
      });
    }

    const updatedInventory = await inventoryModel.findOneAndUpdate(
      { userId, inventoryId },
      { $set: updateData },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: "Inventory updated successfully.",
      data: updatedInventory
    });

  } catch (error) {
    console.error("Update inventory error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message
    });
  }
}

async function deleteInventory(req, res) {
  try {
    const { userId } = req.user;
    const { inventoryId } = req.params;

    if (!inventoryId) {
      return res.status(400).json({
        status: false,
        message: "inventoryId is required."
      });
    }

    // Find and delete the inventory for this user
    const deletedInventory = await inventoryModel.findOneAndDelete({
      userId,
      inventoryId: Number(inventoryId) // ensure it's a number
    });

    if (!deletedInventory) {
      return res.status(404).json({
        status: false,
        message: "Inventory not found or already deleted."
      });
    }

    return res.json({
      status: true,
      message: "Inventory deleted successfully.",
      data: deletedInventory
    });

  } catch (error) {
    console.error("Delete inventory error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message
    });
  }
}

async function getTotalStockValue(req, res) {
  const { userId } = req.user;
  const totalStockValue = await inventoryModel.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        purchaseValue: { $sum: "$purchaseValue" }
      }
    }
  ]);

  return res.status(200).json({
    status: true,
    message: "Total stock value fetched successfully.",
    data: totalStockValue[0].purchaseValue
  })
}

async function getLowStockCount(req,res){
  const { userId } = req.user;
  const lowStockItems = await inventoryModel.countDocuments({
    userId,
    $expr: { $lte: ["$totalStockValue", "$quantityAlert"] }
  });
  
  return res.status(200).json({
    status: true,
    message: "Low stock items count fetched successfully.",
    data: lowStockItems
  })
}

module.exports = {
  createInventory,
  getInventoryList,
  updateInventory,
  deleteInventory,
  getProductByName,
  getTotalStockValue,
  getLowStockCount
};
