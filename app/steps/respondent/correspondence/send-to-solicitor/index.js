const OptionStep = require('app/core/OptionStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');

module.exports = class RespondentCorrespondenceSendToSolicitor extends OptionStep {
  get url() {
    return '/petitioner-respondent/correspondence/send-to-solicitor';
  }
  get nextStep() {
    return {
      respondentCorrespondenceSendToSolicitor: {
        Yes: this.steps.RespondentSolicitorDetails,
        No: this.steps.RespondentCorrespondenceAddress
      }
    };
  }

  constructor(steps, section, templatePath, content, schema) {
    super(steps, section, templatePath, content, schema);

    watch('respondentAskToUseHomeAddress', (previousSession, session, remove) => {
      if (session.respondentAskToUseHomeAddress === 'true') {
        remove('respondentCorrespondenceSendToSolicitor');
      }
    });
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }
};
