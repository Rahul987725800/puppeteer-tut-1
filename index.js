const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto('https://youtube.com');
  const title = await page.title();
  const url = await page.url();
  console.log(title, url);
  await browser.close();
})();
