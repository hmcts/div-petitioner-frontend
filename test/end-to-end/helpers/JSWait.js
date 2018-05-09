class JSWait extends codecept_helper {

  _beforeStep(step) {

    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];

    // Wait for content to load before checking URL
    if (step.name === 'seeCurrentUrlEquals') {
      return helper.waitForElement('#content', 10);
    }
  };

  async navByClick (text, locator) {
    await this.helpers['Puppeteer'].click(text, locator);

    const page = this.helpers['Puppeteer'].page;
    await Promise.race([page.waitForNavigation({waitUntil: 'networkidle0'}), this.helpers['Puppeteer'].wait(5)]);
  };
}

module.exports = JSWait;