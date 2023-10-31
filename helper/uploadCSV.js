const fs = require("fs");
const csv = require("csv-parser");
const CsvParser = require('json2csv').Parser;

exports.downloadSampleCSV = async (res, schema, fields) => {
  const sampleData = {}; // Create an object with sample data based on the schema
  const csvParser = new CsvParser({ fields });
  const csvData = csvParser.parse(sampleData);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=Import.csv");
  res.status(200).end(csvData);
};

exports.performBulkUpload = async (
  file,
  validateRowCallback,
  processRowCallback
) => {
  const results = [];
  const rejectData = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .pipe(csv({}))
      .on("data", async (data) => {
        results.push(data);

        // Validate the row using the provided callback
        const validationError = validateRowCallback(data);

        if (validationError) {
          data.error = validationError;
          rejectData.push(data);
        } else {
          // Process the row using the provided callback
          try {
            await processRowCallback(data);
          } catch (error) {
            data.error = error.message;
            rejectData.push(data);
          }
        }
      })
      .on("end", () => {
        resolve({ results, rejectData });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};
