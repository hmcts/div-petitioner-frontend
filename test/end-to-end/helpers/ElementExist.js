'use strict';

const Helper = codecept_helper;

class ElementExist extends Helper {

  checkElementExist(selector) {

    const helper = this.helpers['WebDriverIO'] || this.helpers['Nightmare'];
    const isWebDriverIO = typeof this.helpers['WebDriverIO'] !== 'undefined';

    return helper
      ._locate(selector)
      .then(els => {
        if (isWebDriverIO) {
          return !!els.value.length;
        }
        return !!els.length;
      });

  }

}

module.exports = ElementExist;
