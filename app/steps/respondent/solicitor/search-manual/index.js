const ValidationStep = require('app/core/steps/ValidationStep');

module.exports = class RespondentSolicitorSearchManual extends ValidationStep {
  get url() {
    return '/petitioner-respondent/solicitor/search-manual';
  }

  get nextStep() {
    return this.steps.ReasonForDivorce;
  }

  interceptor(ctx, session) {
    delete session.organisations;

    if (session.respondentSolicitorAddress && session.respondentSolicitorAddress.address) {
      session.respondentSolicitorAddressManual = this.toString(session.respondentSolicitorAddress.address);
    }
    return ctx;
  }

  action(ctx, session) {
    session.respondentSolicitorAddress = { address: '' };
    session.respondentSolicitorAddress.address = ctx.respondentSolicitorAddressManual
      .split(/\r?\n/)
      .map(line => {
        return line.trim();
      })
      .filter(x => {
        return Boolean(x);
      });

    return [ctx, session];
  }

  toString(address) {
    return address.join('\n');
  }
};
