const Helper = codecept_helper;

class SauceLabsBrowserHelper extends Helper {

  _before() {
    const webdriver = this.helpers['WebDriver'];
    if (webdriver) {
      if (webdriver.config.browser === 'internet explorer') {
        console.log('Increasing IE11 browser window size'); /* eslint-disable-line no-console */
        webdriver.browser.setWindowSize(1280, 960);
      }
    }
  }

  async _beforeStep(step) {
    const webdriver = this.helpers['WebDriver'];
    if (webdriver) {
      if (webdriver.config.browser === 'internet explorer') {
        // Allow IE to catch up before doing certain steps
        if (['waitInUrl', 'selectOption', 'waitForVisible'].includes(step.name)) {
          return await webdriver.wait(1);
        }
      }

      if (webdriver.config.browser === 'safari') {
        // Allow Safari to catch up doing certain steps
        if (['checkOption'].includes(step.name)) {
          return await webdriver.wait(1);
        }
      }
    }
  }

}

module.exports = SauceLabsBrowserHelper;
