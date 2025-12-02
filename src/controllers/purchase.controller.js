const inventoryModel = require("../models/inventory.model");
const purchaseModel = require("../models/purchase.model");
const generateInvoice = require("../services/invoice.generator");


async function purchaseItem(req, res) {
    try {
        const {
            date,
            supplier,
            supplierPhone,
            category,
            productName,
            unitType,
            quantity,
            price,
            totalAmount,
            paidAmount,
            dueAmount,
            paymentMethod,
            notes,
        } = req.body;
        const invoiceNumber = await generateInvoice("purchase");
        const { userId } = req.user;

        if (!productName || !unitType || !category || !quantity || !price) {
            return res.status(400).json({
                status: false,
                message: "productName, unitType, category, quantity, and price are required."
            });
        }

        let bill = req.file ? `/uploads/bills/${req.file.filename}` : "";

        let inventory = await inventoryModel.findOne({ userId, productName, unitType, category });

        if (inventory) {
            inventory.totalStockValue = Number(inventory.totalStockValue) + Number(quantity);
            inventory.purchaseValue = Number(inventory.purchaseValue) + Number(totalAmount);
            inventory.lastPurchaseDate = date || new Date();
            if (!inventory.category && category) inventory.category = category;
            await inventory.save();

        } else {
            const lastInventory = await inventoryModel.findOne({ userId }).sort({ inventoryId: -1 }).lean();
            const inventoryId = lastInventory ? lastInventory.inventoryId + 1 : 1;

            inventory = await inventoryModel.create({
                inventoryId,
                userId,
                productName,
                unitType,
                purchaseValue: totalAmount,
                category: category,
                totalStockValue: quantity,
                lastPurchaseDate: date || new Date()
            });
        }

        const lastPurchase = await purchaseModel.findOne({ userId }).sort({ purchaseId: -1 }).lean();
        const purchaseId = lastPurchase ? lastPurchase.purchaseId + 1 : 1;

        await purchaseModel.create({
            purchaseId,
            userId,
            date,
            supplier,
            supplierPhone,
            invoiceNumber,
            category,
            productName,
            unitType,
            quantity,
            price,
            totalAmount,
            paidAmount,
            dueAmount,
            paymentMethod,
            notes,
            bill
        });

        return res.json({
            status: true,
            message: "Purchase recorded and inventory updated successfully.",
        });

    } catch (error) {
        console.error("Purchase error:", error);
        return res.status(500).json({ status: false, message: "Server error", error: error.message });
    }
}

async function getPurchaseRecordsByUser(req, res) {
    try {
        const { userId } = req.user;
        let { page, limit } = req.query;

        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;

        const skip = (page - 1) * limit;

        const purchaseRecords = await purchaseModel
            .find({ userId })
            .sort({ purchaseId: -1 })
            .skip(skip)
            .limit(limit)
            .select("-_id");

        if (!purchaseRecords || purchaseRecords.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No Purchase records found."
            });
        }

        const totalRecords = await purchaseModel.countDocuments({ userId });
        const totalPages = Math.ceil(totalRecords / limit);

        return res.status(200).json({
            status: true,
            message: "Purchase records fetched successfully.",
            data: [{
                totalRecords,
                totalPages,
                purchaseRecords
            }]
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Server error",
            error: error.message
        });
    }
}

async function updatePurchaseRecordByUser(req, res) {
    try {
        const { userId } = req.user;
        const { purchaseId } = req.params;

        if (!purchaseId) {
            return res.status(400).json({ status: false, message: "purchaseId is required" });
        }

        const allowedFields = [
            "date", "supplier", "supplierPhone", "category", "productName",
            "unitType", "quantity", "price", "totalAmount", "paidAmount",
            "dueAmount", "paymentMethod", "notes"
        ];

        const updateData = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        if (updateData.quantity) updateData.quantity = Number(updateData.quantity);
        if (updateData.totalAmount) updateData.totalAmount = Number(updateData.totalAmount);
        if (updateData.price) updateData.price = Number(updateData.price);

        const existingPurchase = await purchaseModel.findOne({ userId, purchaseId });

        if (!existingPurchase) {
            return res.status(404).json({ status: false, message: "Purchase not found" });
        }

        const oldQuantity = Number(existingPurchase.quantity);
        const oldTotalAmount = Number(existingPurchase.totalAmount);

        
        const oldInventory = await inventoryModel.findOne({
            userId,
            productName: existingPurchase.productName,
            category: existingPurchase.category,
            unitType: existingPurchase.unitType
        });

        if (oldInventory) {
            oldInventory.totalStockValue -= oldQuantity;

            if (oldInventory.totalStockValue < 0) oldInventory.totalStockValue = 0;

            oldInventory.purchaseValue -= oldTotalAmount;
            if (oldInventory.purchaseValue < 0) oldInventory.purchaseValue = 0;

            await oldInventory.save();
        }

        const newProductName = updateData.productName || existingPurchase.productName;
        const newCategory = updateData.category || existingPurchase.category;
        const newUnitType = updateData.unitType || existingPurchase.unitType;
        const newQuantity = updateData.quantity || existingPurchase.quantity;
        const newTotalAmount = updateData.totalAmount || existingPurchase.totalAmount;

        let newInventory = await inventoryModel.findOne({
            userId,
            productName: newProductName,
            category: newCategory,
            unitType: newUnitType
        });

        if (!newInventory) {
            const lastInventory = await inventoryModel.findOne({ userId }).sort({ inventoryId: -1 });
            const newInventoryId = lastInventory ? lastInventory.inventoryId + 1 : 1;

            newInventory = new inventoryModel({
                inventoryId: newInventoryId,
                userId,
                productName: newProductName,
                category: newCategory,
                unitType: newUnitType,
                purchaseValue: 0,
                saleValue: 0,
                quantityAlert: 5,
                totalStockValue: 0,
                lastPurchaseDate: updateData.date || existingPurchase.date
            });
        }


        newInventory.totalStockValue = Number(newInventory.totalStockValue) + Number(newQuantity);
        newInventory.purchaseValue = Number(newInventory.purchaseValue) + Number(newTotalAmount);
        newInventory.lastPurchaseDate = updateData.date || newInventory.lastPurchaseDate;

        await newInventory.save();

  
        await purchaseModel.findOneAndUpdate(
            { userId, purchaseId },
            { $set: updateData },
            { new: true }
        );

        return res.json({
            status: true,
            message: "Purchase updated and inventory fixed successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Server error",
            error: error.message
        });
    }
}

async function deletePurchaseByUser(req, res) {
    try {
        const { purchaseId } = req.params;

        const { userId } = req.user;
        (userId);

        if (!userId) {
            return res.status(400).json({
                status: false,
                message: "userId is required."
            });
        }

        if (!purchaseId) {
            return res.status(400).json({
                status: false,
                message: "purchaseId is required."
            });
        }

        const purchaseRecord = await purchaseModel.findOne({ userId, purchaseId });

        if (!purchaseRecord) {
            return res.status(404).json({
                status: false,
                message: "Purchase record not found."
            });
        }

        const { productName, quantity, supplier, unitType } = purchaseRecord;

        await purchaseModel.findOneAndDelete({ userId, purchaseId });

        const inventoryRecord = await inventoryModel.findOne({
            userId,
            productName,
            supplier,
            unitType
        });

        if (inventoryRecord) {
            let newStock = inventoryRecord.totalStockValue - quantity;
            if (newStock < 0) newStock = 0;

            inventoryRecord.totalStockValue = newStock;
            await inventoryRecord.save();
        }

        return res.json({
            status: true,
            message: "Purchase record deleted and inventory updated."
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Server error",
            error: error.message
        });
    }
}

module.exports = {
    purchaseItem,
    getPurchaseRecordsByUser,
    updatePurchaseRecordByUser,
    deletePurchaseByUser
}
