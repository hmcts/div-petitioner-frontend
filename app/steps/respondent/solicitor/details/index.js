const ValidationStep = require('app/core/steps/ValidationStep');
const logger = require('app/services/logger').logger(__filename);
const { get } = require('lodash');

module.exports = class RespondentSolicitorDetails extends ValidationStep {
  get url() {
    return '/petitioner-respondent/correspondence/solicitor-search-manual';
  }

  get nextStep() {
    return this.steps.ReasonForDivorce;
  }

  handler(req, res) {
    const { body } = req;

    const hasBeenPostedWithoutSubmitButton = body && Object.keys(body).length > 0 && !body.hasOwnProperty('submit');

    if (hasBeenPostedWithoutSubmitButton) {
      logger.infoWithReq(null, 'solicitor_search', 'Solicitor search detected.');
      // TODOs:
      // 1. make api call,
      // 2. add response data to session
      req.session.respondentSolicitorFirm = get(body, 'respondentSolicitorFirm');
      return res.redirect(this.steps.RespondentCorrespondenceSolicitorSearch.url);
    }

    delete req.session.respondentSolicitorFirm;
    delete req.session.manual;

    return super.handler(req, res);
  }
};
