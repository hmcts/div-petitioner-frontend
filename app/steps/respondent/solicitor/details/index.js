const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');

module.exports = class RespondentSolicitorDetails extends ValidationStep {
  get url() {
    return '/petitioner-respondent/solicitor/details';
  }

  get nextStep() {
    return this.steps.RespondentSolicitorAddress;
  }

  constructor(steps, section, templatePath, content, schema) {
    super(steps, section, templatePath, content, schema);

    watch('respondentCorrespondenceUseHomeAddress', (previousSession, session, remove) => {
      if (session.respondentCorrespondenceUseHomeAddress !== 'Solicitor') {
        remove('respondentSolicitorName', 'respondentSolicitorCompany', 'respondentSolicitorAddress',
          'respondentSolicitorEmail', 'respondentSolicitorPhoneNumber');
      }
    });
  }

  interceptor(ctx) {
    ctx.respondentSolicitorRepresented = 'Yes';
    return ctx;
  }

  // RPET-47: Removing ability for petitioner to add respondent's solicitor details
  handler(req, res, next) {
    return this.steps.Error404.handler(req, res, next);
  }
};
