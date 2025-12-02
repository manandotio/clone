const customerModel = require("../models/customer.model");
const purchaseModel = require("../models/purchase.model");
const saleModel = require("../models/sale.model");

async function getDashboardDataInternal(userId, query) {
    const filter = query.filter || "today";
    let startDate, endDate;

    endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    if (filter === "today") {
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

    } else if (filter === "7days") {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);

    } else if (filter === "30days") {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);

    } else if (filter === "custom") {
        if (!query.startDate || !query.endDate) {
            throw new Error("For custom filter, provide startDate and endDate");
        }

        startDate = new Date(query.startDate);
        endDate = new Date(query.endDate);
        endDate.setHours(23, 59, 59, 999);
    }

    const [
        purchaseStats,
        saleStats,
        pendingSales,      
        purchaseTx,
        saleTx,
        dueState,
        cashReceived,
        paymentMethodStats
    ] = await Promise.all([

        purchaseModel.aggregate([
            { $match: { userId, date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, totalAmountSpent: { $sum: "$totalAmount" } } }
        ]),

        saleModel.aggregate([
            { $match: { userId, date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, totalAmountSold: { $sum: "$finalTotal" } } }
        ]),

        customerModel.aggregate([
            { $match: { userId } },
            { $unwind: "$sales" },
            { 
                $match: { 
                    "sales.lastUpdated": { $gte: startDate, $lte: endDate } 
                } 
            },
            { $group: { _id: null, totalPending: { $sum: "$sales.pendingAmount" } } }
        ]),

        purchaseModel.aggregate([
            { $match: { userId, createdAt: { $gte: startDate, $lte: endDate } } },
            {
                $project: {
                    _id: 0,
                    name: "$supplier",
                    total: "$totalAmount",
                    date: "$createdAt",
                    type: { $literal: "purchase" }
                }
            }
        ]),

        saleModel.aggregate([
            { $match: { userId, createdAt: { $gte: startDate, $lte: endDate } } },
            {
                $project: {
                    _id: 0,
                    name: "$customerName",
                    total: "$finalTotal",
                    date: "$createdAt",
                    type: { $literal: "sale" }
                }
            }
        ]),

        purchaseModel.aggregate([
            { $match: { userId, date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, totalDueAmount: { $sum: "$dueAmount" } } }
        ]),

        saleModel.aggregate([
            { $match: { userId, date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, totalCashReceived: { $sum: "$paidAmount" } } }
        ]),

        saleModel.aggregate([
            { $match: { userId, date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: "$paymentMethod", totalAmount: { $sum: "$paidAmount" } } },
            { $project: { _id: 0, paymentMethod: "$_id", totalAmount: 1 } }
        ])

    ]);

    const transactions = [...purchaseTx, ...saleTx].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    const totalPurchase = purchaseStats[0]?.totalAmountSpent || 0;
    const totalSales = saleStats[0]?.totalAmountSold || 0;

    const pending = pendingSales[0]?.totalPending || 0;

    const profit = totalSales - totalPurchase;
    const dueAmount = dueState[0]?.totalDueAmount || 0;

    let cashTotal = 0, cardTotal = 0, upiTotal = 0, bankTotal = 0;
    paymentMethodStats.forEach(p => {
        if (p.paymentMethod === "cash") cashTotal = p.totalAmount;
        if (p.paymentMethod === "card") cardTotal = p.totalAmount;
        if (p.paymentMethod === "upi") upiTotal = p.totalAmount;
        if (p.paymentMethod === "bank") bankTotal = p.totalAmount;
    });

    return {
        stats: {
            totalPurchase,
            totalSales,
            profit,
            pending,          
            dueAmount,
            cashTotal,
            cardTotal,
            upiTotal,
            bankTotal
        },
        recentTransactions: transactions
    };
}


module.exports = { getDashboardDataInternal };
