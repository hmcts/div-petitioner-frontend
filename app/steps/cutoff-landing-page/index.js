const Step = require('app/core/steps/Step');

module.exports = class CutOffLandingPage extends Step {
  get url() {
    return '/cutoff-landing-page';
  }
};
