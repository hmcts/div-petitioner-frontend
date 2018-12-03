const content = require('app/steps/grounds-for-divorce/respondent-consent/content.json').resources.en.translation.content;

function selectRespondentConsentObtained() {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/separated-2-years/respondent-consent');
  I.checkOption(content.yes.label);
  I.navByClick('Continue');
}

module.exports = { selectRespondentConsentObtained };