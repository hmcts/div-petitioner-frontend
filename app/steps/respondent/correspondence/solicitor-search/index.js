const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');
const logger = require('app/services/logger').logger(__filename);

module.exports = class RespondentCorrespondenceSolicitorSearch extends ValidationStep {
  get url() {
    return '/petitioner-respondent/correspondence/solicitor-search';
  }

  get nextStep() {
    return this.steps.LiveTogether;
  }

  constructor(steps, section, templatePath, content, schema) {
    super(steps, section, templatePath, content, schema);

    watch('respondentSolicitorCompany', (previousSession, session) => {
      logger.infoWithReq(null, '', `${session.respondentSolicitorCompany} values changed`);
    });
  }
};
