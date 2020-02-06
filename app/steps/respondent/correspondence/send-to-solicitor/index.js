const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');

module.exports = class RespondentCorrespondenceSendToSolicitor extends ValidationStep {
  get url() {
    return '/petitioner-respondent/correspondence/send-to-solicitor';
  }
  get nextStep() {
    const respondentAddress = this.steps.RespondentCorrespondenceAddress;
    return { respondentSolicitorRepresented: { No: respondentAddress } };
  }

  constructor(steps, section, templatePath, content, schema) {
    super(steps, section, templatePath, content, schema);

    watch('respondentAskToUseHomeAddress', (previousSession, session, remove) => {
      if (session.respondentAskToUseHomeAddress === 'true') {
        remove('respondentSolicitorRepresented');
      }
    });
  }
};