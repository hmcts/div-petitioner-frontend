const Helper = codecept_helper;

class SauceLabsBrowserHelper extends Helper {
  async _before() {
    const webdriver = this.helpers.WebDriver;
    if (webdriver) {
      if (webdriver.config.browser === 'internet explorer') {
        console.log('Increasing IE11 browser window size'); /* eslint-disable-line no-console */
        await webdriver.browser.setWindowSize(1280, 960);
      }
    }
  }
}

module.exports = SauceLabsBrowserHelper;
