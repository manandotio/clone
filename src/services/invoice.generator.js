const Purchase = require("../models/purchase.model");
const Sale = require("../models/sale.model");

async function generateInvoiceNumber(type){
  
    const model = type === "sale" ? Sale : Purchase;
    const prefix = type === "sale" ? "SALE" : "PURCHASE";

    const lastInvoice = await model.findOne().sort({ invoiceNumber: -1 });
  
    let nextNumber = 1;

    if (lastInvoice && lastInvoice.invoiceNumber) {
      const lastNum = parseInt(lastInvoice.invoiceNumber.split("-")[1]);
      nextNumber = lastNum + 1;
    }

    const formatted = nextNumber.toString().padStart(5, "0");
    const invoiceNumber = `${prefix}-${formatted}`;

    return invoiceNumber;

};

module.exports = generateInvoiceNumber

