const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto('https://typing-speed-test.aoeu.eu/', {
    timeout: 0, // to disable timeout
  });
  await page.waitForSelector('.nextword');
  const words = await page.evaluate(() => {
    const wordElements = document.querySelectorAll('.nextword');

    const words = [document.querySelector('.currentword').textContent];
    wordElements.forEach((element) => {
      words.push(element.textContent);
    });
    return words;
  });
  console.log(words);
  for (let i = 0; i < words.length; i++) {
    await page.type('input#input', words[i]);
    await page.keyboard.press(String.fromCharCode(32));
  }
  // await browser.close();
})();
