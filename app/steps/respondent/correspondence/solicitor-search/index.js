const ValidationStep = require('app/core/steps/ValidationStep');
const {get, find, isEqual, first, values, size, filter} = require('lodash');
const logger = require('app/services/logger').logger(__filename);
const {
  UserAction,
  validateSearchRequest,
  validateUserData,
  fetchAndAddOrganisations,
  hasBeenPostedWithoutSubmitButton
} = require('app/core/utils/respondentSolicitorSearchHelper');

module.exports = class RespondentCorrespondenceSolicitorSearch extends ValidationStep {
  get url() {
    return '/petitioner-respondent/correspondence/solicitor-search';
  }

  get nextStep() {
    return this.steps.ReasonForDivorce;
  }

  async handler(req, res) {
    if (hasBeenPostedWithoutSubmitButton(req)) {
      const {body} = req;

      const userAction = get(body, 'userAction');

      if (isEqual(userAction, UserAction.MANUAL)) {
        logger.infoWithReq(null, 'solicitor_search', 'Manual solicitor search, redirecting to solicitor detail page.');
        this.manualSelectionCleanup(req);
        return res.redirect(this.steps.RespondentSolicitorSearchManual.url);
      }

      if (isEqual(userAction, UserAction.SELECTION)) {
        logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, user has selected an organisation');
        req.session.respondentSolicitorOrganisation = find(req.session.organisations, organisation => {
          return isEqual(organisation.organisationIdentifier, get(body, 'userSelection'));
        });
      }

      if (isEqual(userAction, UserAction.DESELECTION)) {
        logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, user has deselected option');
        this.deselectionCleanup(req);
      }

      if (isEqual(userAction, UserAction.SEARCH)) {
        const searchCriteria = get(body, 'respondentSolicitorFirm');
        const [isValid, errors] = validateSearchRequest(searchCriteria, this.content, req.session);
        if (!isValid) {
          req.session.respondentSolicitorFirmError = errors;
          return res.redirect(this.url);
        }

        this.errorsCleanup(req);
        const requestSucceeded = await fetchAndAddOrganisations(req);
        if (requestSucceeded) {
          logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, request complete');
        }
      }

      if (isEqual(userAction, UserAction.PROVIDED)) {
        const [isValid, errors] = validateUserData(this.content, req, userAction);
        if (!isValid) {
          req.session.respondentSolicitorNameError = errors;
          return res.redirect(this.url);
        }

        this.errorsCleanup(req);
        this.mapRespondentSolicitorData(req);
        return super.handler(req, res);
      }

      logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, staying on same page');
      return res.redirect(this.url);
    }

    return super.handler(req, res);
  }

  deselectionCleanup(req) {
    req.session.respondentSolicitorOrganisation = null;
    req.session.respondentSolicitorFirmError = null;
  }

  manualSelectionCleanup(req) {
    req.session.organisations = null;
    req.session.respondentSolicitorOrganisation = null;
    req.session.respondentSolicitorFirmError = null;
    req.session.respondentSolicitorAddress = null;
    req.session.respondentSolicitorCompany = null;
    req.session.respondentSolicitorReferenceDataId = null;
  }

  errorsCleanup(req) {
    req.session.respondentSolicitorNameError = null;
    req.session.respondentSolicitorFirmError = null;
  }

  mapRespondentSolicitorData({body, session}) {
    const {respondentSolicitorOrganisation} = session;
    const solicitorContactInformation = get(respondentSolicitorOrganisation, 'contactInformation');
    const address = filter(values(first(solicitorContactInformation)), size);
    session.respondentSolicitorAddress = {address};
    session.respondentSolicitorCompany = get(respondentSolicitorOrganisation, 'name');
    session.respondentSolicitorReferenceDataId = get(respondentSolicitorOrganisation, 'organisationIdentifier');
    session.respondentSolicitorName = get(body, 'respondentSolicitorName');
    session.respondentSolicitorReference = get(body, 'respondentSolicitorReference');
  }

  checkYourAnswersInterceptor(ctx, session) {
    if (session.respondentSolicitorAddress) {
      const solicitorDetail = [].concat(session.respondentSolicitorName, session.respondentSolicitorAddress.address);
      ctx.cyaRespondentSolicitorAddress = solicitorDetail.join('<br>');
    }
    return ctx;
  }
};
