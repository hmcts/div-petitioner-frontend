const Page = require('app/core/steps/Page');

module.exports = class GenericError extends Page {
  get url() {
    return '/generic-error';
  }
};
