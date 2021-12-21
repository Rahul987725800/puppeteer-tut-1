const puppeteer = require('puppeteer');
const Category = require('./Category');
const Course = require('./Course');
const mongoose = require('mongoose');
const SubCategory = require('./SubCategory');
const Question = require('./Question');

const run = async () => {
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
  const questionPage = await browser.newPage();
  await questionPage.setViewport({ width: 1300, height: 768 });
  const goToResource = async (url) => {
    await resourcePage.waitForSelector(`a[href="${url}"]`);
    await resourcePage.click(`a[href="${url}"]`);

    const existingCourse = await Course.findOne({ name: url });
    if (!existingCourse) {
      const course = new Course({
        name: url,
      });
      await course.save();
      // fetch the categories
      await resourcePage.waitForNavigation();
      const fetchedCategories = await resourcePage.evaluate(() => {
        const categoryTags = document.querySelectorAll(
          'div.collapsible-header.bold'
        );
        const result = [];
        categoryTags.forEach((tag) => {
          result.push(tag.innerText.trim());
        });
        return result;
      });
      const savedCategories = [];
      for (let name of fetchedCategories) {
        const category = new Category({
          name,
          course,
        });
        await category.save();
        savedCategories.push(category);
        course.categories.push(category);
        await course.save();
      }
      const fetchedCategoryAnchors = await resourcePage.evaluate(() => {
        const categoryBlocks = document.querySelectorAll('.classResourceList');
        const result = [];
        categoryBlocks.forEach((block, i) => {
          const anchorTags = block.querySelectorAll('a');
          result[i] = [];
          anchorTags.forEach((tag) => {
            result[i].push(tag.href);
          });
        });
        return result;
      });
      for (let i = 0; i < fetchedCategoryAnchors.length; i++) {
        const anchors = fetchedCategoryAnchors[i];
        // console.log(anchors);
        for (let url of anchors) {
          const subCategory = new SubCategory({
            name: url,
            category: savedCategories[i],
          });
          await subCategory.save();
          // console.log(subCategory);
          savedCategories[i].subCategories.push(subCategory);
          await savedCategories[i].save();

          const href = url.replace('https://www.pepcoding.com', '');
          await resourcePage.waitForSelector(`a[href="${href}"]`);
          await resourcePage.click(`a[href="${href}"]`);
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
          console.log(questionsNameWithUrl);

          const selectQuestion = async (url) => {
            await questionPage.goto(url, {
              timeout: 0, // to disable timeout
            });
            questionPage.waitForNavigation();

            const headingWithContent = await questionPage.evaluate(() => {
              const contentTags = document.querySelectorAll('pre.card');
              if (contentTags.length <= 1) return [];
              const headTags = [
                { innerHTML: 'Question' },
                ...document.querySelectorAll('.pre-heading'),
              ];

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
            const question = new Question({
              name: questionsNameWithUrl[i].name,
              url: questionsNameWithUrl[i].url,
              result: questionsNameWithUrl[i].result,
              subCategory,
            });
            await question.save();
            subCategory.questions.push(question);
            subCategory.save();
          }
          await resourcePage.goBack();
        }
      }
    }
  };
  await goToResource('/resources/online-java-foundation');
};
// AbRw@4Uy@xSiZqn
const uri =
  'mongodb://localhost:27017/pepcoding?readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=false';
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('MongoDB Connected');
    await Category.deleteMany();
    await Course.deleteMany();
    await SubCategory.deleteMany();
    await Question.deleteMany();
    try {
      await run();
    } catch (e) {
      console.log(e.message);
    }
  });
