const https = require("https");
const fs = require("fs");
const process = require("process");

function fail(message) {
  console.error(message);
  process.exit(1);
}

https.get(
  "https://data.epa.gov.tw/api/v2/aqx_p_432?limit=1000&api_key=7909fa25-dd8f-431a-ae55-e88dedada07a",
  (result) => {
    if (result.statusCode !== 200) {
      fail(`Server returned ${result.statusCode}`);
    }
    let data = "";
    result.on("data", (chunk) => {
      data += chunk;
    });
    result.on("end", () => {
      try {
        let parsed = JSON.parse(data);
        let publishTime = parsed.records[0].PublishTime.concat("+0800")
          .replace(/\/|:/g, "")
          .replace(" ", "T");
        if (!publishTime.match(/\d{8}T\d{6}\+0800/)) {
          fail(`Publish time ${publishTime} is invalid`);
        }
        fs.writeFileSync("data/latest.json", data);
        fs.writeFileSync(`data/${publishTime}.json`, data);
      } catch (e) {
        fail(e.message);
      }
    });
  }
);
