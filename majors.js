const fs = require("fs");
const puppeteer = require("puppeteer");
const BASE_URL = "https://www.career.go.kr/cnet/front/base/major/FunivMajorList.do";
let majors = [];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (let index = 0; index <= 52; index++) {
    await page.goto(`${BASE_URL}?pageIndex=${index}`);
    const result = await page.$$eval(".desc", result => result.map(span => span.innerText));
    const splitted = result.reduce((arr, m) => {
      return [...arr, ...m.split(",")];
    }, []);

    majors = [...majors, ...splitted];
  }

  await browser.close();

  fs.writeFileSync("result_majors.txt", majors.join("\n"));
})();
