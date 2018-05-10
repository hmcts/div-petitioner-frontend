class JSWait extends codecept_helper {

  _beforeStep(step) {

    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];

    // Wait for content to load before checking URL
    if (step.name === 'seeCurrentUrlEquals') {
      return helper.waitForElement('#content', 10);
    }
  };

  async navByClick (text, locator) {
    this.helpers['Puppeteer'].click(text, locator);

    await this.helpers['Puppeteer'].page.waitForNavigation({waitUntil: 'networkidle0'});
  };

  async amOnLoadedPage (url) {

    if (url.indexOf('http') !== 0) {
      url = this.helpers['Puppeteer'].options.url + url;
    }
    
    this.helpers['Puppeteer'].page.goto(url);

    await this.helpers['Puppeteer'].page.waitForNavigation({waitUntil: 'networkidle0'});
  };
}

module.exports = JSWait;