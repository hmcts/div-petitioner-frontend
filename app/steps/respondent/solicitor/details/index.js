const ValidationStep = require('app/core/ValidationStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');

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
        remove('respondentSolicitorName', 'respondentSolicitorCompany', 'respondentSolicitorAddress');
      }
    });
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }
};
