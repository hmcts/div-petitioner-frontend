const ValidationStep = require('app/core/steps/ValidationStep');
const { get, find, isEqual, trim } = require('lodash');
const logger = require('app/services/logger').logger(__filename);
const {
  validateSearchRequest,
  fetchOrganisations,
  hasBeenPostedWithoutSubmitButton
} = require('app/core/utils/respondentSolicitorSearchHelper');

const UserAction = {
  MANUAL: 'manual',
  SEARCH: 'search',
  SELECTION: 'selection',
  DESELECTION: 'deselection'
};

module.exports = class RespondentCorrespondenceSolicitorSearch extends ValidationStep {
  get url() {
    return '/petitioner-respondent/correspondence/solicitor-search';
  }

  get nextStep() {
    return this.steps.ReasonForDivorce;
  }

  async handler(req, res) {
    const { body } = req;
    const searchCriteria = get(body, 'respondentSolicitorFirm');
    const [isValid, errors] = validateSearchRequest(searchCriteria, this.content, req.session);

    if (!isValid) {
      req.session.respondentSolicitorFirmError = errors;
      return res.redirect(this.url);
    }

    if (hasBeenPostedWithoutSubmitButton(req)) {
      const userAction = get(body, 'userAction');

      if (isEqual(userAction, UserAction.MANUAL)) {
        logger.infoWithReq(null, 'solicitor_search', 'Manual solicitor search, redirecting to solicitor detail page.');
        req.session.respondentSolicitorOrganisation = null;
        req.session.respondentSolicitorFirmError = null;
        req.session.organisations = null;
        return res.redirect(this.steps.RespondentSolicitorDetails.url);
      }

      if (isEqual(userAction, UserAction.SELECTION)) {
        logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, user has selected an organisation');
        req.session.respondentSolicitorOrganisation = find(req.session.organisations, organisation => {
          return isEqual(organisation.organisationIdentifier, get(body, 'userSelection'));
        });
      }

      if (isEqual(userAction, UserAction.DESELECTION)) {
        logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, user has deselected option');
        req.session.respondentSolicitorOrganisation = null;
      }

      if (isEqual(userAction, UserAction.SEARCH)) {
        req.session.respondentSolicitorOrganisation = null;
        req.session.respondentSolicitorFirm = get(body, 'respondentSolicitorFirm');

        if (req.session.respondentSolicitorFirmError) {
          req.session.respondentSolicitorFirmError = null;
        }
        try {
          logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, making api request');
          req.session.organisations = await fetchOrganisations(req, trim(req.session.respondentSolicitorFirm));
        } catch (error) {
          logger.errorWithReq(null, 'solicitor_search', `Organisation search failed with error: ${error.message}`);
        }
      }

      logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, staying on same page');
      return res.redirect(this.url);
    }

    return super.handler(req, res);
  }
};
