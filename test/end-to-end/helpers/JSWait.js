class JSWait extends codecept_helper {

  _beforeStep(step) {

    const helper = this.helpers['WebDriver'] || this.helpers['Puppeteer'];

    // Wait for content to load before checking URL
    if (step.name === 'seeCurrentUrlEquals' || step.name === 'seeInCurrentUrl') {
      return helper.wait(2);
    }
  };

  async navByClick (text, locator) {
    const helper = this.helpers['WebDriver'] || this.helpers['Puppeteer'];
    const helperIsPuppeteer = this.helpers['Puppeteer'];

    if (!helperIsPuppeteer && helper.config.browser === 'safari') {
      // Safari 13 & Saucelabs doesn't handle scrolling properly, so need to forceClick()
      await helper.forceClick(text, locator).catch(err => { console.error(err.message); });
    } else {
      await helper.click(text, locator).catch(err => { console.error(err.message); });
    }

    if (helperIsPuppeteer) {
      await helper.page.waitForNavigation({waitUntil: 'networkidle0'});
    } else {
      const waitTime = (helper.config.browser === 'internet explorer') ? 4 : 2;
      await helper.wait(waitTime);
    }
  };

  async amOnLoadedPage (url) {
    const helper = this.helpers['WebDriver'] || this.helpers['Puppeteer'];
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
