const ValidationStep = require('app/core/steps/ValidationStep');
const { get } = require('lodash');
const logger = require('app/services/logger').logger(__filename);

module.exports = class RespondentCorrespondenceSolicitorSearch extends ValidationStep {
  get url() {
    return '/petitioner-respondent/correspondence/solicitor-search';
  }

  get nextStep() {
    return this.steps.ReasonForDivorce;
  }

  interceptor(ctx) { // session
    return ctx;
  }


  validate(ctx, session) {
    let [isValid, errors] = super.validate(ctx, session); // eslint-disable-line prefer-const

    const respondentSolicitorFirmError = error => {
      return error.param === 'respondentSolicitorFirm';
    };

    if (!isValid) {
      if (ctx.respondentSolicitorFirm) {
        errors = errors.filter(
          respondentSolicitorFirmError
        );
      }
    }

    return [isValid, errors];
  }

  handler(req, res, next) {
    const { body } = req;

    const hasBeenPostedWithoutSubmitButton = body && Object.keys(body).length > 0 && !body.hasOwnProperty('submit');

    if (hasBeenPostedWithoutSubmitButton) {
      logger.infoWithReq(null, 'solicitor_search', 'Solicitor search detected.');
      req.session.respondentSolicitorFirm = get(body, 'respondentSolicitorFirm');

      return res.redirect(this.url);
    }

    return super.handler(req, res, next);
  }
};
