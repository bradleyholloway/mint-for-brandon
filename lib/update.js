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
  let firstEmptyRow = (ws.rowCount + 1);
  var lastRowTransId = ws.getCell(`A${(firstEmptyRow-1)}`).value;
  var row = firstEmptyRow;
  let prevIndex = pairs.findIndex(p => p.values[0] === lastRowTransId);
  if (prevIndex != -1) {
    pairs = pairs.slice(prevIndex + 1);
  }

  pairs.forEach((p) => {
    var columnIndex = 0;
    const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
    p.values.forEach(v => {
      ws.getCell(`${columns[columnIndex]}${row}`).value = v;
      columnIndex++;
    })
    row++;
  });
};
