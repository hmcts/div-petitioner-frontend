const Page = require('app/core/steps/Page');

module.exports = class Error400 extends Page {
  get url() {
    return '/errors/400';
  }
};
