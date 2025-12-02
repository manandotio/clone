const customerModel = require("../models/customer.model");

async function getPendingPayments(userId, sort = "dueDateDesc", filter = null) {
    const result = await customerModel.aggregate([
        {
            $match: {
                userId: Number(userId),
                "sales.pendingAmount": { $gt: 0 }
            }
        },
        { $unwind: "$sales" },
        {
            $match: { "sales.pendingAmount": { $gt: 0 } }
        },
        {
            $group: {
                _id: "$customerId",
                customerName: { $first: "$customerName" },
                customerPhone: { $first: "$customerPhone" },
                dueDate: { $first: "$dueDate" },
                createdAt: { $first: "$createdAt" },
                totalPending: { $sum: "$sales.pendingAmount" },
                lastPayment: {
                    $max: {
                        date: "$sales.lastUpdated",
                        amount: { $subtract: ["$sales.totalAmount", "$sales.pendingAmount"] }
                    }
                }
            }
        },
        {
            $addFields: {
                dueDateCalc: {
                    $add: ["$createdAt", { $multiply: ["$dueDate", 86400000] }]
                }
            }
        },
        {
            $addFields: {
                dueSinceDays: {
                    $ceil: {
                        $divide: [
                            { $subtract: [new Date(), "$dueDateCalc"] },
                            86400000
                        ]
                    }
                }
            }
        },
        {
            $addFields: {
                dueSinceDays: {
                    $cond: [{ $lt: ["$dueSinceDays", 0] }, 0, "$dueSinceDays"]
                }
            }
        }
    ]);


    let filtered = [...result];

    if (filter === "due") {
        filtered = filtered.filter(c => c.dueSinceDays > 0);
    }

    switch (sort) {
        case "dueDateAsc":
            filtered.sort((a, b) => a.dueSinceDays - b.dueSinceDays);
            break;
        case "dueDateDesc":
            filtered.sort((a, b) => b.dueSinceDays - a.dueSinceDays);
            break;
        case "pendingHigh":
            filtered.sort((a, b) => b.totalPending - a.totalPending);
            break;
        case "pendingLow":
            filtered.sort((a, b) => a.totalPending - b.totalPending);
            break;
        case "nameAsc":
            filtered.sort((a, b) => a.customerName.localeCompare(b.customerName));
            break;
        case "nameDesc":
            filtered.sort((a, b) => b.customerName.localeCompare(a.customerName));
            break;
    }

    const totalPendingCredit = filtered.reduce((sum, r) => sum + r.totalPending, 0);

    return {
        totalPendingCredit,
        totalRetailers: filtered.length,
        data: filtered,
    };
}

module.exports={
    getPendingPayments
}