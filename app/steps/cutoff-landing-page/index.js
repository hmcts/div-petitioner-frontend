const ScreeningValidationStep = require('../../core/steps/AppCutoffScreeningValidationStep');

module.exports = class CutOffLandingPage extends ScreeningValidationStep {
  get url() {
    return '/cutoff-landing-page';
  }
};
