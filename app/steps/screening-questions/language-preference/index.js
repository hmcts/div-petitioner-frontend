const organiationService = require('app/services/organisationService');
const serviceTokenService = require('app/services/serviceToken');
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
    const auth = req.cookies['__auth-token'];
    const serviceToken = serviceTokenService.setup();
    const tempUrl = 'https://rd-professional-api-pr-983.service.core-compute-preview.internal/refdata/external/v1/organisations/status';

    let organisation = null;

    return serviceToken.getToken(req)
      .then(serviceAuthToken => {
        organisation = organiationService.setup(auth, serviceAuthToken, tempUrl);
        return organisation.getOrganisationByName('active', 'a');
      })
      .then(organisations => {
        req.session.organisations = organisations;
        res.redirect(this.steps.ScreeningQuestionsMarriageBroken.url);
      })
      .catch(error => {
        logger.errorWithReq(req, 'amendment_error', 'Error during amendment step', error.message);
        res.redirect('/generic-error');
      });
  }
};
