class JSWait extends codecept_helper {

  _beforeStep(step) {

    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];

    // Wait for content to load before checking URL
    if (step.name === 'seeCurrentUrlEquals') {
      return helper.waitForElement('#content', 10);
    }
  };

  async navByClick (text, locator) {
    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];
    const helperIsPuppeteer = this.helpers['Puppeteer'];

    helper.click(text, locator);

    if (helperIsPuppeteer) {
      await helper.page.waitForNavigation({waitUntil: 'networkidle0'});
    }
  };

  async amOnLoadedPage (url) {
    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];
    const helperIsPuppeteer = this.helpers['Puppeteer'];

    if (helperIsPuppeteer) {
      if (url.indexOf('http') !== 0) {
        url = helper.options.url + url;
      }

      helper.page.goto(url);
      await helper.page.waitForNavigation({waitUntil: 'networkidle0'});

    } else {
      helper.amOnPage(url);
    }
  };
}

module.exports = JSWait;