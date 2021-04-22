const content = require('app/steps/grounds-for-divorce/respondent-consent/content.json').resources.en.translation.content;
const contentCy = require('app/steps/grounds-for-divorce/respondent-consent/content.json').resources.cy.translation.content;
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function selectRespondentConsentObtained(language = 'en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;

  I.seeInCurrentUrl('/about-divorce/reason-for-divorce/separated-2-years/respondent-consent');

  if (language === 'en') {
    I.checkOption(content.yes.label);
  } else {
    I.checkOption(contentCy.yes.label);
  }
  I.click(commonContent.continue);
}

module.exports = { selectRespondentConsentObtained };
