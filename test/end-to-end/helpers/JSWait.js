class JSWait extends codecept_helper {

  _afterStep(step) {

    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];
    const helperIsPuppeteer = this.helpers['Puppeteer'];

    // Wait for content to load after checking URL
    if (step.name === 'waitUrlEquals' || step.name === 'waitInUrl') {
      const suitableTimeout = helperIsPuppeteer ? 10 : 30;
      return helper.waitForElement('#content', suitableTimeout);
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