const Page = require('app/core/steps/Page');

module.exports = class Error404 extends Page {
  get url() {
    return '/errors/404';
  }
};
