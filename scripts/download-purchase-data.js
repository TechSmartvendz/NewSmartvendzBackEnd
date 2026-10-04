#!/usr/bin/env node

/**
 * Script to download purchase data as CSV
 * Usage: node download-purchase-data.js --from=YYYY-MM-DD --to=YYYY-MM-DD --output=filename.csv
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');
const moment = require('moment');

// Connect to database
require('../config/dbconn');

// Import the purchase stocks model
const PurchaseStock = require('../model/m_purchase_stocks');

// Parse command line arguments
const args = process.argv.slice(2);
let fromDate, toDate, outputFile;

args.forEach(arg => {
  if (arg.startsWith('--from=')) {
    fromDate = arg.split('=')[1];
  } else if (arg.startsWith('--to=')) {
    toDate = arg.split('=')[1];
  } else if (arg.startsWith('--output=')) {
    outputFile = arg.split('=')[1];
  }
});

// Validate arguments
if (!fromDate || !toDate) {
  console.error('Error: Both --from and --to dates are required');
  console.log('Usage: node download-purchase-data.js --from=YYYY-MM-DD --to=YYYY-MM-DD --output=filename.csv');
  process.exit(1);
}

// Set default output file if not provided
if (!outputFile) {
  outputFile = `purchase_data_${fromDate}_to_${toDate}.csv`;
}

// Convert string dates to Date objects
const startDate = new Date(fromDate);
const endDate = new Date(toDate);

// Add one day to end date to include the end date in results
endDate.setDate(endDate.getDate() + 1);

// Validate dates
if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
  console.error('Error: Invalid date format. Please use YYYY-MM-DD format');
  process.exit(1);
}

async function downloadPurchaseData() {
  try {
    console.log(`Fetching purchase data from ${fromDate} to ${toDate}...`);
    
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
      console.error('No purchase data found for the specified date range');
      process.exit(1);
    }

    console.log(`Found ${purchaseData.length} records. Converting to CSV...`);

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

    // Write CSV to file
    const outputPath = path.resolve(outputFile);
    fs.writeFileSync(outputPath, csv);
    
    console.log(`CSV file successfully created at: ${outputPath}`);
    process.exit(0);
    
  } catch (error) {
    console.error("Error downloading purchase data:", error);
    process.exit(1);
  }
}

// Run the function
downloadPurchaseData();