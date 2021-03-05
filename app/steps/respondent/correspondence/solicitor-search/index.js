const ValidationStep = require('app/core/steps/ValidationStep');

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
};
