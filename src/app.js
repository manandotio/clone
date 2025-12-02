const express = require("express")
const cookieParser = require("cookie-parser")
const authRoutes = require("./routes/auth.routes")
const userRoutes = require("./routes/user.routes")
const businessRoutes = require("./routes/business.routes")
const supplierRoutes = require("./routes/supplier.routes")
const productRoutes = require("./routes/product.routes")
const categoryRoutes = require("./routes/category.routes")
const unitRoutes = require("./routes/unit.routes")
const purchaseRoutes = require("./routes/purchase.routes")
const inventoryRoutes = require("./routes/inventory.routes")
const saleRoutes = require("./routes/sale.routes")
const customerRoutes = require("./routes/customer.routes")


const dashboardRoutes = require("./routes/dashboard.routes")
const app = express();

app.use(cookieParser())
app.use(express.json())

app.use("/api/auth", authRoutes )
app.use("/api/user", userRoutes)
app.use("/api/business", businessRoutes)
app.use("/api/supplier", supplierRoutes)
app.use("/api/product", productRoutes)
app.use("/api/category", categoryRoutes)
app.use("/api/unit", unitRoutes)
app.use("/api/purchase", purchaseRoutes)
app.use("/api/inventory",inventoryRoutes)
app.use("/api/sale", saleRoutes)
app.use("/api/customer", customerRoutes)
app.use("/api/dashboard", dashboardRoutes)

module.exports = app;