'use strict';

const Helper = codecept_helper;

class ElementExist extends Helper {

  async checkElementExist(selector) {
    const helper = this.helpers['WebDriver'] || this.helpers['Puppeteer'];

    try {
      await helper.waitForElement(selector, 3);
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
