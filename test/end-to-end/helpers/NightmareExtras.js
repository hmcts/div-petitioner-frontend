class NightmareExtras extends codecept_helper {
  /**
   * Wait until a page loads
   *
   * This overrides the existing Nightmare method to include waiting until the
   * URL changes and to actually wait until the new page is loaded and/or
   * interactable.
   */
  seeCurrentUrlEquals(urlPart, sec = null) {
    this.browser = this.helpers.Nightmare.browser;
    this.browser.options.waitTimeout = sec ? sec * 1000 : this.config.waitForTimeout;
    const time = sec || this.config.waitForTimeout / 1000;
    const expectedUrl = urlPart.includes('http') ? urlPart : this.browser.options.url.concat(urlPart);
    return this.browser.url()
      .then(url => this.browser
        .wait(
          (current, expected) => (current === expected && ['interactive', 'complete'].includes(document.readyState)),
          url,
          expectedUrl
        )
        .catch(err => {
          if (err.message && err.message.indexOf('.wait() timed out after') !== -1) {
            throw new Error(`URL ${expectedUrl} still not loaded or interactable after ${time} sec`);
          }
          throw err;
        })
      )
      .catch(err => {
        throw err;
      });
  }

  getPaymentIsOnStub() {
    this.browser = this.helpers.Nightmare.browser;

    return this.browser.path()
      .then(currentPath => {
        return currentPath === '/pay/gov-pay-stub';
      })
      .catch(err => {
        throw err;
      });
  }

  waitForInvisible(locator, sec) {
    this.browser = this.helpers.Nightmare.browser;
    this.browser.options.waitTimeout = sec ? sec * 1000 : this.config.waitForTimeout;
    const time = sec || this.config.waitForTimeout / 1000;

    locator = guessLocator(locator) || { css: locator };

    return this.browser.wait(
      (by, locator) => {
        return window.codeceptjs.findElement(by, locator) === null;
      },
      lcType(locator),
      lcVal(locator)
    ).catch((err) => {
      if (err.message && err.message.indexOf('.wait() timed out after') !== -1) {
        throw new Error(`element (${JSON.stringify(locator)}) still visible on page after ${time} sec`);
      } else throw err;
    });
  }
}

function guessLocator(locator) {
  if (typeof locator === 'object') {
    let key = Object.keys(locator)[0];
    let value = locator[key];
    locator.toString = () => `{${key}: '${value}'}`;
    return locator;
  }
  if (isCSS(locator)) {
    return { css: locator };
  }
  if (isXPath(locator)) {
    return { xpath: locator };
  }
}

function isCSS(locator) {
  return locator[0] === '#' || locator[0] === '.';
}

function isXPath(locator) {
  return locator.substr(0, 2) === '//' || locator.substr(0, 3) === './/';
}

function lcType(locator) {
  return Object.keys(locator)[0];
}

function lcVal(locator) {
  return locator[Object.keys(locator)[0]];
}

module.exports = NightmareExtras;