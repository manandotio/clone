const puppeteer = require("puppeteer");
const customerModel = require("../models/customer.model");
const { getPendingPayments } = require("../services/pendingPayment.services");


async function createCustomer(req, res) {
    const { userId } = req.user;

    const {
        customerName,
        customerPhone,
        address,
        dueDate
    } = req.body

    const lastCustomerId = await customerModel.findOne({ userId })
        .sort({ customerId: -1 })
        .lean();

    const customerId = lastCustomerId ? lastCustomerId.customerId + 1 : 1;

    const customer = await customerModel.create({
        userId,
        customerId,
        customerName,
        customerPhone,
        address,
        dueDate
    })

    return res.status(201).json({
        status: true,
        message: "Customer Created",
        data: customer
    })

}

async function pendingList(req, res) {
    try {
        const { userId } = req.user;

        const customers = await customerModel.find({ userId })
            .select("customerName customerPhone sales -_id");

        const result = customers.map(customer => {
            let totalSales = 0;
            let totalPending = 0;

            customer.sales.forEach(sale => {
                totalSales += Number(sale.totalAmount || 0);
                totalPending += Number(sale.pendingAmount || 0);
            });

            return {
                customerName: customer.customerName,
                customerPhone: customer.customerPhone,
                totalSales,
                totalPending,
                status: totalPending > 0 ? "pending" : "cleared"
            };
        });

        return res.status(200).json({
            status: true,
            message: "Payment pending list fetched.",
            data: result
        });

    } catch (error) {
        console.error("Pending amount error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function searchPayments(req, res) {
    try {
        const { userId } = req.user;
        const { search } = req.query;

        let matchQuery = { userId };

        if (search) {
            const regex = new RegExp(search.trim(), "i");

            matchQuery.$or = [
                { customerName: regex },
                { customerPhone: regex },
                { "sales.status": regex }  
            ];
        }

        const results = await customerModel.aggregate([
            { $match: matchQuery },

            { $unwind: { path: "$sales", preserveNullAndEmptyArrays: true } },

            {
                $group: {
                    _id: "$customerId",
                    customerName: { $first: "$customerName" },
                    customerPhone: { $first: "$customerPhone" },
                    totalSales: { $sum: { $ifNull: ["$sales.totalAmount", 0] } },
                    totalPending: { $sum: { $ifNull: ["$sales.pendingAmount", 0] } }
                }
            },

            {
                $addFields: {
                    status: {
                        $cond: [
                            { $gt: ["$totalPending", 0] },
                            "pending",
                            "cleared"
                        ]
                    }
                }
            },

            ...(search ? [{
                $match: {
                    $or: [
                        { customerName: { $regex: search, $options: "i" } },
                        { customerPhone: { $regex: search, $options: "i" } },
                        { status: { $regex: search, $options: "i" } }
                    ]
                }
            }] : []),

            { $sort: { totalPending: -1 } },

            {
                $project: {
                    _id: 0,
                    customerName: 1,
                    customerPhone: 1,
                    totalSales: 1,
                    totalPending: 1,
                    status: 1
                }
            }
        ]);

        return res.status(200).json({
            status: true,
            message: "Search results fetched.",
            data: results
        });

    } catch (error) {
        console.error("Payment search error:", error);
        return res.status(500).json({
            status: false,
            message: "Server error",
            error: error.message
        });
    }
}

async function creditAmountAndCount(req, res) {
    try {
        const { userId } = req.user;

        const result = await customerModel.aggregate([
            { $match: { userId } },

            { $unwind: "$sales" },

            {
                $group: {
                    _id: "$customerId",
                    customerName: { $first: "$customerName" },
                    pending: { $sum: "$sales.pendingAmount" }
                }
            },

            { $match: { pending: { $gt: 0 } } },

            {
                $group: {
                    _id: null,
                    totalPendingAmount: { $sum: "$pending" },
                    pendingCustomerCount: { $sum: 1 }
                }
            }
        ]);

        return res.status(200).json({
            status: true,
            message: "Credit summary fetched successfully",
            data: {
                totalCredit: result[0]?.totalPendingAmount || 0,
                count: result[0]?.pendingCustomerCount || 0
            }

        });

    } catch (error) {
        console.error("Credit summary error:", error);
        return res.status(500).json({
            status: false,
            message: "Server error",
            error: error.message
        });
    }
}

async function filterPendingPayments(req, res) {
    try {
        const { userId } = req.user;
        const { sort, filter } = req.query;

        const result = await getPendingPayments(userId, sort, filter);

        return res.status(200).json({
            status: true,
            message: "Pending payments fetched successfully.",
            ...result
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Server error" });
    }
}

async function downloadPendingPaymentsPDF(req, res) {
    try {
        const { userId } = req.user;
        const { sort, filter } = req.query;

        const result = await getPendingPayments(userId, sort, filter);

        // result.data contains filtered sorted records
        const rows = result.data.map(c => `
            <tr>
                <td>${c.customerName}</td>
                <td>${c.customerPhone}</td>
                <td>${c.totalPending.toFixed(2)}</td>
                <td>${c.dueSinceDays}</td>
            </tr>
        `).join("");

        const html = `
            <html>
            <body style="font-family: Arial; padding: 20px">
                <h2>Pending Payments Report</h2>
                <p>Total Pending: ${result.totalPendingCredit}</p>
                <p>Total Retailers: ${result.totalRetailers}</p>

                <table border="1" cellpadding="8" cellspacing="0" width="100%">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Pending</th>
                            <th>Due Days</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </body>
            </html>
        `;

        const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
        const page = await browser.newPage();
        await page.setContent(html);

        const pdf = await page.pdf({ format: "A4", printBackground: true });
        
        await browser.close();

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=pending-payments.pdf");
        res.send(pdf);

    } catch (err) {
        console.log(err);
        res.status(500).json({ status: false, message: "Error generating PDF" });
    }
}

module.exports = {
    pendingList,
    searchPayments,
    createCustomer,
    creditAmountAndCount,
    filterPendingPayments,
    downloadPendingPaymentsPDF
}