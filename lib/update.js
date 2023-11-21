const Excel = require('exceljs');

const fileName = process.env.XL_FILE_NAME;
const sheetName = process.env.XL_SHEET_NAME;

exports.updateSheet = async function(updates) {
  var wb = new Excel.Workbook();
  var ws;
  wb.xlsx.readFile(fileName)
  .then(() => {
    // File exists, get the worksheet
    ws = wb.getWorksheet(sheetName);
  })
  .catch((err) => {
    // File does not exist, create a new worksheet
    ws = wb.addWorksheet(sheetName);
  })
  .then(() => {
    // Update the cells using the method
    updateCells(ws, updates);

    // Write the workbook back to the file
    wb.xlsx.writeFile(fileName);
    // File written successfully
    console.log('File written successfully');
  })
  .catch((err) => {
    // Error occurred
    console.error(err);
  });
}

const updateCells = (ws, pairs) => {
  pairs.forEach((p) => {
    ws.getCell(p.range).value = p.value;
  });
};
