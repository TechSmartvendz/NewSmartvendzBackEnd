# Purchase Data Download

This feature allows you to download purchase data as a CSV file based on a date range.

## Web Interface

1. Navigate to `/purchase-data.html` in your browser
2. Select the "From Date" and "To Date" for the data you want to download
3. Click the "Download Purchase Data" button
4. The CSV file will be downloaded to your computer

## API Endpoint

You can also access the download functionality directly via API:

```
GET /api/purchase-stocks/download?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD
```

### Parameters:
- `fromDate`: Start date in YYYY-MM-DD format
- `toDate`: End date in YYYY-MM-DD format

### Headers:
- `Authorization`: Bearer token for authentication

### Response:
- CSV file with purchase data

## Command Line Script

For administrative purposes, you can also use the command line script:

```bash
node scripts/download-purchase-data.js --from=YYYY-MM-DD --to=YYYY-MM-DD --output=filename.csv
```

### Parameters:
- `--from`: Start date in YYYY-MM-DD format (required)
- `--to`: End date in YYYY-MM-DD format (required)
- `--output`: Output file name (optional, defaults to purchase_data_[fromDate]_to_[toDate].csv)

## CSV Format

The CSV file contains the following columns:

1. Invoice_Number
2. Warehouse
3. Supplier
4. Date
5. GRN_Number
6. Created_At
7. Product
8. Quantity
9. Selling_Price
10. Total_Price