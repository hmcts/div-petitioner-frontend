const Helper = codecept_helper;

class SauceLabsBrowserHelper extends Helper {

  _before() {
    const helper = this.helpers['WebDriver'] || this.helpers['Puppeteer'];
    const helperIsWebdriver = this.helpers['WebDriver'];
    if (helperIsWebdriver) {
      if (helper.config.browser === 'internet explorer') {
        console.log('Increasing IE11 browser window size'); /* eslint-disable-line no-console */
        helper.browser.setWindowSize(1024, 768);
      }
    }
  }
}

module.exports = SauceLabsBrowserHelper;
