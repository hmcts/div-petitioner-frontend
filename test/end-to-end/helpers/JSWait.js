class JSWait extends codecept_helper {

  _beforeStep(step) {

    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];

    // Wait for content to load before checking URL
    if (step.name === 'seeCurrentUrlEquals' || step.name === 'seeInCurrentUrl') {
      return helper.wait(2);
    }
  };

  async navByClick (text, locator) {
    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];
    const helperIsPuppeteer = this.helpers['Puppeteer'];

    helper.click(text, locator).catch(err => { console.error(err.message); });

    if (helperIsPuppeteer) {
      await helper.page.waitForNavigation({waitUntil: 'networkidle0'});
    } else {
      await helper.wait(2);
    }
  };

  async amOnLoadedPage (url) {
    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];
    const helperIsPuppeteer = this.helpers['Puppeteer'];

    if (helperIsPuppeteer) {
      if (url.indexOf('http') !== 0) {
        url = helper.options.url + url;
      }

      helper.page.goto(url).catch(err => { console.error(err.message); });
      await helper.page.waitForNavigation({waitUntil: 'networkidle0'});

    } else {
      await helper.amOnPage(url);
      await helper.waitInUrl(url);
      await helper.waitForElement('body');
    }
  };
}

module.exports = JSWait;