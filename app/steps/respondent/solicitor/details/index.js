const ValidationStep = require('app/core/steps/ValidationStep');
const logger = require('app/services/logger').logger(__filename);
const { get, isEqual } = require('lodash');
const {
  UserAction,
  validateSearchRequest,
  fetchAndAddOrganisations,
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

      const userAction = get(body, 'userAction');
      const searchCriteria = get(body, 'respondentSolicitorFirm');
      const [isValid, errors] = validateSearchRequest(searchCriteria, this.content, req.session);

      if (!isValid) {
        req.session.respondentSolicitorFirmError = errors;
        return res.redirect(this.url);
      }

      if (isEqual(userAction, UserAction.SEARCH)) {
        const requestSucceeded = await fetchAndAddOrganisations(req);
        if (requestSucceeded) {
          logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, request complete');
        }
      }

      logger.infoWithReq(null, 'solicitor_search', 'Returning to solicitor search page');
      return res.redirect(this.steps.RespondentCorrespondenceSolicitorSearch.url);
    }

    delete req.session.manual;
    return super.handler(req, res);
  }
};
