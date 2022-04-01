const ScreeningValidationStep = require("../../core/steps/ScreeningValidationStep");

module.exports = class CutOffLandingPage extends ScreeningValidationStep  {
  get url() {
    return '/cutoff-landing-page';
  }
};
