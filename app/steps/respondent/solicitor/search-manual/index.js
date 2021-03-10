const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');

module.exports = class RespondentSolicitorSearchManual extends ValidationStep {
  get url() {
    return '/petitioner-respondent/solicitor/search-manual';
  }

  get nextStep() {
    return this.steps.ReasonForDivorce;
  }

  interceptor(ctx, session) {
    delete session.organisations;
    return ctx;
  }

  constructor(...args) {
    super(...args);

    watch('respondentSolicitorAddress', (previousSession, session) => {
      session.respondentSolicitorAddress = session.respondentSolicitorAddress
        .split(/\r?\n/)
        .map(line => {
          return line.trim();
        })
        .filter(x => {
          return Boolean(x);
        });
    });
  }
};
