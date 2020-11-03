const content = require('app/steps/grounds-for-divorce/respondent-consent/content.json').resources.en.translation.content;
const contentCy = require('app/steps/grounds-for-divorce/respondent-consent/content.json').resources.cy.translation.content;

function selectRespondentConsentObtained() {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/separated-2-years/respondent-consent');
  I.checkOption(content.yes.label);
  I.navByClick('Continue');
}

function selectRespondentConsentObtainedCy() {

  const I = this;

  I.seeInCurrentUrl('/about-divorce/reason-for-divorce/separated-2-years/respondent-consent');
  I.checkOption(contentCy.yes.label);
  I.navByClick('Parhau');
}

module.exports = { selectRespondentConsentObtained, selectRespondentConsentObtainedCy };
