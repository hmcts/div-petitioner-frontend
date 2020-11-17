'use strict';

const Helper = codecept_helper;

class ElementExist extends Helper {

  async checkElementExist(selector) {
    const helper = this.helpers['WebDriver'] || this.helpers['Puppeteer'];
    // Shorten timeout if running a Puppeteer test, otherwise rely on global timeout
    const timeout = this.helpers['Puppeteer'] ? 3 : undefined;

    try {
      await helper.waitForElement(selector, timeout);
    } catch (e) {
      console.log('Element Not Found:', selector); /* eslint-disable-line no-console */
    }

    return helper
      ._locate(selector)
      .then(els => {
        return !!els.length;
      }).catch(err => {
        throw err;
      });
  }

  getPaymentIsOnStub() {
    const helper = this.helpers['WebDriver'] || this.helpers['Puppeteer'];

    return helper.grabCurrentUrl()
      .then(url => {
        return url.includes('/pay/gov-pay-stub');
      })
      .catch(err => {
        throw err;
      });
  }

  async getBrowserName() {
    const helper = this.helpers['WebDriver'] || this.helpers['Puppeteer'];
    return await helper.options.browser;
  }
}

module.exports = ElementExist;
