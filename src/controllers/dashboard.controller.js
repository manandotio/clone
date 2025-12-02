const { getDashboardDataInternal } = require("../services/dashboard.services");
const puppeteer = require("puppeteer");

async function getDashboardData(req, res) {
    try {
        const userId = req.user.userId;
        const data = await getDashboardDataInternal(userId, req.query);
        return res.status(200).json({
            status: true,
            message: "Dashboard data fetched successfully",
            data
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ status: false, message: err.message });
    }
}
 
async function exportDashboardPDF(req, res) {
    try {
        const userId = req.user.userId;
        const data = await getDashboardDataInternal(userId, req.query);
        const { stats, recentTransactions } = data;

        const html = `
      <html>
<head>
  <meta charset="utf-8" />
  <style>
    * {
      font-family: 'Inter', Arial, sans-serif;
      box-sizing: border-box;
    }

    body {
      padding: 24px;
      background: #f7f9fc;
      color: #333;
    }

    h1 {
      text-align: center;
      margin-bottom: 4px;
      font-size: 26px;
      font-weight: 700;
      color: #222;
    }

    .sub-title {
      text-align: center;
      font-size: 14px;
      margin-bottom: 28px;
      color: #666;
    }

    /* Cards Grid */
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }

    .card {
      background: white;
      padding: 16px;
      border-radius: 14px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
      border: 1px solid #eee;
    }

    .card-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 6px;
      color: #666;
    }

    .card-value {
      font-size: 20px;
      font-weight: 700;
    }

    /* Color Variants like your App UI */
    .blue   { background: #e7f1ff; }
    .green  { background: #e8ffe9; }
    .purple { background: #f3e8ff; }
    .orange { background: #ffeede; }
    .pink   { background: #ffe7f3; }

    /* Payment list */
    ul {
      padding-left: 18px;
      margin-bottom: 30px;
    }
    li {
      margin-bottom: 6px;
      font-size: 14px;
    }

    /* Transaction Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      font-size: 14px;
    }

    th {
      background: #f0f3f7;
      padding: 10px;
      text-align: left;
      border-bottom: 2px solid #e4e7eb;
      font-size: 13px;
      font-weight: 600;
      color: #444;
    }

    td {
      padding: 10px;
      border-bottom: 1px solid #ececec;
    }

    tr:nth-child(even) {
      background: #fafafa;
    }

    .section-title {
      font-size: 18px;
      font-weight: 700;
      margin-top: 30px;
      margin-bottom: 10px;
      color: #222;
    }

  </style>
</head>

<body>

  <h1>Dashboard Report</h1>
  <div class="sub-title">Generated on: ${new Date().toLocaleString()}</div>

  <!-- Stats Cards -->
  <div class="stats">

    <div class="card blue">
      <div class="card-title">Total Purchase</div>
      <div class="card-value">₹${stats.totalPurchase}</div>
    </div>

    <div class="card green">
      <div class="card-title">Total Sales</div>
      <div class="card-value">₹${stats.totalSales}</div>
    </div>

    <div class="card purple">
      <div class="card-title">Profit (Estimated)</div>
      <div class="card-value">₹${stats.profit}</div>
    </div>

    <div class="card orange">
      <div class="card-title">Pending</div>
      <div class="card-value">₹${stats.pending}</div>
    </div>

    <div class="card pink">
      <div class="card-title">Due Amount</div>
      <div class="card-value">₹${stats.dueAmount}</div>
    </div>

  </div>

  <!-- Payment Methods -->
  <div class="section-title">Payment Method Summary</div>
  <ul>
    <li><b>Cash:</b> ₹${stats.cashTotal}</li>
    <li><b>Card:</b> ₹${stats.cardTotal}</li>
    <li><b>UPI:</b> ₹${stats.upiTotal}</li>
    <li><b>Bank Transfer:</b> ₹${stats.bankTotal}</li>
  </ul>

  <!-- Transactions Table -->
  <div class="section-title">Recent Transactions</div>

  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Type</th>
        <th>Total</th>
        <th>Date</th>
      </tr>
    </thead>

    <tbody>
      ${recentTransactions
                .map(
                    (t) => `
        <tr>
          <td>${t.name || "-"}</td>
          <td>${t.type}</td>
          <td>₹${t.total}</td>
          <td>${new Date(t.date).toLocaleString()}</td>
        </tr>`
                )
                .join("")}
    </tbody>
  </table>

</body>
</html>

    `;

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" }
        });

        await browser.close();

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="dashboard-report.pdf"`,
            "Content-Length": pdfBuffer.length
        });

        return res.send(pdfBuffer);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: false, message: err.message });
    }
}

module.exports = {
    getDashboardData,
    exportDashboardPDF
}

