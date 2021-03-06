const ValidationStep = require('app/core/steps/ValidationStep');
const logger = require('app/services/logger').logger(__filename);
const { get, trim } = require('lodash');
const {
  fetchOrganisations,
  hasBeenPostedWithoutSubmitButton
} = require('app/core/utils/respondentSolicitorSearchHelper');

module.exports = class RespondentSolicitorDetails extends ValidationStep {
  get url() {
    return '/petitioner-respondent/correspondence/solicitor-search-manual';
  }

  get nextStep() {
    return this.steps.ReasonForDivorce;
  }

  interceptor(ctx, session) {
    delete session.organisations;
    return ctx;
  }

  async handler(req, res) {
    const { body } = req;

    if (hasBeenPostedWithoutSubmitButton(req)) {
      logger.infoWithReq(null, 'solicitor_search', 'Organisation search requested.');
      req.session.respondentSolicitorFirm = get(body, 'respondentSolicitorFirm');

      try {
        logger.infoWithReq(null, 'organisation_search', 'Organisation search, making api request');
        req.session.organisations = await fetchOrganisations(req, trim(req.session.respondentSolicitorFirm));
      } catch (error) {
        logger.errorWithReq(null, 'organisation_search', `Organisation search failed with error: ${error.message}`);
      }

      logger.infoWithReq(null, 'solicitor_search', 'Returning to solicitor search page');
      return res.redirect(this.steps.RespondentCorrespondenceSolicitorSearch.url);
    }

    delete req.session.manual;
    return super.handler(req, res);
  }
};
