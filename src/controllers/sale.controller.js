const inventoryModel = require("../models/inventory.model");
const customerModel = require("../models/customer.model");
const saleModel = require("../models/sale.model");
const generateInvoiceNumber = require("../services/invoice.generator");

async function saleItem(req, res) {
    try {
        const {
            date,
            customerId,
            customerName,
            customerPhone,
            productName,
            quantity,
            sellingPrice,
            totalAmount,
            discount,
            finalTotal,
            paymentMethod,
            paidAmount,
            pendingAmount,
            notes
        } = req.body;

        const { userId } = req.user;
        const { inventoryId } = req.body;

        if (!customerId) {
            return res.status(400).json({
                status: false,
                message: "customerId is required."
            });
        }

        const customer = await customerModel.findOne({ customerId })
        if (!customer) {
            return res.status(400).json({
                status: false,
                message: "Customer does not exist"
            })
        }
        const invoiceNumber = await generateInvoiceNumber("sale");
        const inventory = await inventoryModel.findOne({ userId, inventoryId });

        if (!inventory || inventory.totalStockValue <= 0 || inventory.totalStockValue < quantity) {
            return res.status(400).json({
                status: false,
                message: "Not enough inventory or insufficient stock"
            });
        }

        let bill = "";
        if (req.file) {
            bill = `/uploads/bills/${req.file.filename}`;
        }

        const lastSale = await saleModel.findOne({ userId })
            .sort({ saleId: -1 })
            .lean();

        if (lastSale?.invoiceNumber === invoiceNumber) {
            return res.status(400).json({
                status: false,
                message: "Invoice number must be unique"
            });
        }

        const saleId = lastSale ? lastSale.saleId + 1 : 1;

        await saleModel.create({
            saleId,
            userId,
            customerId,
            inventoryId,
            date,
            invoiceNumber,
            customerName,
            customerPhone,
            productName,
            quantity,
            sellingPrice,
            totalAmount,
            discount,
            finalTotal,
            paymentMethod,
            paidAmount,
            pendingAmount,
            notes,
            bill
        });

        await inventoryModel.findOneAndUpdate(
            { userId, inventoryId },
            { $inc: { totalStockValue: -quantity } },
            { new: true }
        );

        const paymentStatus = pendingAmount > 0 ? "pending" : "cleared";

        await customerModel.findOneAndUpdate(
            { userId, customerId },
            {
                $push: {
                    sales: {
                        saleId,
                        totalAmount: finalTotal,
                        pendingAmount,
                        lastUpdated: date,
                        status: paymentStatus
                    }
                }
            },
            { new: true }
        )


        return res.json({
            status: true,
            message: "Sale recorded successfully and inventory updated",
        });

    } catch (error) {
        console.error("Sale error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

async function updateSaleRecordByUser(req, res) {
    try {
        const { userId } = req.user;
        const { saleId } = req.params;
        const { inventoryId: selectedInventoryId } = req.body;

        if (!saleId) {
            return res.status(400).json({
                status: false,
                message: "saleId is required in params"
            });
        }

        const existingSale = await saleModel.findOne({ userId, saleId });
        if (!existingSale) {
            return res.status(404).json({
                status: false,
                message: "Sale record not found"
            });
        }

        const oldInventoryId = existingSale.inventoryId;
        const oldQuantity = existingSale.quantity;

        const allowedFields = [
            "date", "customerName", "customerPhone", "productName", "quantity",
            "sellingPrice", "totalAmount", "discount", "finalTotal",
            "paymentMethod", "paidAmount", "pendingAmount", "notes",
            "customerId"
        ];

        const updateData = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        if (req.file) {
            updateData.bill = `/uploads/bills/${req.file.filename}`;
        }

        const newQuantity = updateData.quantity !== undefined ? Number(updateData.quantity) : oldQuantity;

        const newInventoryId = selectedInventoryId || oldInventoryId;

        
        if (newInventoryId === oldInventoryId) {

            const qtyDifference = newQuantity - oldQuantity;

            if (qtyDifference !== 0) {
                const sameInventory = await inventoryModel.findOne({ userId, inventoryId: oldInventoryId });

                if (!sameInventory) {
                    return res.status(400).json({
                        status: false,
                        message: "Inventory record not found"
                    });
                }

                if (qtyDifference > 0 && sameInventory.totalStockValue < qtyDifference) {
                    return res.status(400).json({
                        status: false,
                        message: `Insufficient stock. Only ${sameInventory.totalStockValue} available.`
                    });
                }

                sameInventory.totalStockValue -= qtyDifference;
                await sameInventory.save();
            }

        } else {

     
            const oldInventory = await inventoryModel.findOne({ userId, inventoryId: oldInventoryId });
            if (oldInventory) {
                oldInventory.totalStockValue += oldQuantity;
                await oldInventory.save();
            }

            const newInventory = await inventoryModel.findOne({ userId, inventoryId: newInventoryId });

            if (!newInventory) {
                return res.status(400).json({
                    status: false,
                    message: "Selected inventory product not found"
                });
            }

            if (newInventory.totalStockValue < newQuantity) {
                return res.status(400).json({
                    status: false,
                    message: `Insufficient stock. Only ${newInventory.totalStockValue} available.`
                });
            }

            newInventory.totalStockValue -= newQuantity;
            await newInventory.save();
        }

        updateData.inventoryId = newInventoryId;

        const updatedSale = await saleModel.findOneAndUpdate(
            { userId, saleId },
            { $set: updateData },
            { new: true }
        );

        if (!updatedSale) {
            return res.status(500).json({
                status: false,
                message: "Failed to update sale"
            });
        }


        const oldCustomerId = existingSale.customerId;
        const newCustomerId = updatedSale.customerId;

        const paymentStatus = updatedSale.pendingAmount > 0 ? "pending" : "cleared";

        if (oldCustomerId !== newCustomerId) {

            await customerModel.findOneAndUpdate(
                { userId, customerId: oldCustomerId },
                { $pull: { sales: { saleId } } }
            );

            await customerModel.findOneAndUpdate(
                { userId, customerId: newCustomerId },
                {
                    customerName: updatedSale.customerName,
                    customerPhone: updatedSale.customerPhone,
                    $push: {
                        sales: {
                            saleId,
                            totalAmount: updatedSale.finalTotal,
                            pendingAmount: updatedSale.pendingAmount,
                            lastUpdated: updatedSale.date,
                            status: paymentStatus
                        }
                    }
                }
            );

        } else {

            await customerModel.updateOne(
                { userId, customerId: oldCustomerId, "sales.saleId": saleId },
                {
                    $set: {
                        "sales.$.totalAmount": updatedSale.finalTotal,
                        "sales.$.pendingAmount": updatedSale.pendingAmount,
                        "sales.$.lastUpdated": updatedSale.date,
                        "sales.$.status": paymentStatus
                    }
                }
            );
        }

        return res.json({
            status: true,
            message: "Sale, inventory, and customer records updated successfully"
        });

    } catch (error) {
        console.error("Update sale error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

async function getSaleRecordByUser(req, res) {
    try {
        const { userId } = req.user;

        const sale = await saleModel.find({ userId })

        if (!sale) {
            return res.status(404).json({
                status: false,
                message: "No sale Records Found."
            })
        }

        return res.status(200).json({
            staus: true,
            message: "Sale Records fetched Successfully.",
            data: sale
        })
    } catch (error) {
        console.error("Get sale error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

async function deleteSaleRecordByUser(req, res) {
    try {
        const { userId } = req.user;
        const { saleId } = req.params;
        const { inventoryId } = req.body;
        if (!saleId) {
            return res.status(400).json({
                status: false,
                message: "saleId is required in params"
            });
        }
        const existingSale = await saleModel.findOne({ userId, saleId });
        if (!existingSale) {
            return res.status(404).json({
                status: false,
                message: "Sale record not found"
            });
        }
        const quantityToRestore = existingSale.quantity || 0;
        const inventory = await inventoryModel.findOne({ userId, inventoryId });
        if (inventory) {
            inventory.totalStockValue += quantityToRestore;
            await inventory.save();
        }

        await saleModel.findOneAndDelete({ userId, saleId });

        return res.json({
            status: true,
            message: "Sale record deleted successfully and inventory restored"
        });
    } catch (error) {
        console.error("Delete sale error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}


module.exports = {
    saleItem,
    updateSaleRecordByUser,
    deleteSaleRecordByUser,
    getSaleRecordByUser
};
