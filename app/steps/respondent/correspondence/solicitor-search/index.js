const ValidationStep = require('app/core/steps/ValidationStep');
const organiationService = require('app/services/organisationService');
const serviceTokenService = require('app/services/serviceToken');

const tempOrganisationApiUrl = 'https://rd-professional-api-pr-983.service.core-compute-preview.internal/refdata/external/v1/organisations/status';

module.exports = class RespondentCorrespondenceSolicitorSearch extends ValidationStep {
  get url() {
    return '/petitioner-respondent/correspondence/solicitor-search';
  }

  get nextStep() {
    return this.steps.ReasonForDivorce;
  }

  validate(ctx, session) {
    let [isValid, errors] = super.validate(ctx, session); // eslint-disable-line prefer-const

    const respondentSolicitorFirmError = error => {
      return error.param === 'respondentSolicitorFirm';
    };

    if (!isValid) {
      if (ctx.respondentSolicitorFirmError) {
        errors = errors.filter(
          respondentSolicitorFirmError
        );
      }
    }

    return [isValid, errors];
  }

  postRequest(req, res) {
    const auth = req.cookies['__auth-token'];
    const serviceToken = serviceTokenService.setup();
    const solicitorFirm = req.body.respondentSolicitorFirm;

    if (solicitorFirm) {
      let organisation = null;

      return serviceToken.getToken(req)
        .then(serviceAuthToken => {
          organisation = organiationService.setup(auth, serviceAuthToken, tempOrganisationApiUrl);
          return organisation.getOrganisationByName('active', solicitorFirm);
        })
        .then(organisations => {
          req.session.organisations = organisations;
          return res.redirect(this.url);
        })
        .catch(error => {
          console.log('Error getting prd client data', error.message); // eslint-disable-line no-console
          return res.redirect('/generic-error');
        });
    }
  }
};
