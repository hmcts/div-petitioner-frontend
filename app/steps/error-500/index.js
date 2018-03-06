const Page = require('app/core/steps/Page');

module.exports = class Error500 extends Page {
  get url() {
    return '/errors/500';
  }
};
