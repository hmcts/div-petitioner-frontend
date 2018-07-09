class JSWait extends codecept_helper {

  _beforeStep(step) {

    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];

    // Wait for content to load before checking URL
    if (step.name === 'seeCurrentUrlEquals') {
      return helper.waitForElement('#content', 30);
    }
  };

  async navByClick (text, locator) {
    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];
    const helperIsPuppeteer = this.helpers['Puppeteer'];

    await helper.click(text, locator);

    if (helperIsPuppeteer) {
      await helper.page.waitForNavigation({waitUntil: 'networkidle0'});
    } else {
      await helper.waitForElement('#content', 30);
    }
  };

  async amOnLoadedPage (url) {
    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];
    const helperIsPuppeteer = this.helpers['Puppeteer'];

    if (helperIsPuppeteer) {
      if (url.indexOf('http') !== 0) {
        url = helper.options.url + url;
      }

      await helper.page.goto(url);
      await helper.page.waitForNavigation({waitUntil: 'networkidle0'});

    } else {
      await helper.amOnPage(url);
      await helper.waitInUrl(url);
      await helper.waitForElement('#content', 30);
    }
  };
}

module.exports = JSWait;