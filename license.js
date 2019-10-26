const fs = require('fs');
const puppeteer = require('puppeteer');
const BASE_URL = 'https://www.pqi.or.kr/inf/qul/infQulList.do';
let majors = [];
let currentPage = 1;

async function extractLicenses(page) {
  const tableRows = await page.$$eval('table#qulListTb tbody tr', trs =>
    trs.map(tr => tr.innerText)
  );
  const extracted = tableRows.map(tr => {
    const [, , name, institute] = tr.split('\t');
    return {name, institute};
  });

  return extracted;
}

async function goNextPage(page, curr = 1) {
  const pageNums = await page.$$('.page_num > ul > li');

  for (liHandle of pageNums) {
    const button = await liHandle.$('a');
    const pageName = (button && (await liHandle.$eval('a', a => a.innerText))) || -1;

    if (Number(pageName) === curr + 1 && curr % 10 !== 0) {
      await button.click();
      await page.waitForSelector('table#qulListTb');
      return true;
    } else if (curr % 10 === 0 && pageName === 'next') {
      await button.click();
      await page.waitForSelector('table#qulListTb');
      return true;
    }
  }

  return false;
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(BASE_URL);

  while (true) {
    const result = await extractLicenses(page);
    majors = [...majors, ...result];

    const found = await goNextPage(page, currentPage);
    if (!found) {
      await browser.close();
      break;
    }

    console.log(majors.length);
    currentPage++;
  }

  fs.writeFileSync('license.txt', majors.map(m => JSON.stringify(m)).join('\n'));
})();
