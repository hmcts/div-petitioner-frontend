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
        remove('respondentSolicitorName', 'respondentSolicitorCompany', 'respondentSolicitorAddress');
      }
    });
  }
};
