const ScreeningValidationStep = require('app/core/steps/ScreeningValidationStep');
const parseBool = require('../../../core/utils/parseBool');
const CONF = require('config');

const redirectFeatureOn = parseBool(CONF.features.newAppCutoff);

module.exports = class ScreeningQuestionsLanguagePreference extends ScreeningValidationStep {
  get url() {
    if (redirectFeatureOn) {
      return '/cutoff-landing-page';
    }
    return '/screening-questions/language-preference';
  }

  get nextStep() {
    return {
      languagePreferenceWelsh: {
        Yes: this.steps.ScreeningQuestionsMarriageBroken,
        No: this.steps.ScreeningQuestionsMarriageBroken
      }
    };
  }
};
