const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto('https://quotes.toscrape.com/');
  await page.waitForSelector('.col-md-4 a');
  await page.click('.col-md-4 a');
  await page.waitForSelector('input#username');
  await page.type('input#username', 'My Username', {
    delay: 100,
  });
  await page.type('input#password', 'password', {
    delay: 100,
  });
  await page.click('input[type=submit]');
  // await browser.close();
})();
