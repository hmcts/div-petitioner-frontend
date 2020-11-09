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
  }

  async browserClose () {
    const page = this.helpers['Puppeteer'].page;
    if (!page.isClosed()) {
      await page.close();
    }
  }

  async amOnLoadedPage (url, language ='en') {
    let newUrl = `${url}?lng=${language}`;
    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];
    const helperIsPuppeteer = this.helpers['Puppeteer'];

    if (helperIsPuppeteer) {
      if (newUrl.indexOf('http') !== 0) {
        newUrl = helper.options.url + newUrl;
      }

      helper.page.goto(newUrl).catch(err => {
        console.error(err.message);

      });
      await helper.page.waitForNavigation({waitUntil: 'networkidle0'});

    } else {
      await helper.amOnPage(newUrl);
      await helper.waitInUrl(newUrl);
      await helper.waitForElement('body');
    }
  }
}

module.exports = JSWait;
