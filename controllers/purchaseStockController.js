const PurchaseStock = require("../model/m_purchase_stocks");
const { Parser } = require("json2csv");
const moment = require("moment");

// Download purchase data based on date range
exports.downloadPurchaseData = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    
    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "Both fromDate and toDate are required",
      });
    }

    // Convert string dates to Date objects
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    
    // Add one day to end date to include the end date in results
    endDate.setDate(endDate.getDate() + 1);

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Please use YYYY-MM-DD format",
      });
    }

    // Query purchase data within date range
    const purchaseData = await PurchaseStock.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lt: endDate },
          isDeleted: false
        }
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "warehouse",
          foreignField: "_id",
          as: "warehouseData"
        }
      },
      {
        $lookup: {
          from: "suppliers",
          localField: "supplier",
          foreignField: "_id",
          as: "supplierData"
        }
      },
      { $unwind: "$warehouseData" },
      { $unwind: "$supplierData" },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productData"
        }
      },
      { $unwind: "$productData" },
      {
        $project: {
          Invoice_Number: "$invoiceNumber",
          Warehouse: "$warehouseData.wareHouseName",
          Supplier: "$supplierData.supplierName",
          Date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
              timezone: "Asia/Kolkata"
            }
          },
          GRN_Number: "$GRN_Number",
          Created_At: {
            $dateToString: {
              format: "%Y-%m-%d %H:%M:%S",
              date: "$createdAt",
              timezone: "Asia/Kolkata"
            }
          },
          Product: "$productData.productname",
          Quantity: "$products.productQuantity",
          Selling_Price: "$products.sellingPrice",
          Total_Price: "$products.totalPrice"
        }
      }
    ]);

    if (purchaseData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No purchase data found for the specified date range",
      });
    }

    // Convert data to CSV
    const fields = [
      'Invoice_Number',
      'Warehouse',
      'Supplier',
      'Date',
      'GRN_Number',
      'Created_At',
      'Product',
      'Quantity',
      'Selling_Price',
      'Total_Price'
    ];
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(purchaseData);

    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=purchase_data_${moment().format('YYYY-MM-DD')}.csv`);
    
    // Send CSV data
    res.status(200).send(csv);
    
  } catch (error) {
    console.error("Error downloading purchase data:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading purchase data",
      error: error.message,
    });
  }
};