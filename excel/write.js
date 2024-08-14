// FILEPATH:
const Excel = require("exceljs");

async function main() {
  const data = [
    {
      language: "en_IN",
      contents: [
        {
          key: "Add now",
          type: "common",
          value: "Add now",
        },
      ],
    },
    {
      language: "en_US",
      contents: [
        {
          key: "Add now",
          type: "common",
          value: "Add now",
        },
      ],
    },
    {
      language: "id_ID",
      contents: [
        {
          key: "Add now",
          type: "common",
          value: "Tambahkan sekarang",
        },
      ],
    },
  ];

  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");
  const languages = data.map((e) => e.language);
  const languageColumns = [];
  for (const language of languages) {
    languageColumns.push({ header: language, key: language });
  }
  worksheet.columns = [
    { header: "key", key: "key" },
    { header: "type", key: "type" },
    ...languageColumns,
  ];

  const keys = data[0].contents.map((e) => {
    return {
      type: e.type,
      key: e.key,
    };
  });

  for (const key of keys) {
    const content = {
      key: key.key,
      type: key.type,
    };
    for (const language of data) {
      const value = language.contents.find((e) => e.key === key.key).value;
      content[language.language] = value;
    }
    worksheet.addRow(content);
  }

  await workbook.xlsx.writeFile("example.xlsx");
}

main();
