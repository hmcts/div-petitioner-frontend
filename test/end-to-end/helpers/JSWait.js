class JSWait extends codecept_helper {

  _afterStep(step) {

    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];

    // Wait for content to load after checking URL
    if (step.name === 'waitUrlEquals' || step.name === 'waitInUrl') {
      console.log("About to wait for #content");
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
      console.log("About to go to URL: ", url);
      helper.amOnPage(url);
    }
  };
}

module.exports = JSWait;