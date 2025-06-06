// FILEPATH:
const fs = require("fs");

async function main() {
  const local = fs.readFileSync("./all.json", "utf8");
  const server = fs.readFileSync("./server.json", "utf8");
  const localData = JSON.parse(local);
  const serverData = JSON.parse(server);

  const localKeys = localData.map((item) => item.key);
  const serverKeys = serverData.map((item) => item.key);

  console.log(localKeys.length);
  console.log(serverKeys.length);

  const keys = [];
  const keysNotInLocal = [];
  for (const key of localKeys) {
    if (!serverKeys.includes(key)) {
      keys.push(key);
    }
  }

  for (const key of serverKeys) {
    if (!localKeys.includes(key)) {
      keysNotInLocal.push(key);
    }
  }

  console.log(keys);
  console.log(keysNotInLocal);

  const datas = [];
  for (const data of localData) {
    if (keys.includes(data.key)) {
      datas.push(data);
    }
  }

  console.log(datas.length);

  const jsonString = JSON.stringify(datas);

  fs.writeFile("./part.json", jsonString, "utf8", (err) => {
    if (err) {
      console.error("Error writing file:", err);
    } else {
      console.log("File is successfully saved!");
    }
  });
}

main();
