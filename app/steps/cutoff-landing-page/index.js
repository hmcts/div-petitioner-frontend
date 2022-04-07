const ScreeningValidationStep = require('../../core/steps/AppCutoffScreeningValidationStep');

module.exports = class CutOffLandingPage extends ScreeningValidationStep {
  get url() {
    return '/cutoff-landing-page';
  }

  nextStep(session) {
    if (session.hasOwnProperty('previousCaseId')) {
      return this.steps.ScreeningQuestionsLanguagePreference;
    }
  }

  next(ctx, session) {
    return this.nextStep(session);
  }
};
