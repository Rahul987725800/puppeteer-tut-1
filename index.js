const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--start-maximized', // you can also use '--start-fullscreen'
    ],
  });
  const page = (await browser.pages())[0];
  await page.setViewport({ width: 1300, height: 768 });
  await page.goto('https://www.pepcoding.com/', {
    timeout: 0, // to disable timeout
  });

  await page.waitForSelector(`a[href="/login"]`);
  await page.click(`a[href="/login"]`);

  const fillInput = async () => {
    await page.waitForSelector('input[type=email]');
    await page.evaluate(() => {
      const input = document.querySelector('input[type=email]');
      input.value = '';
    });
    await page.type('input[type=email]', 'guptarahul70322@gmail.com', {
      delay: 50,
    });
    await page.type('input[type=password]', '');
    await page.type('input[type=password]', 'AbRw@4Uy@xSiZqn', {
      delay: 50,
    });
    await page.click('button[type=submit]');
  };
  await fillInput();
  let error;
  try {
    error = await page.waitForSelector('#errorMessage', {
      timeout: 1000,
    });
    while (error) {
      console.log('error');
      await fillInput();
      error = await page.waitForSelector('#errorMessage', {
        timeout: 1000,
      });
    }
  } catch (e) {
    // console.log(e.message);
    console.log('logged in');
  }

  await page.waitForSelector('a[href="/resources"]');
  await page.click('a[href="/resources"]');
  const pages = await browser.pages();
  const resourcePage = pages[1];
  await resourcePage.setViewport({ width: 1300, height: 768 });
  await resourcePage.waitForSelector(
    'a[href="/resources/online-java-foundation"]'
  );
  await resourcePage.click('a[href="/resources/online-java-foundation"]');
  await resourcePage.waitForSelector(
    'a[href="/resources/online-java-foundation/introduction-to-recursion"]'
  );
  await resourcePage.click(
    'a[href="/resources/online-java-foundation/introduction-to-recursion"]'
  );
  await resourcePage.waitForNavigation();
  const questionsNameWithUrl = await resourcePage.evaluate(() => {
    const anchorTags = document.querySelectorAll(
      'a[href^="/resources"].pageLink'
    );
    const spanTags = document.querySelectorAll('span.name');
    const result = [];
    spanTags.forEach((tag, i) => {
      result[i] = {
        name: tag.innerHTML.trim(),
      };
    });
    anchorTags.forEach((tag, i) => {
      result[i] = {
        ...result[i],
        url: tag.href,
      };
    });
    return result;
  });
  // console.log(nameWithUrls);

  const questionPage = await browser.newPage();
  await questionPage.setViewport({ width: 1300, height: 768 });
  const selectQuestion = async (url) => {
    await questionPage.goto(url, {
      timeout: 0, // to disable timeout
    });
    await questionPage.waitForSelector('pre.card');
    const headingWithContent = await questionPage.evaluate(() => {
      const headTags = [
        { innerHTML: 'Question' },
        ...document.querySelectorAll('.pre-heading'),
      ];
      const contentTags = document.querySelectorAll('pre.card');
      const result = [];
      let qvidIndex;
      headTags.forEach((tag, i) => {
        if (tag.innerHTML === 'Question Video') {
          qvidIndex = i;
        }
        result[i] = {};
        result[i].head = tag.innerHTML;
      });
      result.splice(qvidIndex, 1);
      contentTags.forEach((tag, i) => {
        if (result[i] === undefined) result[i] = {};
        result[i].content = tag.innerHTML;
      });

      return result;
    });
    // console.log(headingWithContent);
    return headingWithContent;
  };
  for (let i = 0; i < questionsNameWithUrl.length; i++) {
    questionsNameWithUrl[i].result = await selectQuestion(
      questionsNameWithUrl[i].url
    );
  }

  console.log(JSON.stringify(questionsNameWithUrl, null, 4));
})();
// AbRw@4Uy@xSiZqn
