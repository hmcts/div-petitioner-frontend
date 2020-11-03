const content = require('app/steps/grounds-for-divorce/respondent-consent/content.json').resources.en.translation.content;
const contentCy = require('app/steps/grounds-for-divorce/respondent-consent/content.json').resources.cy.translation.content;

function selectRespondentConsentObtained() {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/separated-2-years/respondent-consent');
  I.checkOption(content.yes.label);
  I.navByClick('Continue');
}

async function selectRespondentConsentObtainedCy() {

  const I = this;
  const pagePath = await I.getCurrentPageUrl();
  I.seeInCurrentUrl(pagePath);
  I.checkOption(contentCy.yes.label);
  await I.navByClick('Parhau');
}

module.exports = { selectRespondentConsentObtained, selectRespondentConsentObtainedCy };
