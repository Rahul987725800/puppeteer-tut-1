const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto('https://reactjs.org');
  const grabHeadline = await page.evaluate(() => {
    // run any dom manipulation code
    const headline = document.querySelectorAll('.css-1xm4gxl')[1];
    return headline.innerHTML;
  });
  console.log(grabHeadline);
  await browser.close();
})();
