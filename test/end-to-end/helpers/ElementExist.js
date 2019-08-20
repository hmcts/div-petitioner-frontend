'use strict';

const Helper = codecept_helper;

class ElementExist extends Helper {

  checkElementExist(selector) {

    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];
    const isWebDriverIO = typeof this.helpers['WebDriverIO'] !== 'undefined';

    return helper
      ._locate(selector)
      .then(els => {
        if (isWebDriverIO) {
          return !!els.value.length;
        }
        return !!els.length;
      }).catch(err => {
        throw err;
      });

  }

  getPaymentIsOnStub() {
    const helper = this.helpers['WebDriverIO'] || this.helpers['Puppeteer'];

    return helper.grabCurrentUrl()
      .then(url => {
        return url.includes('/pay/gov-pay-stub');
      })
      .catch(err => {
        throw err;
      });
  }

}

module.exports = ElementExist;
