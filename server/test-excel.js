const ExcelJS = require('exceljs');
async function test() {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Export');
    worksheet.addRow(['Name']);
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0066CC' } };
    worksheet.addRow(['Test Data']);
    await workbook.xlsx.writeFile('test.xlsx');
    console.log("Success! No ExcelJS throw.");
  } catch (e) {
    console.error("Error thrown by ExcelJS:", e.message);
  }
}
test();
