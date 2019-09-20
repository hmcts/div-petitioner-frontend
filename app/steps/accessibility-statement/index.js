const { Page } = require('@hmcts/one-per-page');
const config = require('config');

class AccessibilityStatement extends Page {
  static get path() {
    return config.paths.accessibilityStatement;
  }
}

module.exports = AccessibilityStatement;
