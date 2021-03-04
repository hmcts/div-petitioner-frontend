const organiationService = require('app/services/organisationService');
const ScreeningValidationStep = require('app/core/steps/ScreeningValidationStep');
const logger = require('app/services/logger').logger(__filename);

module.exports = class ScreeningQuestionsLanguagePreference extends ScreeningValidationStep {
  get url() {
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

  postRequest(req, res) {
    const organisation = organiationService.setup(req.cookies['__auth-token']);

    return organisation.getOrganisationByName('ACTIVE', 'a')
      .then(response => {
        req.session.organisations = response;

        res.redirect(this.steps.ScreeningQuestionsMarriageBroken.url);
      })
      .catch(error => {
        logger.errorWithReq(req, 'amendment_error', 'Error during amendment step', error.message);
        res.redirect('/generic-error');
      });
  }
};
