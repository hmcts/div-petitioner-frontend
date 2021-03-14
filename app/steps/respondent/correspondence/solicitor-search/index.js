const ValidationStep = require('app/core/steps/ValidationStep');
const { get, set, unset, find, isEqual } = require('lodash');
const logger = require('app/services/logger').logger(__filename);
const requestHandler = require('app/core/helpers/parseRequest');
const searchHelper = require('app/core/utils/respondentSolicitorSearchHelper');

const { UserAction } = searchHelper;

module.exports = class RespondentCorrespondenceSolicitorSearch extends ValidationStep {
  get url() {
    return '/petitioner-respondent/correspondence/solicitor-search';
  }

  get nextStep() {
    return this.steps.ReasonForDivorce;
  }

  get urlToBind() {
    return `${this.url}/:searchType*?`;
  }

  interceptor(ctx, session) {
    ctx.searchType = session.searchType;
    ctx.baseUrl = this.url;
    searchHelper.parseAddressToManualAddress(session);
    return ctx;
  }

  validate(ctx, session) { // eslint-disable-line no-unused-vars
    return [true, null];
  }

  * postRequest(req, res) {
    const manual = searchHelper.isManual(req.session);
    searchHelper.mapRespondentSolicitorData(req, manual);

    const ctx = yield this.parseCtx(req);
    const [, errors] = super.validate(ctx, req.session);
    const isValid = searchHelper.mapValidationErrors(req, errors, manual);

    if (searchHelper.isInValidManualData(isValid, manual)) {
      return res.redirect(`${this.url}/manual`);
    } else if (searchHelper.isInValidSearchData(isValid, manual)) {
      return res.redirect(this.url);
    }

    searchHelper.errorsCleanup(req.session);
    return res.redirect(this.nextStep.url);
  }

  async handler(req, res) {
    if (!searchHelper.hasBeenPostedWithoutSubmitButton(req)) {
      return super.handler(req, res);
    }

    const { body } = req;
    const userAction = get(body, 'userAction');

    if (isEqual(userAction, UserAction.MANUAL)) {
      logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, user has selected manual option');
      searchHelper.resetManualRespondentSolicitorData(req.session);
      return res.redirect(`${this.url}/manual`);
    }

    if (isEqual(userAction, UserAction.SELECTION)) {
      logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, user has selected an organisation');
      searchHelper.resetRespondentSolicitorData(req.session);
      req.session.respondentSolicitorOrganisation = find(req.session.organisations, organisation => {
        return isEqual(organisation.organisationIdentifier, get(body, 'userSelection'));
      });
    }

    if (isEqual(userAction, UserAction.DESELECTION)) {
      logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, user has deselected option');
      searchHelper.resetRespondentSolicitorData(req.session);
    }

    if (isEqual(userAction, UserAction.SEARCH)) {
      const searchCriteria = get(body, 'respondentSolicitorFirm');

      const [isValid, errors] = searchHelper.validateSearchRequest(searchCriteria, this.content, req.session);
      if (!isValid) {
        set(req.session.error, 'respondentSolicitorFirm', errors);
        return res.redirect(this.url);
      }

      searchHelper.errorsCleanup(req.session);
      req.session.respondentSolicitorFirm = searchCriteria;
      await searchHelper.fetchAndAddOrganisations(req, searchCriteria);
    }

    logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, staying on same page');
    return res.redirect(this.url);
  }

  getRequest(req, res) {
    const { session } = req;
    // get params from url i.e. what searchType
    const requestParams = requestHandler.parse(this, req);
    if (isEqual(requestParams.searchType, 'manual')) {
      set(session, 'searchType', requestParams.searchType);
    } else {
      unset(session, 'searchType');
    }
    return super.getRequest(req, res);
  }

  checkYourAnswersInterceptor(ctx, session) {
    if (session.respondentSolicitorAddress) {
      const solicitorDetail = [].concat(session.respondentSolicitorName, session.respondentSolicitorAddress.address);
      ctx.cyaRespondentSolicitorAddress = solicitorDetail.join('<br>');
    }
    return ctx;
  }
};
