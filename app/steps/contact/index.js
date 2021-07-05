const Step = require('app/core/steps/Step');

module.exports = class ContactUs extends Step {
  get url() {
    return '/contact-us';
  }
};
