const Step = require('app/core/steps/Step');

module.exports = class SentToBailiff extends Step {
  get url() {
    return '/issued-to-bailiff';
  }
};
