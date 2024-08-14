// FILEPATH:
const Excel = require("exceljs");

async function main() {
  // 从文件读取
  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile("./app translations.xlsx");
  // ... 使用 workbook

  // 获取第一个工作表
  const worksheet = workbook.worksheets[0];

  const languages = worksheet.getRow(1).values.slice(3);
  const lang_ids = languages;
  const rows = worksheet.getRows(2, worksheet.rowCount);
  const contents = [];
  for (const row of rows) {
    const values = row.values;
    const key = values[1];
    const type = values[2];

    for (let i = 0; i < languages.length; i++) {
      const lang_id = lang_ids[i];
      const language = languages[i];
      let value;
      try {
        value = values[i + 3];
      } catch (error) {
        value = "";
      }
      contents.push({
        key,
        type,
        lang_id,
        value,
        language,
      });
    }
    console.log(contents);
    break;
  }
}

main();
