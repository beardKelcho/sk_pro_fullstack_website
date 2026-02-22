require('dotenv').config();
const mongoose = require('mongoose');
const { Equipment } = require('./src/models');
const ExcelJS = require('exceljs');

async function testExport() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");

  const data = await Equipment.find({}).populate('responsibleUser', 'name email').lean();
  console.log(`Found ${data.length} equipment items`);

  const headers = ['Ad', 'Tip', 'Model', 'Seri No', 'Durum', 'Konum', 'Notlar'];
  const fields = ['name', 'type', 'model', 'serialNumber', 'status', 'location', 'notes'];

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Export');

  worksheet.addRow(headers);
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0066CC' } };

  data.forEach((item) => {
    const row = fields.map(field => {
      const parts = field.split('.');
      let val = item;
      for (const p of parts) {
        val = val ? val[p] : undefined;
      }
      return val || '';
    });
    worksheet.addRow(row);
  });

  await workbook.xlsx.writeFile('db-export-test.xlsx');
  console.log("Excel file generated successfully");

  mongoose.connection.close();
}

testExport().catch(err => {
  console.error("Export Error Detail:", err);
  mongoose.connection.close();
});
